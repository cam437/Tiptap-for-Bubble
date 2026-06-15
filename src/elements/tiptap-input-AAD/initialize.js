try {
    // ── Debug helper ─────────────────────────────────────────────────────────
    instance.data.debug = function (...args) {
        if (instance.data._debug_mode) {
            console.log("[TiptapInput]", ...args);
        }
    };

    instance.data.editor_is_ready = false;
    instance.publishState("is_ready", false);
    instance.publishState("is_empty", true);
    instance.publishState("isFocused", false);
    instance.publishState("current_mentions", "[]");
    instance.publishState("current_query", "");
    instance.publishState("plain_text", "");
    instance.publishState("serialized_value", "");

    // ── Shared mention core ──────────────────────────────────────────────────
    const {
        initMentionState,
        makeCandidateUpdater,
        buildSuggestionConfig,
        buildMentionExtension,
        collectCurrentMentions,
    } = window.tiptapMentionCore;

    initMentionState(instance.data);
    instance.data._updateMentionCandidates = makeCandidateUpdater(instance.data);

    // ── Container ───────────────────────────────────────────────────────────
    instance.canvas.css({
        display: "flex",
        "flex-direction": "column",
        overflow: "hidden",
        padding: "0",
    });

    const randomId = (Math.random() + 1).toString(36).substring(3);
    instance.data.randomId = randomId;
    const editorId = "tiptapInput-" + randomId;
    instance.data.editorId = editorId;

    // ── Stylesheet ──────────────────────────────────────────────────────────
    const stylesheet = document.createElement("style");
    instance.canvas.append(stylesheet);
    instance.data.stylesheet = stylesheet;

    instance.data.applyStylesheet = function (properties) {
        const borderColor = properties.mention_border_color || "rgba(99,102,241,1)";
        const bgColor = properties.mention_background_color || "rgba(238,242,255,1)";
        stylesheet.innerHTML = `
#${editorId} {
    width: 100%;
    box-sizing: border-box;
    font-size: ${properties.bubble.font_size()};
    color: ${properties.bubble.font_color()};
    font-family: ${properties.bubble.font_face().match(/^(.*?):/)[1]};
}
#${editorId} .ProseMirror {
    outline: none;
    min-height: 1.4em;
    width: 100%;
    box-sizing: border-box;
    white-space: pre-wrap;
    word-break: break-word;
}
#${editorId} .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: #a1a1aa;
    pointer-events: none;
    float: left;
    height: 0;
}
#${editorId} .ProseMirror .mention {
    border: 1px solid ${borderColor};
    background-color: ${bgColor};
    border-radius: 0.4rem;
    padding: 0.1rem 0.3rem;
    box-decoration-break: clone;
    white-space: nowrap;
    cursor: pointer;
}
.mention-list {
    background: #fff;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    overflow-y: auto;
    max-height: 200px;
    min-width: 180px;
    padding: 0.25rem;
}
.mention-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 0.35rem 0.6rem;
    border: none;
    background: none;
    border-radius: 0.35rem;
    cursor: pointer;
    text-align: left;
    gap: 0.1rem;
}
.mention-item.is-selected, .mention-item:hover {
    background: #f4f4f5;
}
.mention-item__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #18181b;
}
.mention-item__sublabel {
    font-size: 0.75rem;
    color: #71717a;
}
.mention-item--empty {
    padding: 0.5rem 0.6rem;
    color: #a1a1aa;
    font-size: 0.875rem;
}
`;
    };

    // ── Editor setup ────────────────────────────────────────────────────────
    instance.data.setupEditor = function (properties) {
        if (instance.data.isEditorSetup) return;
        instance.data.isEditorSetup = true;

        const {
            Editor,
            Extension,
            mergeAttributes,
            Document,
            HardBreak,
            Paragraph,
            Text,
            Placeholder,
            Mention,
        } = window.tiptap;

        // Publish initial stylesheet
        instance.data.applyStylesheet(properties);

        // ── Build editor DOM ─────────────────────────────────────────────
        const editorEl = document.createElement("div");
        editorEl.id = editorId;
        instance.canvas.append(editorEl);

        // ── Enter-to-submit extension ────────────────────────────────────
        // Enter fires submit; Shift+Enter inserts a hard break (newline).
        const SubmitOnEnter = Extension.create({
            name: "submitOnEnter",
            addKeyboardShortcuts() {
                return {
                    Enter: () => {
                        // Let mention popup handle Enter if it is open
                        if (instance.data._mentionComponent) return false;

                        const plainText = this.editor.getText({ blockSeparator: "\n" });
                        const serialized = this.editor.getHTML();
                        const mentionsJson = collectCurrentMentions(this.editor.state.doc);

                        instance.publishState("plain_text", plainText);
                        instance.publishState("serialized_value", serialized);
                        instance.publishState("current_mentions", mentionsJson);
                        instance.triggerEvent("submit");

                        // Clear content after submit
                        this.editor.commands.clearContent(true);
                        return true;
                    },
                };
            },
        });

        // ── Build extensions ──────────────────────────────────────────────
        const extensions = [Document, Paragraph, Text, HardBreak, SubmitOnEnter];

        if (properties.placeholder) {
            extensions.push(
                Placeholder.configure({
                    placeholder: properties.placeholder || "Type a message…",
                })
            );
        }

        if (properties.ext_mention) {
            const triggerChar = properties.trigger_char || "@";
            const suggestionConfig = buildSuggestionConfig({
                instance,
                instanceData: instance.data,
                tippy: window.tiptap.tippy,
                triggerChar,
            });
            extensions.push(
                buildMentionExtension({ Mention, mergeAttributes, triggerChar, suggestionConfig })
            );
        }

        // ── Create editor ──────────────────────────────────────────────
        const initialContent = properties.initialContent || "";

        instance.data.editor = new Editor({
            element: editorEl,
            editable: properties.isEditable !== false,
            content: initialContent,
            extensions,
            injectCSS: true,

            onCreate({ editor }) {
                instance.data.editor_is_ready = true;
                instance.publishState("is_ready", true);
                instance.publishState("is_empty", editor.isEmpty);
                instance.publishState("plain_text", editor.getText({ blockSeparator: "\n" }));
                instance.publishState("serialized_value", editor.getHTML());
                if (properties.ext_mention) {
                    instance.publishState("current_mentions", collectCurrentMentions(editor.state.doc));
                    instance.publishState("current_query", "");
                }
                instance.triggerEvent("is_ready");
            },

            onUpdate({ editor }) {
                instance.publishState("is_empty", editor.isEmpty);
                instance.publishState("plain_text", editor.getText({ blockSeparator: "\n" }));
                instance.publishState("serialized_value", editor.getHTML());
                if (properties.ext_mention) {
                    instance.publishState("current_mentions", collectCurrentMentions(editor.state.doc));
                }
            },

            onTransaction({ editor }) {
                instance.publishState("is_empty", editor.isEmpty);
                if (properties.ext_mention) {
                    instance.publishState("current_mentions", collectCurrentMentions(editor.state.doc));
                }
            },

            onFocus() {
                instance.publishState("isFocused", true);
                instance.triggerEvent("isFocused");
            },

            onBlur() {
                instance.publishState("isFocused", false);
                instance.triggerEvent("isntFocused");
            },
        });
    };

    instance.data.isEditorSetup = false;

} catch (error) {
    console.error("[TiptapInput] error in initialize:", error);
}
