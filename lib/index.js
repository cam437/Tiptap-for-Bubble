import { CommentExtension } from '@sereneinserenade/tiptap-comment-extension';

window.tiptapComment = CommentExtension;

// ── Shared Mention Core ───────────────────────────────────────────────────────
//
// Single source of truth for the mention extension config, suggestion popup
// renderer (with async candidate handling), candidate contract, mention_inserted
// event, current_mentions recompute, and serialization rules.
//
// Both tiptap-AAC and tiptap-input import this via window.tiptapMentionCore.
//
// TipTap objects (Mention, mergeAttributes, tippy) are NOT imported here —
// they come from the already-loaded main bundle (window.tiptap) and are passed
// as parameters to avoid bundling duplication.
// ─────────────────────────────────────────────────────────────────────────────

function _debounce(fn, ms) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
    };
}

/**
 * MentionList — vanilla DOM suggestion popup list.
 *
 * Constructor params:
 *   props        — TipTap suggestion props (items, command, range, clientRect)
 *   editor       — TipTap editor instance
 *   instanceData — Bubble element's instance.data
 *   instanceRef  — Bubble element's instance (for publishState / triggerEvent)
 */
class MentionList {
    constructor({ props, editor, instanceData, instanceRef }) {
        this.items = props.items || [];
        this.command = props.command;
        this.range = props.range;
        this.editor = editor;
        this.selectedIndex = 0;
        this.instanceData = instanceData;
        this.instanceRef = instanceRef;
        // _candidatesEverReceived tracks whether _updateMentionCandidates has
        // been called at least once for this popup session. Until it has, an
        // empty list means "waiting for Bubble" not "no results".
        this._candidatesEverReceived = (instanceData._mentionCandidates || []).length > 0;
        this._buildElement();
        this._redraw();
    }

    _buildElement() {
        this.element = document.createElement('div');
        this.element.className = 'mention-list mention-list_' + this.instanceData.randomId;
        this.element.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-idx]');
            if (btn) {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                this.selectItem(idx);
            }
        });
    }

    updateItems(newItems) {
        this.items = newItems || [];
        this.selectedIndex = 0;
        this._candidatesEverReceived = true;
        this._redraw();
    }

    updateProps(props) {
        this.range = props.range;
        this.editor = props.editor;
        if (props.items) {
            this.items = props.items;
            this._redraw();
        }
    }

    _redraw() {
        this.element.innerHTML = '';
        if (!this.items.length) {
            const empty = document.createElement('div');
            empty.className = 'mention-item mention-item--empty';
            // Show "Loading…" until we know Bubble has responded at least once.
            // After that, an empty list genuinely means no matches.
            empty.textContent = this._candidatesEverReceived ? 'No results' : 'Loading\u2026';
            this.element.appendChild(empty);
            return;
        }
        const frag = document.createDocumentFragment();
        this.items.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mention-item' + (idx === this.selectedIndex ? ' is-selected' : '');
            btn.setAttribute('data-idx', idx);

            const main = document.createElement('span');
            main.className = 'mention-item__label';
            // textContent — never innerHTML — XSS-safe
            main.textContent = item.label || item.id || '';
            btn.appendChild(main);

            if (item.sublabel) {
                const sub = document.createElement('span');
                sub.className = 'mention-item__sublabel';
                sub.textContent = item.sublabel;
                btn.appendChild(sub);
            }
            frag.appendChild(btn);
        });
        this.element.appendChild(frag);
    }

    _setSelection(idx) {
        const prev = this.element.querySelector('.is-selected');
        if (prev) prev.classList.remove('is-selected');
        const next = this.element.children[idx];
        if (next) {
            next.classList.add('is-selected');
            next.scrollIntoView({ block: 'nearest' });
        }
        this.selectedIndex = idx;
    }

    selectItem(index) {
        const item = this.items[index];
        if (!item) return;
        // Use the suggestion command — TipTap handles the range insertion
        this.command({ id: item.id, label: item.label, type: item.type || null });
        // Publish mention_inserted states and fire event
        this.instanceRef.publishState('mention_id', item.id);
        this.instanceRef.publishState('mention_label', item.label);
        this.instanceRef.publishState('mention_type', item.type || '');
        this.instanceRef.triggerEvent('mention_inserted');
    }

    handleKeyDown(event) {
        const len = this.items.length;
        if (!len) return false;
        switch (event.key) {
            case 'ArrowUp': {
                this._setSelection((this.selectedIndex - 1 + len) % len);
                return true;
            }
            case 'ArrowDown': {
                this._setSelection((this.selectedIndex + 1) % len);
                return true;
            }
            case 'Enter':
            case 'Tab':
                this.selectItem(this.selectedIndex);
                return true;
        }
        return false;
    }
}

/**
 * buildSuggestionConfig — returns the TipTap suggestion config object.
 *
 * Handles async candidate flow:
 *  - items() returns the current cached candidates filtered by query (sync)
 *  - fires mention_query (debounced 150ms) so Bubble can fetch candidates
 *  - when Bubble updates `candidates`, update.js calls _updateMentionCandidates
 *    which pushes the new list into the live popup
 *
 * Params:
 *   instance    — Bubble element instance (has publishState / triggerEvent)
 *   instanceData — instance.data
 *   tippy       — tippy function from window.tiptap.tippy
 *   triggerChar — e.g. "@"
 */
function buildSuggestionConfig({ instance, instanceData, tippy, triggerChar }) {
    const fireMentionQuery = _debounce(() => {
        instance.triggerEvent('mention_query');
    }, 150);

    return {
        char: triggerChar,

        items: ({ query }) => {
            if (typeof query !== 'string') return [];

            instanceData._mentionCurrentQuery = query;
            instance.publishState('current_query', query);
            fireMentionQuery();

            const candidates = instanceData._mentionCandidates || [];
            const q = query.toLowerCase();
            return q
                ? candidates.filter((c) => c.label && c.label.toLowerCase().includes(q))
                : candidates;
        },

        render: () => {
            let popup, component, currentProps;

            // Reposition the tippy popup using the latest clientRect callback.
            // Called on scroll/resize so the popup tracks the cursor even when
            // the page or a Bubble scroll container moves under it.
            // capture:true catches scroll events on any ancestor, not just window.
            function reposition() {
                if (popup && currentProps && currentProps.clientRect) {
                    popup[0].setProps({ getReferenceClientRect: currentProps.clientRect });
                }
            }

            return {
                onStart: (props) => {
                    currentProps = props;
                    component = new MentionList({
                        props,
                        editor: props.editor,
                        instanceData,
                        instanceRef: instance,
                    });
                    instanceData._mentionComponent = component;

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                    instanceData._mentionPopup = popup;

                    window.addEventListener('scroll', reposition, true);
                    window.addEventListener('resize', reposition);
                },

                onUpdate: (props) => {
                    currentProps = props;
                    if (!props.clientRect) return;
                    component.updateProps(props);
                    popup[0].setProps({ getReferenceClientRect: props.clientRect });
                    popup[0].setContent(component.element);
                },

                onKeyDown: ({ event }) => {
                    if (event.key === 'Escape') {
                        popup[0].hide();
                        return true;
                    }
                    return component.handleKeyDown(event);
                },

                onExit: () => {
                    window.removeEventListener('scroll', reposition, true);
                    window.removeEventListener('resize', reposition);
                    popup[0].destroy();
                    component.element.remove();
                    instanceData._mentionComponent = null;
                    instanceData._mentionPopup = null;
                    instanceData._mentionCurrentQuery = '';
                    instance.publishState('current_query', '');
                },
            };
        },
    };
}

/**
 * buildMentionExtension — creates a TipTap Mention node extended with a `type`
 * attribute and custom renderHTML / renderText matching the serialization spec.
 *
 * Params:
 *   Mention         — base Mention Node from window.tiptap
 *   mergeAttributes — mergeAttributes helper from window.tiptap
 *   triggerChar     — e.g. "@"
 *
 * Returns the configured extension (pass to TipTap extensions array).
 */
function buildMentionExtension({ Mention, mergeAttributes, triggerChar, suggestionConfig }) {
    const MentionWithType = Mention.extend({
        // Override selectable to true so a click puts a node-selection on the chip.
        // atom: true is inherited from the parent config (not overridden here) which
        // ensures wholesale deletion and no orphaning.
        selectable: true,

        addAttributes() {
            return {
                ...this.parent?.(),
                type: {
                    default: null,
                    parseHTML: (el) => el.getAttribute('data-mention-type') || null,
                    renderHTML: (attrs) =>
                        attrs.type ? { 'data-mention-type': attrs.type } : {},
                },
            };
        },

        renderHTML({ node, HTMLAttributes }) {
            const char = triggerChar;
            const label = node.attrs.label ?? node.attrs.id ?? '';
            return [
                'span',
                mergeAttributes(
                    {
                        'data-type': 'mention',
                        'data-mention-id': node.attrs.id,
                        'data-label': label,
                    },
                    node.attrs.type ? { 'data-mention-type': node.attrs.type } : {},
                    { class: 'mention' },
                    HTMLAttributes
                ),
                // String literal — ProseMirror renders as text node, never innerHTML
                `${char}${label}`,
            ];
        },

        renderText({ node }) {
            return `${triggerChar}${node.attrs.label ?? node.attrs.id ?? ''}`;
        },
    });

    return MentionWithType.configure({
        deleteTriggerWithBackspace: true,
        suggestion: suggestionConfig,
    });
}

/**
 * collectCurrentMentions — scans a ProseMirror doc for mention nodes,
 * dedupes by id, preserves document order.
 *
 * Returns JSON string array: [{ id, label, type }]
 */
function collectCurrentMentions(doc) {
    const seen = new Set();
    const mentions = [];
    doc.descendants((node) => {
        if (node.type.name === 'mention') {
            const { id, label, type } = node.attrs;
            if (id && !seen.has(id)) {
                seen.add(id);
                mentions.push({ id, label: label || '', type: type || null });
            }
        }
    });
    return JSON.stringify(mentions);
}

/**
 * initMentionState — sets up the mention-related instance.data fields.
 * Call once at the start of initialize.js (before editor setup).
 */
function initMentionState(instanceData) {
    instanceData._mentionCandidates = [];
    instanceData._mentionCurrentQuery = '';
    instanceData._mentionComponent = null;
    instanceData._mentionPopup = null;
}

/**
 * makeCandidateUpdater — returns _updateMentionCandidates function.
 * Store on instanceData and call from update.js when `candidates` prop changes.
 */
function makeCandidateUpdater(instanceData) {
    return function updateMentionCandidates(candidatesJson) {
        let candidates = [];
        try { candidates = JSON.parse(candidatesJson || '[]'); } catch (_) {}
        instanceData._mentionCandidates = candidates;

        if (instanceData._mentionComponent) {
            const q = (instanceData._mentionCurrentQuery || '').toLowerCase();
            const filtered = candidates.filter(
                (c) => c.label && c.label.toLowerCase().includes(q)
            );
            instanceData._mentionComponent.updateItems(filtered);
            if (instanceData._mentionPopup) {
                instanceData._mentionPopup[0].setContent(instanceData._mentionComponent.element);
            }
        }
    };
}

window.tiptapMentionCore = {
    MentionList,
    buildSuggestionConfig,
    buildMentionExtension,
    collectCurrentMentions,
    initMentionState,
    makeCandidateUpdater,
};
