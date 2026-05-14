try {
    // Debug logging helper — only logs when debug_mode is enabled
    instance.data.debug = function (...args) {
        if (instance.data._debug_mode) {
            console.log("[Tiptap]", ...args);
        }
    };

    // add display: flex to main element
    instance.canvas.css("display", "flex");

    // this boolean turns true after the setup has been done, but the editor might not yet be initialized.
    // if the setup runs twice, it can add double initial data, etc.
    instance.data.isEditorSetup = false;

    // this boolean turns true when the editor is initialized and ready.
    instance.data.editor_is_ready = false;

    instance.publishState("is_ready", false);
    instance.publishState("is_empty", true);
    instance.publishState("can_undo", false);
    instance.publishState("can_redo", false);
    instance.publishState("collab_status", "disconnected");
    instance.publishState("collab_synced", false);
    instance.publishState("collab_connected_users", 0);

    //    instance.canvas.cfss({'overflow':'scroll'});

    instance.data.stylesheet = document.createElement("style");
    instance.canvas.append(instance.data.stylesheet);

    // Reusable function to populate the editor stylesheet.
    // Called from update.js on every property change and from the collab retry path.
    instance.data.applyStylesheet = function (properties) {
        instance.data.stylesheet.innerHTML = `
#tiptapEditor-${instance.data.randomId} {

    .ProseMirror {

        h1 {
            font-size: ${properties.h1_size};
            color: ${properties.h1_color};
            margin: ${properties.h1_margin};
            font-weight: ${properties.h1_font_weight};
            ${properties.h1_adv}
        }

		h2 {
            font-size: ${properties.h2_size};
            color: ${properties.h2_color};
            margin: ${properties.h2_margin};
            font-weight: ${properties.h2_font_weight};
            ${properties.h2_adv}
		}

		h3 {
            font-size: ${properties.h3_size};
            color: ${properties.h3_color};
            margin: ${properties.h3_margin};
            font-weight: ${properties.h3_font_weight};
            ${properties.h3_adv}
        }

		h4 {
            font-size: ${properties.h4_size};
            color: ${properties.h4_color};
            margin: ${properties.h4_margin};
            font-weight: ${properties.h4_font_weight};
            ${properties.h4_adv}
        }

        h5 {
            font-size: ${properties.h5_size};
            color: ${properties.h5_color};
            margin: ${properties.h5_margin};
            font-weight: ${properties.h5_font_weight};
            ${properties.h5_adv}
        }

        h6 {
            font-size: ${properties.h6_size};
            color: ${properties.h6_color};
            margin: ${properties.h6_margin};
            font-weight: ${properties.h6_font_weight};
            ${properties.h6_adv}
        }

        p {
            font-size: ${properties.bubble.font_size()};
            color: ${properties.bubble.font_color()};
            font-family: ${properties.bubble.font_face().match(/^(.*?):/)[1]};
            margin: 1rem 0;
            font-weight: 400;
            ${properties.p_adv}
		}

        p.is-editor-empty:first-child::before {
            color: ${properties.placeholder_color || "#a1a1aa"};
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }

        mark {
	        ${properties.mark_adv || ""}
        }

        a {
            text-decoration: underline;
            cursor: pointer;
            ${properties.link_adv}
        }

        a:link {
            color: ${properties.link_color};
            ${properties.link_unvisited_adv}
        }

        a:visited {
            color: ${properties.link_color_visited};
            ${properties.link_visited_adv}
        }

        a:focus {
	        ${properties.link_focus_adv}
        }

        a:hover {
            color: ${properties.link_color_hover};
            ${properties.link_hover_adv};
        }

	        a:active {
        }

        iframe {
	        ${properties.iframe}
        }

        img {
    	    ${properties.image_css}
        }

		blockquote {
        	${properties.blockquote_adv}
        }

        hr {
            ${properties.hr_adv || ""}
        }

        :not(pre) > code {
            ${properties.code_adv || ""}
        }

        pre {
            ${properties.codeblock_adv || ""}
        }

        sub {
            ${properties.sub_adv || ""}
        }

        sup {
            ${properties.sup_adv || ""}
        }

        [data-type="details"] {
            border: 1px solid #3F3F46;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 0.5rem 0;
            ${properties.details_adv || ""}
        }

        [data-type="details"] > button {
            cursor: pointer;
            font-weight: 600;
            padding: 0.25rem 0;
            background: none;
            border: none;
            font-size: 0.75rem;
        }

        [data-type="details"] > button::before {
            content: "►";
            display: inline-block;
            transition: transform 0.2s;
        }

        [data-type="details"].is-open > button::before {
            transform: rotate(90deg);
        }

        [data-type="details"] > div > [data-type="detailsSummary"] {
            display: inline;
            font-weight: 600;
            ${properties.details_summary_adv || ""}
        }

        [data-type="details"].is-open > div > [data-type="detailsContent"] {
            margin-top: 0.5rem;
        }

        .tiptap-invisible-character {
            ${properties.invisiblecharacters_adv || ""}
        }

		ul[data-type="taskList"] {
            list-style: none;
            padding: 0;
        }

		ul[data-type="taskList"] p {
        	margin: 0;
        }

		ul[data-type="taskList"] li {
        	display: flex;
        }

		ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
        }

		ul[data-type="taskList"] li > div {
        	flex: 1 1 auto;
        }

        ul[data-type="taskList"] li > label input[type="checkbox"] {
            ${properties.tasklist_checkbox_adv || ""}
        }

		ul:not([data-type="taskList"]) {
        	${properties.ul_adv}
        }

		ol {
        	${properties.ol_adv}
        }

		table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            text-indent: 0;
        }
		th, td {
            padding: ${properties.table_th_td_padding};
            text-align: start;
            border-bottom: ${properties.table_th_td_border_bottom} ${properties.table_row_border_color};
        }

		th {
            font-weight: ${properties.table_th_font_weight};
            text-align: left;
            background: ${properties.table_th_background};
        }

		th * {
            color: ${properties.table_header_font_color};
            font-weight: ${properties.table_th_font_weight};
        }

		tr:nth-of-type(odd) {
        	background: ${properties.table_zebra_background};
        }

        .tiptap-drag-handle {
          align-items: center;
          background: #1b1b20;
          border-radius: .25rem;
          border: 1px solid #3F3F46;
          cursor: grab;
          display: flex;
          height: 1.5rem;
          justify-content: center;
          width: 1.5rem;
          ${properties.draghandle_adv || ""}
        }

            ${properties.baseDiv || ""}

    }

    .ProseMirror .selection {
        background: rgba(255, 57, 134, 0.28);
        ${properties.ext_selection_css || ""}
    }

    .mention {
        border: 1px solid;
        border-color: ${properties.mention_border_color};
        background-color: ${properties.mention_background_color || "transparent"};
        border-radius: 0.4rem;
        padding: 0.1rem 0.3rem;
        box-decoration-break: clone;
    }

    .flourish-comment {
        background-color: rgba(255, 57, 134, 0.12);
        border-bottom: 2px solid #FF3986;
        border-radius: 2px;
        padding: 1px 2px;
        margin: 0 -2px;
        cursor: pointer;
        transition: background-color 0.15s ease, box-shadow 0.15s ease;
    }

    .flourish-comment:hover {
        background-color: rgba(255, 57, 134, 0.22);
        box-shadow: 0 0 0 1px rgba(255, 57, 134, 0.4);
    }

    .flourish-comment.flourish-comment-active {
        background-color: rgba(255, 57, 134, 0.28);
        box-shadow: 0 0 0 1px #FF3986;
    }

    .suggestions {
        border: 1px solid #3F3F46;
        background-color: #1b1b20;
        padding: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        border-radius: 4px;
        display: block;
        position: absolute;
        z-index: 1000;
    }

    .suggestion-item {
        padding: 8px 10px;
        cursor: pointer;
        list-style: none;
    }

    .suggestion-item:hover {
	    background-color: #2a2a31;
    }

    .suggestion {
        background-color: black;
        color: white;
    }
}

.selectedCell:after {
    z-index: 2;
    position: absolute;
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(255, 57, 134, 0.28);
    pointer-events: none;
}

.column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 4px;
    background-color: #FF3986;
    pointer-events: none;
}

.tableWrapper {
    overflow-x: auto;
}

.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
}

.collaboration-carets__caret {
    position: relative;
    margin-left: -1px;
    margin-right: -1px;
    border-left: 1px solid #f4f4f5;
    border-right: 1px solid #f4f4f5;
    word-break: normal;
    pointer-events: none;
}

.collaboration-carets__label {
    position: absolute;
    top: -1.4em;
    left: -1px;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    user-select: none;
    color: #f4f4f5;
    padding: 0.1rem 0.3rem;
    border-radius: 3px 3px 3px 0;
    white-space: nowrap;
    ${properties.collab_cursor_css || ""}
}

.items_${instance.data.randomId} {
    padding: 0.2rem;
    position: relative;
    border-radius: 0.5rem;
    background: #1b1b20;
    color: #f4f4f5;
    overflow: hidden;
    font-size: 0.9rem;
    box-shadow:
    0 0 0 1px #3F3F46,
    0px 10px 20px rgba(0, 0, 0, 0.3);

    .item {
        display: block;
        margin: 0;
        width: 100%;
        text-align: left;
        background: transparent;
        border-radius: 0.4rem;
        border: 1px solid transparent;
        padding: 0.2rem 0.4rem;

        &.is-selected {
        	border-color: #FF3986;
        }
    }
}

/* ── Toolbar styles ─────────────────────────────────────── */

#tiptapToolbar-${instance.data.randomId} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: #0D0A0F;
    border-bottom: 1px solid #3F3F46;
    flex-shrink: 0;
    user-select: none;
    z-index: 5;
}

#tiptapToolbar-${instance.data.randomId}.tiptap-toolbar-sticky {
    position: sticky;
    top: 0;
    z-index: 10;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-group {
    display: flex;
    align-items: center;
    gap: 1px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-divider {
    width: 1px;
    height: 20px;
    background: #3F3F46;
    margin: 0 4px;
    flex-shrink: 0;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #a1a1aa;
    cursor: pointer;
    position: relative;
    transition: background 0.12s, color 0.12s;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn:hover {
    background: rgba(255, 45, 123, 0.08);
    color: #f4f4f5;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn.is-active {
    background: rgba(255, 45, 123, 0.18);
    color: #FF2D7B;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn.is-disabled {
    opacity: 0.35;
    pointer-events: none;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn.is-dropdown-open {
    background: rgba(255, 45, 123, 0.12);
    color: #f4f4f5;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-heading-indicator {
    position: absolute;
    bottom: 1px;
    right: 1px;
    font-size: 8px;
    font-weight: 700;
    color: #a1a1aa;
    line-height: 1;
    pointer-events: none;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-btn.is-active .tiptap-heading-indicator {
    color: #FF2D7B;
}

/* ── Dropdown panels ── */

#tiptapToolbar-${instance.data.randomId} .tiptap-toolbar-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: #0D0A0F;
    border: 1px solid #3F3F46;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    z-index: 100;
    min-width: 160px;
    padding: 6px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-list {
    max-height: 240px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-list-item {
    display: block;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #f4f4f5;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-list-item:hover {
    background: rgba(255, 45, 123, 0.08);
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-list-item.is-active {
    background: rgba(255, 45, 123, 0.18);
    color: #FF2D7B;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-row {
    display: flex;
    gap: 6px;
    padding: 6px 0 0;
    align-items: center;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-input {
    flex: 1;
    padding: 5px 8px;
    border: 1px solid #3F3F46;
    border-radius: 4px;
    background: #1a1520;
    color: #f4f4f5;
    font-size: 13px;
    outline: none;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-input:focus {
    border-color: #FF2D7B;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-btn {
    padding: 5px 12px;
    border: none;
    border-radius: 4px;
    background: #FF2D7B;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-btn:hover {
    background: #e0266d;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-btn-secondary {
    background: #3F3F46;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-dropdown-btn-secondary:hover {
    background: #52525b;
}

/* ── Color picker ── */

#tiptapToolbar-${instance.data.randomId} .tiptap-color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    padding-bottom: 6px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #3F3F46;
    cursor: pointer;
    padding: 0;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-color-swatch:hover {
    border-color: #f4f4f5;
    transform: scale(1.15);
}

#tiptapToolbar-${instance.data.randomId} .tiptap-color-input {
    width: 32px;
    height: 28px;
    padding: 0;
    border: 1px solid #3F3F46;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
}

/* ── Table grid selector ── */

#tiptapToolbar-${instance.data.randomId} .tiptap-grid-label {
    text-align: center;
    color: #a1a1aa;
    font-size: 12px;
    padding-bottom: 6px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-table-grid {
    display: grid;
    gap: 3px;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-grid-cell {
    width: 22px;
    height: 22px;
    border: 1px solid #3F3F46;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.1s, border-color 0.1s;
}

#tiptapToolbar-${instance.data.randomId} .tiptap-grid-cell:hover,
#tiptapToolbar-${instance.data.randomId} .tiptap-grid-cell.is-active {
    background: rgba(255, 45, 123, 0.18);
    border-color: #FF2D7B;
}

/* ── Heading dropdown ── */

#tiptapToolbar-${instance.data.randomId} .tiptap-heading-list .tiptap-dropdown-list-item {
    font-weight: 400;
}

${properties.toolbar_adv || ""}

`;
    };

    // function to find the nearest parent.
    // useful when Tiptap is used inside a repeating group
    function findElement(elementID) {
        let $parent = instance.canvas.parent();
        while ($parent.length > 0) {
            var $foundMenu = $parent.find("#" + elementID);

            if ($foundMenu.length > 0) {
                return $foundMenu[0];
            }

            $parent = $parent.parent();
        }
    }
    instance.data.findElement = findElement;

    instance.data.isProgrammaticUpdate = false;
    instance.data.delay = 300;

    instance.data.debounce = function debounce(cb, delay = instance.data.delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout); // Clear the existing timeout
            timeout = setTimeout(() => {
                cb(...args);
            }, instance.data.delay);
            instance.data.debounceTimeout = timeout; // Store the timeout ID
        };
    };

    instance.data.isDebouncingDone = true;
    instance.data.updateContent = instance.data.debounce((content) => {
        instance.data.debug("debounce done, updating content");
        instance.publishAutobinding(content);
        instance.triggerEvent("contentUpdated");
        instance.data.isDebouncingDone = true;
    }, instance.data.delay);

    // throttle function: to take it easy on the autobinding.
    // 1. writes to autobinding
    // 2. then waits a certain delay
    // 3. then writes again if the user created more changes
    // source: from https://blog.webdevsimplified.com/2022-03/debounce-vs-throttle

    function throttle(mainFunction, delay = 2000) {
        let timerFlag = null; // Variable to keep track of the timer

        // Returning a throttled version
        return (...args) => {
            if (timerFlag === null) {
                // If there is no timer currently running
                mainFunction(...args); // Execute the main function
                timerFlag = setTimeout(() => {
                    // Set a timer to clear the timerFlag after the specified delay
                    mainFunction(...args);
                    timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
                }, delay);
            }
        };
    }
    instance.data.throttle = throttle;

    instance.data.throttledContentUpdated = instance.data.throttle(() => {
        instance.triggerEvent("contentUpdated");
        // console.log("getHTML", instance.data.editor.getHTML());
        instance.data.throttle(instance.publishAutobinding(instance.data.editor.getHTML()));
    });

    function returnAndReportErrorIfEditorNotReady(errorFragment = "error") {
        const message = "Tried to run " + errorFragment + " before editor was ready. Crash prevented. Returning";
        instance.data.debug(message);
        context.reportDebugger(message);
        return;
    }
    instance.data.returnAndReportErrorIfEditorNotReady = returnAndReportErrorIfEditorNotReady;

    // Helper to set initial content on a new (empty) collab document.
    // Called from both the provider's onSynced and the editor's onCreate,
    // because either can fire first depending on network timing.
    instance.data.maybeSetCollabInitialContent = function () {
        if (!instance.data.collabHasSynced) return;
        if (!instance.data.editor_is_ready) return;
        if (!instance.data.collabInitialContent) return;
        if (instance.data.collabInitialContentSet) return;

        if (instance.data.editor.isEmpty) {
            instance.data.debug("collab document is empty after sync — setting initial content");
            instance.data.collabInitialContentSet = true;
            instance.data.editor.commands.setContent(instance.data.collabInitialContent);
        } else {
            instance.data.collabInitialContentSet = true; // prevent further checks
        }
    };

    // Helper to publish collab status as a state and fire the status changed event
    instance.data.publishCollabStatus = function (status) {
        instance.data.debug("collab status:", status);
        instance.publishState("collab_status", status);
        instance.triggerEvent("collab_status_changed");
    };

    // ── Collab auth-failure retry mechanism ──────────────────
    // When authentication fails (e.g. JWT not yet valid on server), tear down
    // the editor + provider and let the next update() cycle re-create everything.
    instance.data._collabRetryCount = 0;
    const COLLAB_MAX_RETRIES = 5;
    const COLLAB_RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // exponential backoff

    instance.data.teardownEditor = function (reason) {
        instance.data.debug("tearing down editor:", reason);

        // Clear the collab sync polling interval
        if (instance.data._collabSyncPollInterval) {
            clearInterval(instance.data._collabSyncPollInterval);
            instance.data._collabSyncPollInterval = null;
        }

        // Clear any pending collab retry timer
        if (instance.data._collabRetryTimer) {
            clearTimeout(instance.data._collabRetryTimer);
            instance.data._collabRetryTimer = null;
        }

        // Clear debounce timeout
        if (instance.data.debounceTimeout) {
            clearTimeout(instance.data.debounceTimeout);
            instance.data.debounceTimeout = null;
        }

        // Tear down provider (if in collab mode)
        if (instance.data.provider) {
            try {
                instance.data.provider.destroy();
            } catch (e) {
                instance.data.debug("error destroying provider:", e);
            }
            instance.data.provider = null;
        }

        // Tear down editor
        if (instance.data.editor) {
            try {
                instance.data.editor.destroy();
            } catch (e) {
                instance.data.debug("error destroying editor:", e);
            }
            instance.data.editor = null;
        }

        // Remove toolbar DOM so it gets rebuilt on re-setup
        if (instance.data.toolbarEl) {
            closeActiveDropdown(instance);
            instance.data.toolbarEl.remove();
            instance.data.toolbarEl = null;
            instance.data.toolbarButtonMap = null;
        }

        // Remove the editor DOM element so setupEditor can recreate it
        const editorEl = document.getElementById(instance.data.tiptapEditorID);
        if (editorEl) editorEl.remove();

        // Reset collab state
        instance.data.collabHasSynced = false;
        instance.data.collabInitialContentSet = false;
        instance.data._collabRetryCount = 0;
        instance.data._collabRetryPending = false;
        instance.data._currentCollabDocId = null;

        // Reset flags for re-initialization
        instance.data.isEditorSetup = false;
        instance.data.editor_is_ready = false;

        // Publish states - reset to initial values
        instance.publishState("is_ready", false);
        instance.publishState("is_empty", true);
        instance.publishState("can_undo", false);
        instance.publishState("can_redo", false);
        instance.publishState("collab_synced", false);
        instance.publishState("collab_connected_users", 0);
        instance.data.publishCollabStatus("disconnected");
    };

    instance.data.handleCollabAuthFailure = function (providerLabel, reason) {
        instance.data._collabRetryCount++;
        const attempt = instance.data._collabRetryCount;
        const message =
            providerLabel +
            " authentication failed (attempt " +
            attempt +
            "/" +
            COLLAB_MAX_RETRIES +
            "): " +
            reason;
        instance.data.debug(message);
        console.warn("[Tiptap]", message);

        if (attempt >= COLLAB_MAX_RETRIES) {
            const giveUpMsg =
                providerLabel +
                " authentication failed after " +
                COLLAB_MAX_RETRIES +
                " attempts. Giving up. Please check your JWT token configuration.";
            instance.data.debug(giveUpMsg);
            context.reportDebugger(giveUpMsg);
            return;
        }

        // Use shared teardown
        instance.data.teardownEditor("collab auth failure, attempt " + attempt);

        // Schedule a re-trigger after a backoff delay.
        // We call setupEditor directly because publishState does not trigger update() in Bubble.
        const delay = COLLAB_RETRY_DELAYS[attempt - 1] || COLLAB_RETRY_DELAYS[COLLAB_RETRY_DELAYS.length - 1];
        instance.data.debug("scheduling collab retry in " + delay + "ms");
        instance.data._collabRetryPending = true;
        instance.data._collabRetryTimer = setTimeout(() => {
            instance.data._collabRetryPending = false;
            instance.data.debug("collab retry timer fired — re-running setupEditor");
            instance.data.publishCollabStatus("retrying");
            if (instance.data._lastProperties && instance.data._lastContext) {
                instance.data.setupEditor(instance.data._lastProperties, instance.data._lastContext);
                instance.data.applyStylesheet(instance.data._lastProperties);
            }
        }, delay);
    };

    function maybeSetupCollaboration(instance, properties, options, extensions) {
        if (properties.collab_active === false) return;
        instance.data.debug("collaboration is active, provider:", properties.collabProvider);
        // Store initial content before removing — used to populate new (empty) collab documents
        instance.data.collabInitialContent = options.content;
        instance.data.collabHasSynced = false;
        instance.data.collabInitialContentSet = false;
        // removes initialContent -- normally a collab document will have some document in the cloud.
        delete options.content;

        if (!properties.collab_active) {
            instance.data.debug("collab is not active");
            return;
        }
        if (properties.collabProvider === "liveblocks") {
            setupLiveblocks(extensions, properties);
            return;
        }

        if (properties.collabProvider === "tiptap") {
            setupTiptapCloud(extensions, properties);
            return;
        }

        if (properties.collabProvider === "custom") {
            setupCustomHocuspocus(extensions, properties);
            return;
        }
    }
    instance.data.maybeSetupCollaboration = maybeSetupCollaboration;

    function setupCustomHocuspocus(extensions, properties) {
        instance.data.debug("setting up custom Hocuspocus collab");
        const { HocuspocusProvider, Collaboration, CollaborationCaret, Y } = window.tiptap;
        if (!properties.collab_url.endsWith("/")) {
            properties.collab_url += "/";
        }

        const custom_url = properties.collab_url + properties.collab_app_id;
        instance.data.debug("custom collab URL:", custom_url, "doc:", properties.collab_doc_id);
        try {
            instance.data.provider = new HocuspocusProvider({
                url: custom_url,
                name: properties.collab_doc_id,
                token: properties.collab_jwt,
                onStatus: ({ status }) => {
                    instance.data.publishCollabStatus(status);
                },
                onConnect() {
                    instance.data.publishCollabStatus("connected");
                },
                onAuthenticated() {
                    instance.data.debug("custom collab authenticated");
                    instance.data._collabRetryCount = 0; // reset on success
                },
                onAuthenticationFailed: ({ reason }) => {
                    instance.data.handleCollabAuthFailure("Custom collab", reason);
                },
                onSynced: () => {
                    instance.data.debug("custom collab synced");
                    instance.data.collabHasSynced = true;
                    instance.publishState("collab_synced", true);
                    instance.triggerEvent("collab_synced");
                    instance.data.maybeSetCollabInitialContent();
                },
                onDisconnect: () => {
                    instance.data.publishCollabStatus("disconnected");
                    instance.publishState("collab_synced", false);
                    instance.data.collabHasSynced = false;
                },
                onDestroy() {
                    instance.data.debug("custom collab destroyed");
                },
                onAwarenessChange: ({ states }) => {
                    instance.publishState("collab_connected_users", states.length);
                },
                onStateless: ({ payload }) => {
                    instance.data.debug("custom collab stateless message:", payload);
                },
            });

            // Also register synced handler via .on() as backup
            instance.data.provider.on("synced", () => {
                instance.data.collabHasSynced = true;
                instance.publishState("collab_synced", true);
                instance.data.maybeSetCollabInitialContent();
            });

            extensions.push(
                Collaboration.configure({
                    document: instance.data.provider.document,
                }),
                CollaborationCaret.configure({
                    provider: instance.data.provider,
                }),
            );
            instance.data.debug("custom Hocuspocus provider created successfully");
        } catch (error) {
            const message = "Error setting up custom collab: ";
            context.reportDebugger(message + error);
            console.error("[Tiptap]", message, error);
        }
        return;
    }

    function setupTiptapCloud(extensions, properties) {
        instance.data.debug("setting up Tiptap Cloud collab");

        const { HocuspocusProvider, Collaboration, CollaborationCaret } = window.tiptap;
        const url = `wss://${properties.collab_app_id}.collab.tiptap.cloud`;
        instance.data.debug("Tiptap Cloud URL:", url, "doc:", properties.collab_doc_id);
        try {
            instance.data.provider = new HocuspocusProvider({
                url: url,
                name: properties.collab_doc_id,
                token: properties.collab_jwt,
                onConnect: () => {
                    instance.data.publishCollabStatus("connected");
                },
                onAuthenticated: () => {
                    instance.data.debug("Tiptap Cloud authenticated");
                    instance.data._collabRetryCount = 0; // reset on success
                },
                onAuthenticationFailed: ({ reason }) => {
                    instance.data.handleCollabAuthFailure("Tiptap Cloud", reason);
                },
                onStatus: ({ status }) => {
                    instance.data.publishCollabStatus(status);
                },
                onSynced: () => {
                    instance.data.debug("Tiptap Cloud synced");
                    instance.data.collabHasSynced = true;
                    instance.publishState("collab_synced", true);
                    instance.triggerEvent("collab_synced");
                    instance.data.maybeSetCollabInitialContent();
                },
                onDisconnect: () => {
                    instance.data.publishCollabStatus("disconnected");
                    instance.publishState("collab_synced", false);
                    instance.data.collabHasSynced = false;
                },
                onAwarenessChange: ({ states }) => {
                    instance.publishState("collab_connected_users", states.length);
                },
            });

            // Also register synced handler via .on() as backup
            instance.data.provider.on("synced", () => {
                instance.data.collabHasSynced = true;
                instance.publishState("collab_synced", true);
                instance.data.maybeSetCollabInitialContent();
            });

            instance.data.debug("Tiptap Cloud provider created successfully");
        } catch (error) {
            const message = "Error setting up Tiptap Cloud collab: ";
            context.reportDebugger(message + error);
            console.error("[Tiptap]", message, error);
        }

        extensions.push(
            Collaboration.configure({
                document: instance.data.provider.document,
            }),
            CollaborationCaret.configure({
                provider: instance.data.provider,
            }),
        );

        return;
    }

    function setupLiveblocks(extensions, properties) {
        instance.data.debug("setting up collab with Liveblocks");
        if (!properties.liveblocksPublicApiKey) {
            context.reportDebugger("Liveblocks is selected but there's no plublic API key");
            return;
        }

        const { createClient, LiveblocksProvider, Collaboration, CollaborationCaret, Y } = window.tiptap;

        try {
            const client = createClient({
                publicApiKey: properties.liveblocksPublicApiKey,
            });

            const { room, leave } = client.enterRoom(properties.collab_doc_id, {
                initialPresence: {},
            });

            const yDoc = new Y.Doc();
            const Text = yDoc.getText("tiptap");
            const Provider = new LiveblocksProvider(room, yDoc);

            extensions.push(
                Collaboration.configure({
                    document: yDoc,
                }),
                CollaborationCaret.configure({
                    provider: Provider,
                }),
            );
        } catch (error) {
            context.reportDebugger("There was an error setting up Liveblocks. " + error);
        }

        return extensions;
    }
    instance.data.setupLiveblocks = setupLiveblocks;
} catch (error) {
    console.error("[Tiptap] error in initialize:", error);
}

// MentionList
instance.data.MentionList = class MentionList {
    constructor(stuff) {
        const { props, editor } = stuff;
        this.items = props.items;
        this.command = props.command;
        this.selectedIndex = 0;
        this.randomId = props.randomId;
        this.editor = editor;
        this.initElement();
        this.updateItems(this);
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.className = "items_" + this.randomId;

        this.element.addEventListener("click", this.handleClick.bind(this));
        this.element.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleClick(event) {
        const target = event.target.closest(".item");
        const index = Array.from(this.element.children).indexOf(target);
        if (index !== -1) {
            this.selectItem(index);
            this.updateSelection(index);
        }
    }

    updateItems(props) {
        this.items = props.items;
        this.selectedIndex = 0;
        this.redraw();
    }

    updateProps(props) {
        this.range = props.range;
        this.editor = props.editor;
    }

    redraw() {
        this.element.innerHTML = "";
        const fragment = document.createDocumentFragment();

        this.items.forEach((item, index) => {
            const button = document.createElement("button");
            button.textContent = item.label;
            button.className = "item" + (index === this.selectedIndex ? " is-selected" : "");
            fragment.appendChild(button);
        });

        this.element.appendChild(fragment);
    }

    selectItem(index) {
        const item = this.items[index];
        const editor = this.editor;
        const range = this.range;

        if (item && range) {
            editor.commands.insertContentAt(range, {
                type: "mention",
                attrs: {
                    label: item.label,
                    id: item.id,
                },
            });
            editor.commands.insertContent(" ");
            editor.commands.setTextSelection(range.from + 1);
        } else {
            this.command(item);
        }
    }

    updateSelection(index) {
        const previouslySelected = this.element.querySelector(".is-selected");
        if (previouslySelected) previouslySelected.classList.remove("is-selected");

        const newSelected = this.element.children[index];
        if (newSelected) newSelected.classList.add("is-selected");

        this.selectedIndex = index;
    }

    handleKeyDown(event) {
        switch (event.key) {
            case "ArrowUp":
                this.moveSelection(-1);
                event.preventDefault();
                break;
            case "ArrowDown":
                this.moveSelection(1);
                event.preventDefault();
                break;
            case "Enter":
                this.selectItem(this.selectedIndex);
                event.preventDefault();
                break;
            case "Tab":
                this.selectItem(this.selectedIndex);
                event.preventDefault();
                break;
        }
    }

    moveSelection(direction) {
        const itemLength = this.items.length;
        const newIndex = (this.selectedIndex + direction + itemLength) % itemLength;
        this.updateSelection(newIndex);
        this.redraw();
    }
};

function configureSuggestion(instance, properties) {
    return {
        char: properties.mention_triggerChar || "@",
        items: ({ query }) => {
            if (typeof query !== "string") {
                // console.log("thing passed to Mention is not a string, returning. Typeof query: ", typeof query);
                return [];
            }
            const length = properties.mention_list.length();
            const source_list = properties.mention_list.get(0, length);
            const mention_list = source_list.map((item) => {
                return {
                    label: item.get(properties.mention_field_label),
                    id: item.get(properties.mention_field_id),
                };
            });
            // console.log("mention_list", mention_list);
            const query_result = mention_list.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

            return query_result;
        },

        render: () => {
            let popup, component;

            return {
                onStart: (props) => {
                    props.randomId = instance.data.randomId;
                    component = new instance.data.MentionList({
                        props,
                        editor: props.editor,
                    });
                    popup = window.tiptap.tippy("body", {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: "manual",
                        placement: "bottom-start",
                    });
                },

                onUpdate: (props) => {
                    if (!props.clientRect) {
                        return;
                    }

                    component.updateProps(props);

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    });

                    const newItems = component.updateItems(props);
                    popup[0].setContent(newItems);
                },

                onKeyDown: ({ event, editor }) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        component.selectItem(component.selectedIndex);
                        return true;
                    }

                    return component.handleKeyDown(event);
                },

                onExit: () => {
                    popup[0].destroy();
                    component.element.remove();
                },
            };
        },
    };
}
instance.data.configureSuggestion = configureSuggestion;

instance.data.rgbToHex = function (colorString) {
    instance.data.debug("rgbToHex", colorString);

    // Regular expressions for RGB and RGBA
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/;

    let match = colorString.match(rgbRegex) || colorString.match(rgbaRegex);

    if (!match) {
        console.error('Invalid color string format. Expected "rgb(r, g, b)" or "rgba(r, g, b, a)"');
        return null;
    }

    // Convert the extracted values to integers
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    // Handle alpha if present (for RGBA)
    let a = match[4] ? parseFloat(match[4]) : 1;

    // Ensure the values are within the valid range
    const clamp = (val) => Math.min(255, Math.max(0, val));

    // Convert to hex and pad with zeros if necessary
    const toHex = (val) => clamp(val).toString(16).padStart(2, "0");

    // Combine the hex values
    let hex = "#" + toHex(r) + toHex(g) + toHex(b);

    // Add alpha to hex if it's less than 1
    if (a < 1) {
        const alpha = Math.round(a * 255)
            .toString(16)
            .padStart(2, "0");
        hex += alpha;
    }

    return hex;
};

// Publish all formatting-related active states for the current cursor/selection.
// Called from both onTransaction and onSelectionUpdate to avoid duplication.
function publishActiveStates(editor) {
    instance.publishState("bold", editor.isActive("bold"));
    instance.publishState("italic", editor.isActive("italic"));
    instance.publishState("strike", editor.isActive("strike"));
    instance.publishState("h1", editor.isActive("heading", { level: 1 }));
    instance.publishState("h2", editor.isActive("heading", { level: 2 }));
    instance.publishState("h3", editor.isActive("heading", { level: 3 }));
    instance.publishState("h4", editor.isActive("heading", { level: 4 }));
    instance.publishState("h5", editor.isActive("heading", { level: 5 }));
    instance.publishState("h6", editor.isActive("heading", { level: 6 }));
    instance.publishState("body", !editor.isActive("heading"));
    instance.publishState("orderedList", editor.isActive("orderedList"));
    instance.publishState("bulletList", editor.isActive("bulletList"));
    instance.publishState("sinkListItem", editor.can().sinkListItem("listItem"));
    instance.publishState("liftListItem", editor.can().liftListItem("listItem"));
    instance.publishState("blockquote", editor.isActive("blockquote"));
    instance.publishState("codeBlock", editor.isActive("codeBlock"));
    instance.publishState("taskList", editor.isActive("taskList"));
    instance.publishState("taskItem", editor.isActive("taskItem"));
    instance.publishState("link", editor.isActive("link"));
    instance.publishState("url", editor.getAttributes("link").href);
    instance.publishState("align_left", editor.isActive({ textAlign: "left" }));
    instance.publishState("align_center", editor.isActive({ textAlign: "center" }));
    instance.publishState("align_right", editor.isActive({ textAlign: "right" }));
    instance.publishState("align_justified", editor.isActive({ textAlign: "justify" }));
    instance.publishState("highlight", editor.isActive("highlight"));
    instance.publishState("underline", editor.isActive("underline"));
    instance.publishState("table", editor.isActive("table"));
    instance.publishState("subscript", editor.isActive("subscript"));
    instance.publishState("superscript", editor.isActive("superscript"));
    instance.publishState("details", editor.isActive("details"));

    const textStyle = editor.getAttributes("textStyle");
    if (textStyle && textStyle.color) {
        const color = textStyle.color;
        try {
            const hexColor = instance.data.rgbToHex(color);
            instance.data.textStyleColor = hexColor;
        } catch (error) {
            console.warn(`Failed to convert color to hex: ${color}`, error);
            instance.data.textStyleColor = color; // Fallback to original color value
        }
    } else {
        instance.data.textStyleColor = "";
    }
    instance.publishState("color", instance.data.textStyleColor);

    if (textStyle && textStyle.fontFamily) {
        instance.publishState("font_family", textStyle.fontFamily);
    } else {
        instance.publishState("font_family", "");
    }

    if (textStyle && textStyle.fontSize) {
        instance.publishState("font_size", textStyle.fontSize);
    } else {
        instance.publishState("font_size", "");
    }
}
instance.data.publishActiveStates = publishActiveStates;

function findParentBlock(state, pos) {
    const $pos = state.doc.resolve(pos);
    for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);
        if (node.type.isBlock) {
            return { node, pos: $pos.before(depth), depth };
        }
    }
    return null;
}
instance.data.findParentBlock = findParentBlock;

function getSelection(editor) {
    const { state, view } = editor;
    const { from, to } = view.state.selection;
    const text = state.doc.textBetween(from, to, "");
    instance.publishState("selected_text", text);
    instance.publishState("from", from);
    instance.publishState("to", to);

    if (from === to) {
        // No selection, clear states
        instance.publishState("selectedContent", null);
        instance.publishState("selectedHTML", null);
        instance.publishState("selectedJSON", null);
        return;
    }

    try {
        const $from = state.doc.resolve(from);
        const $to = state.doc.resolve(to);
        let parentNode = $from.parent;
        let parentNodeType = parentNode.type.name;

        // Map ProseMirror node types to HTML tags
        const nodeTypeToHtmlTag = {
            paragraph: "p",
            heading: "h" + (parentNode.attrs.level || "1"), // h1, h2, etc.
            bulletList: "ul",
            orderedList: "ol",
            listItem: "li",
            blockquote: "blockquote",
            codeBlock: "pre",
            horizontalRule: "hr",
            table: "table",
            tableRow: "tr",
            tableCell: "td",
            tableHeader: "th",
        };

        const selectedNode = state.doc.slice(from, to);
        const selectedJSON = selectedNode.toJSON();
        const content = selectedJSON.content;

        // Use the same extensions the editor was built with
        const extensions = instance.data.editorExtensions;

        // Generate HTML from the JSON using the utility function
        let selectedHTML = window.tiptap.generateHTML({ type: "doc", content: content }, extensions);

        // If the selection is just text, wrap it with the appropriate HTML tag
        if (content.length === 1 && content[0].type === "text") {
            const htmlTag = nodeTypeToHtmlTag[parentNodeType] || "p";
            selectedHTML = `<${htmlTag}>${selectedHTML}</${htmlTag}>`;
        }

        instance.publishState("selectedContent", text);
        instance.publishState("selectedHTML", selectedHTML);
        instance.publishState("selectedJSON", JSON.stringify(selectedJSON));
    } catch (error) {
        console.error("Error generating JSON or HTML:", error);
    }
}
instance.data.getSelection = getSelection;

// ─────────────────────────────────────────────────────────────
// Toolbar — SVG icons, button definitions, build & dropdown system
// ─────────────────────────────────────────────────────────────

const SVG_BOLD = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>`;
const SVG_ITALIC = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>`;
const SVG_UNDERLINE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>`;
const SVG_STRIKE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`;
const SVG_SUBSCRIPT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/></svg>`;
const SVG_SUPERSCRIPT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/></svg>`;
const SVG_PALETTE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;
const SVG_HIGHLIGHTER = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`;
const SVG_TYPE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>`;
const SVG_FONTSIZE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><path d="M18 14v-1h4v1"/><path d="M19 17h2"/><path d="M20 14v3"/></svg>`;
const SVG_HEADING = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg>`;
const SVG_LIST = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`;
const SVG_LISTORDERED = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`;
const SVG_TASKLIST = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><line x1="13" x2="21" y1="6" y2="6"/><line x1="13" x2="21" y1="12" y2="12"/><line x1="13" x2="21" y1="18" y2="18"/></svg>`;
const SVG_INDENT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 3 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/></svg>`;
const SVG_OUTDENT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/></svg>`;
const SVG_QUOTE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>`;
const SVG_CODE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
const SVG_MINUS = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`;
const SVG_DETAILS = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const SVG_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
const SVG_YOUTUBE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>`;
const SVG_TABLE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
const SVG_LINK = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const SVG_UNLINK = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" x2="8" y1="2" y2="5"/><line x1="2" x2="5" y1="8" y2="8"/><line x1="16" x2="16" y1="19" y2="22"/><line x1="19" x2="22" y1="16" y2="16"/></svg>`;
const SVG_ALIGN_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>`;
const SVG_ALIGN_CENTER = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>`;
const SVG_ALIGN_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>`;
const SVG_ALIGN_JUSTIFY = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>`;
const SVG_COMMENT = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`;
const SVG_COMMENT_X = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/></svg>`;
const SVG_UNDO = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`;
const SVG_REDO = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`;
const SVG_PILCROW = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>`;

const TOOLBAR_GROUP_ORDER = ["text","color","font","headings","lists","blocks","insert","links","alignment","comments","history","other"];

const TOOLBAR_BUTTONS = [
    // ── Text formatting ──
    { group: "text", cmd: "bold", ext: "bold", icon: SVG_BOLD, tooltip: "Bold",
      action: (ed) => ed.chain().focus().toggleBold().run(),
      isActive: (ed) => ed.isActive("bold") },
    { group: "text", cmd: "italic", ext: "italic", icon: SVG_ITALIC, tooltip: "Italic",
      action: (ed) => ed.chain().focus().toggleItalic().run(),
      isActive: (ed) => ed.isActive("italic") },
    { group: "text", cmd: "underline", ext: "underline", icon: SVG_UNDERLINE, tooltip: "Underline",
      action: (ed) => ed.chain().focus().toggleUnderline().run(),
      isActive: (ed) => ed.isActive("underline") },
    { group: "text", cmd: "strike", ext: "strike", icon: SVG_STRIKE, tooltip: "Strikethrough",
      action: (ed) => ed.chain().focus().toggleStrike().run(),
      isActive: (ed) => ed.isActive("strike") },
    { group: "text", cmd: "subscript", ext: "subscript", icon: SVG_SUBSCRIPT, tooltip: "Subscript",
      action: (ed) => ed.chain().focus().toggleSubscript().run(),
      isActive: (ed) => ed.isActive("subscript") },
    { group: "text", cmd: "superscript", ext: "superscript", icon: SVG_SUPERSCRIPT, tooltip: "Superscript",
      action: (ed) => ed.chain().focus().toggleSuperscript().run(),
      isActive: (ed) => ed.isActive("superscript") },

    // ── Color ──
    { group: "color", cmd: "textColor", ext: "color", icon: SVG_PALETTE, tooltip: "Text color",
      hasDropdown: "colorPicker",
      action: (ed, val) => val ? ed.chain().focus().setColor(val).run() : ed.chain().focus().unsetColor().run(),
      isActive: (ed) => !!ed.getAttributes("textStyle").color },
    { group: "color", cmd: "highlight", ext: "highlight", icon: SVG_HIGHLIGHTER, tooltip: "Highlight",
      hasDropdown: "colorPicker",
      action: (ed, val) => val ? ed.chain().focus().toggleHighlight({ color: val }).run() : ed.chain().focus().unsetHighlight().run(),
      isActive: (ed) => ed.isActive("highlight") },

    // ── Font ──
    { group: "font", cmd: "fontFamily", ext: "fontfamily", icon: SVG_TYPE, tooltip: "Font family",
      hasDropdown: "fontFamily",
      action: (ed, val) => val ? ed.chain().focus().setFontFamily(val).run() : ed.chain().focus().unsetFontFamily().run(),
      isActive: () => false },
    { group: "font", cmd: "fontSize", ext: "fontsize", icon: SVG_FONTSIZE, tooltip: "Font size",
      hasDropdown: "fontSize",
      action: (ed, val) => val ? ed.chain().focus().setFontSize(val).run() : ed.chain().focus().unsetFontSize().run(),
      isActive: () => false },

    // ── Headings ──
    { group: "headings", cmd: "heading", ext: "heading", icon: SVG_HEADING, tooltip: "Heading",
      hasDropdown: "headingLevel",
      action: (ed, level) => level ? ed.chain().focus().toggleHeading({ level }).run() : ed.chain().focus().setParagraph().run(),
      isActive: (ed) => ed.isActive("heading") },

    // ── Lists ──
    { group: "lists", cmd: "bulletList", ext: "bulletlist", icon: SVG_LIST, tooltip: "Bullet list",
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
      isActive: (ed) => ed.isActive("bulletList") },
    { group: "lists", cmd: "orderedList", ext: "orderedlist", icon: SVG_LISTORDERED, tooltip: "Ordered list",
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
      isActive: (ed) => ed.isActive("orderedList") },
    { group: "lists", cmd: "taskList", ext: "tasklist", icon: SVG_TASKLIST, tooltip: "Task list",
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
      isActive: (ed) => ed.isActive("taskList") },
    { group: "lists", cmd: "indent", ext: ["bulletlist", "orderedlist", "tasklist"], icon: SVG_INDENT, tooltip: "Indent",
      action: (ed) => ed.chain().focus().sinkListItem("listItem").run(),
      isActive: () => false,
      isEnabled: (ed) => ed.can().sinkListItem("listItem") },
    { group: "lists", cmd: "outdent", ext: ["bulletlist", "orderedlist", "tasklist"], icon: SVG_OUTDENT, tooltip: "Outdent",
      action: (ed) => ed.chain().focus().liftListItem("listItem").run(),
      isActive: () => false,
      isEnabled: (ed) => ed.can().liftListItem("listItem") },

    // ── Blocks ──
    { group: "blocks", cmd: "blockquote", ext: "blockquote", icon: SVG_QUOTE, tooltip: "Blockquote",
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
      isActive: (ed) => ed.isActive("blockquote") },
    { group: "blocks", cmd: "codeBlock", ext: "codeblock", icon: SVG_CODE, tooltip: "Code block",
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      isActive: (ed) => ed.isActive("codeBlock") },
    { group: "blocks", cmd: "horizontalRule", ext: "horizontalrule", icon: SVG_MINUS, tooltip: "Horizontal rule",
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
      isActive: () => false },
    { group: "blocks", cmd: "details", ext: "details", icon: SVG_DETAILS, tooltip: "Details / Accordion",
      action: (ed) => ed.chain().focus().setDetails().run(),
      isActive: (ed) => ed.isActive("details") },

    // ── Insert ──
    { group: "insert", cmd: "image", ext: "image", icon: SVG_IMAGE, tooltip: "Insert image",
      hasDropdown: "imageUrl",
      action: (ed, url) => { if (url) ed.chain().focus().setImage({ src: url }).run(); },
      isActive: () => false },
    { group: "insert", cmd: "youtube", ext: "youtube", icon: SVG_YOUTUBE, tooltip: "Insert YouTube",
      hasDropdown: "youtubeUrl",
      action: (ed, url) => { if (url) ed.commands.setYoutubeVideo({ src: url }); },
      isActive: () => false },
    { group: "insert", cmd: "table", ext: "table", icon: SVG_TABLE, tooltip: "Insert table",
      hasDropdown: "tableGrid",
      action: (ed, val) => { if (val) ed.chain().focus().insertTable({ rows: val.rows, cols: val.cols, withHeaderRow: true }).run(); },
      isActive: (ed) => ed.isActive("table") },

    // ── Links ──
    { group: "links", cmd: "setLink", ext: "link", icon: SVG_LINK, tooltip: "Set link",
      hasDropdown: "linkUrl",
      action: (ed, url) => { if (url) ed.chain().focus().setLink({ href: url }).run(); },
      isActive: (ed) => ed.isActive("link") },
    { group: "links", cmd: "removeLink", ext: "link", icon: SVG_UNLINK, tooltip: "Remove link",
      action: (ed) => ed.chain().focus().unsetLink().run(),
      isActive: () => false },

    // ── Alignment ──
    { group: "alignment", cmd: "alignLeft", ext: "textalign", icon: SVG_ALIGN_LEFT, tooltip: "Align left",
      action: (ed) => ed.chain().focus().setTextAlign("left").run(),
      isActive: (ed) => ed.isActive({ textAlign: "left" }) },
    { group: "alignment", cmd: "alignCenter", ext: "textalign", icon: SVG_ALIGN_CENTER, tooltip: "Align center",
      action: (ed) => ed.chain().focus().setTextAlign("center").run(),
      isActive: (ed) => ed.isActive({ textAlign: "center" }) },
    { group: "alignment", cmd: "alignRight", ext: "textalign", icon: SVG_ALIGN_RIGHT, tooltip: "Align right",
      action: (ed) => ed.chain().focus().setTextAlign("right").run(),
      isActive: (ed) => ed.isActive({ textAlign: "right" }) },
    { group: "alignment", cmd: "alignJustify", ext: "textalign", icon: SVG_ALIGN_JUSTIFY, tooltip: "Justify",
      action: (ed) => ed.chain().focus().setTextAlign("justify").run(),
      isActive: (ed) => ed.isActive({ textAlign: "justify" }) },

    // ── Comments ──
    { group: "comments", cmd: "addComment", ext: "comment", icon: SVG_COMMENT, tooltip: "Add comment",
      action: null, // handled specially — fires event
      isActive: () => false },
    { group: "comments", cmd: "removeComment", ext: "comment", icon: SVG_COMMENT_X, tooltip: "Remove comment",
      action: (ed) => ed.chain().focus().unsetComment().run(),
      isActive: () => false },

    // ── History ──
    { group: "history", cmd: "undo", ext: "history", icon: SVG_UNDO, tooltip: "Undo",
      action: (ed) => ed.chain().focus().undo().run(),
      isActive: () => false,
      isEnabled: (ed) => ed.can().undo() },
    { group: "history", cmd: "redo", ext: "history", icon: SVG_REDO, tooltip: "Redo",
      action: (ed) => ed.chain().focus().redo().run(),
      isActive: () => false,
      isEnabled: (ed) => ed.can().redo() },

    // ── Other ──
    { group: "other", cmd: "invisibleChars", ext: "invisiblecharacters", icon: SVG_PILCROW, tooltip: "Invisible characters",
      action: (ed) => ed.commands.toggleInvisibleCharacters(),
      isActive: () => false },
];

// ── Dropdown system ──────────────────────────────────────────

function createDropdownPanel(type, btnDef, editor, instanceRef) {
    const panel = document.createElement("div");
    panel.className = "tiptap-toolbar-dropdown";

    if (type === "colorPicker") {
        const SWATCHES = [
            "#000000","#434343","#666666","#999999","#b7b7b7","#ffffff",
            "#FF2D7B","#FF6B6B","#FFA94D","#FFD43B","#69DB7C","#4DABF7",
            "#7950F2","#E64980","#D6336C","#C2255C","#A61E4D","#862E9C",
        ];
        const grid = document.createElement("div");
        grid.className = "tiptap-color-grid";
        SWATCHES.forEach(c => {
            const swatch = document.createElement("button");
            swatch.className = "tiptap-color-swatch";
            swatch.style.background = c;
            swatch.dataset.color = c;
            swatch.addEventListener("mousedown", (e) => {
                e.preventDefault();
                btnDef.action(editor, c);
                closeActiveDropdown(instanceRef);
            });
            grid.appendChild(swatch);
        });
        panel.appendChild(grid);

        const customRow = document.createElement("div");
        customRow.className = "tiptap-dropdown-row";
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "tiptap-color-input";
        colorInput.value = "#FF2D7B";
        colorInput.addEventListener("input", (e) => {
            e.preventDefault();
            btnDef.action(editor, e.target.value);
        });
        customRow.appendChild(colorInput);

        const clearBtn = document.createElement("button");
        clearBtn.className = "tiptap-dropdown-btn tiptap-dropdown-btn-secondary";
        clearBtn.textContent = "Clear";
        clearBtn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            btnDef.action(editor, null);
            closeActiveDropdown(instanceRef);
        });
        customRow.appendChild(clearBtn);
        panel.appendChild(customRow);

    } else if (type === "fontFamily") {
        const FONTS = ["Arial","Courier New","Georgia","Helvetica","Inter","Lato","Merriweather","Montserrat","Open Sans","Playfair Display","Roboto","Source Code Pro","Times New Roman","Verdana"];
        const list = document.createElement("div");
        list.className = "tiptap-dropdown-list";

        const clearItem = document.createElement("button");
        clearItem.className = "tiptap-dropdown-list-item";
        clearItem.textContent = "Default";
        clearItem.addEventListener("mousedown", (e) => {
            e.preventDefault();
            btnDef.action(editor, null);
            closeActiveDropdown(instanceRef);
        });
        list.appendChild(clearItem);

        FONTS.forEach(f => {
            const item = document.createElement("button");
            item.className = "tiptap-dropdown-list-item";
            item.textContent = f;
            item.style.fontFamily = f;
            item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                btnDef.action(editor, f);
                closeActiveDropdown(instanceRef);
            });
            list.appendChild(item);
        });
        panel.appendChild(list);

    } else if (type === "fontSize") {
        const SIZES = ["8px","10px","12px","14px","16px","18px","20px","24px","28px","32px","36px","48px","64px","72px"];
        const list = document.createElement("div");
        list.className = "tiptap-dropdown-list";

        const clearItem = document.createElement("button");
        clearItem.className = "tiptap-dropdown-list-item";
        clearItem.textContent = "Default";
        clearItem.addEventListener("mousedown", (e) => {
            e.preventDefault();
            btnDef.action(editor, null);
            closeActiveDropdown(instanceRef);
        });
        list.appendChild(clearItem);

        SIZES.forEach(s => {
            const item = document.createElement("button");
            item.className = "tiptap-dropdown-list-item";
            item.textContent = s;
            item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                btnDef.action(editor, s);
                closeActiveDropdown(instanceRef);
            });
            list.appendChild(item);
        });

        const customRow = document.createElement("div");
        customRow.className = "tiptap-dropdown-row";
        const customInput = document.createElement("input");
        customInput.type = "text";
        customInput.className = "tiptap-dropdown-input";
        customInput.placeholder = "e.g. 22px";
        const applyBtn = document.createElement("button");
        applyBtn.className = "tiptap-dropdown-btn";
        applyBtn.textContent = "Apply";
        applyBtn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (customInput.value) { btnDef.action(editor, customInput.value); closeActiveDropdown(instanceRef); }
        });
        customRow.appendChild(customInput);
        customRow.appendChild(applyBtn);
        panel.appendChild(list);
        panel.appendChild(customRow);

    } else if (type === "headingLevel") {
        const list = document.createElement("div");
        list.className = "tiptap-dropdown-list tiptap-heading-list";
        const headingLevels = instanceRef.data.headings || [1,2,3,4,5,6];
        const labels = { 0: "Paragraph", 1: "Heading 1", 2: "Heading 2", 3: "Heading 3", 4: "Heading 4", 5: "Heading 5", 6: "Heading 6" };
        const sizes = { 0: "1em", 1: "1.6em", 2: "1.4em", 3: "1.2em", 4: "1.1em", 5: "1em", 6: "0.9em" };

        // Paragraph option
        const pItem = document.createElement("button");
        pItem.className = "tiptap-dropdown-list-item";
        pItem.textContent = labels[0];
        pItem.dataset.level = "0";
        pItem.addEventListener("mousedown", (e) => {
            e.preventDefault();
            btnDef.action(editor, null);
            closeActiveDropdown(instanceRef);
        });
        list.appendChild(pItem);

        headingLevels.forEach(level => {
            const item = document.createElement("button");
            item.className = "tiptap-dropdown-list-item";
            item.textContent = labels[level] || ("Heading " + level);
            item.style.fontSize = sizes[level] || "1em";
            item.style.fontWeight = "600";
            item.dataset.level = level;
            item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                btnDef.action(editor, level);
                closeActiveDropdown(instanceRef);
            });
            list.appendChild(item);
        });
        panel.appendChild(list);

    } else if (type === "linkUrl" || type === "imageUrl" || type === "youtubeUrl") {
        const placeholders = { linkUrl: "https://example.com", imageUrl: "https://example.com/image.png", youtubeUrl: "https://youtube.com/watch?v=..." };
        const row = document.createElement("div");
        row.className = "tiptap-dropdown-row";
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.className = "tiptap-dropdown-input";
        urlInput.placeholder = placeholders[type];

        // Pre-fill current link URL if editing a link
        if (type === "linkUrl") {
            const attrs = editor.getAttributes("link");
            if (attrs && attrs.href) urlInput.value = attrs.href;
        }

        const applyBtn = document.createElement("button");
        applyBtn.className = "tiptap-dropdown-btn";
        applyBtn.textContent = "Apply";
        applyBtn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (urlInput.value) { btnDef.action(editor, urlInput.value); closeActiveDropdown(instanceRef); }
        });
        urlInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); if (urlInput.value) { btnDef.action(editor, urlInput.value); closeActiveDropdown(instanceRef); } }
        });
        row.appendChild(urlInput);
        row.appendChild(applyBtn);
        panel.appendChild(row);

        // Auto-focus the input after the panel is shown
        requestAnimationFrame(() => urlInput.focus());

    } else if (type === "tableGrid") {
        const GRID_ROWS = 6, GRID_COLS = 6;
        const label = document.createElement("div");
        label.className = "tiptap-grid-label";
        label.textContent = "Select table size";

        const grid = document.createElement("div");
        grid.className = "tiptap-table-grid";
        grid.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;

        for (let r = 1; r <= GRID_ROWS; r++) {
            for (let c = 1; c <= GRID_COLS; c++) {
                const cell = document.createElement("div");
                cell.className = "tiptap-grid-cell";
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener("mouseenter", () => {
                    label.textContent = `${r} × ${c}`;
                    grid.querySelectorAll(".tiptap-grid-cell").forEach(gc => {
                        const gr = parseInt(gc.dataset.row), gcol = parseInt(gc.dataset.col);
                        gc.classList.toggle("is-active", gr <= r && gcol <= c);
                    });
                });
                cell.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    btnDef.action(editor, { rows: r, cols: c });
                    closeActiveDropdown(instanceRef);
                });
                grid.appendChild(cell);
            }
        }
        panel.appendChild(label);
        panel.appendChild(grid);
    }

    return panel;
}

function closeActiveDropdown(instanceRef) {
    if (instanceRef.data._activeDropdown) {
        instanceRef.data._activeDropdown.panel.remove();
        instanceRef.data._activeDropdown.btn.classList.remove("is-dropdown-open");
        instanceRef.data._activeDropdown = null;
    }
    if (instanceRef.data._dropdownCloseListener) {
        document.removeEventListener("mousedown", instanceRef.data._dropdownCloseListener, true);
        instanceRef.data._dropdownCloseListener = null;
    }
}

function toggleDropdown(btnEl, btnDef, editor, instanceRef, toolbarEl) {
    // If this dropdown is already open, close it
    if (instanceRef.data._activeDropdown && instanceRef.data._activeDropdown.cmd === btnDef.cmd) {
        closeActiveDropdown(instanceRef);
        return;
    }
    // Close any other open dropdown
    closeActiveDropdown(instanceRef);

    const panel = createDropdownPanel(btnDef.hasDropdown, btnDef, editor, instanceRef);
    btnEl.style.position = "relative";
    btnEl.appendChild(panel);
    btnEl.classList.add("is-dropdown-open");

    instanceRef.data._activeDropdown = { panel, btn: btnEl, cmd: btnDef.cmd };

    // Close on outside click
    instanceRef.data._dropdownCloseListener = (e) => {
        if (!panel.contains(e.target) && !btnEl.contains(e.target)) {
            closeActiveDropdown(instanceRef);
        }
    };
    setTimeout(() => {
        document.addEventListener("mousedown", instanceRef.data._dropdownCloseListener, true);
    }, 0);
}

// ── Build toolbar DOM ────────────────────────────────────────

function buildToolbar(properties, ext, randomId, instanceRef) {
    const toolbar = document.createElement("div");
    toolbar.id = "tiptapToolbar-" + randomId;
    toolbar.className = "tiptap-toolbar";

    const buttonMap = {};
    let lastGroupEl = null;

    TOOLBAR_GROUP_ORDER.forEach(groupName => {
        const groupBtns = TOOLBAR_BUTTONS.filter(b => b.group === groupName);
        if (groupBtns.length === 0) return;

        const groupEl = document.createElement("div");
        groupEl.className = "tiptap-toolbar-group";
        groupEl.dataset.group = groupName;

        let visibleCount = 0;

        groupBtns.forEach(btnDef => {
            // Check extension visibility
            const extKeys = Array.isArray(btnDef.ext) ? btnDef.ext : [btnDef.ext];
            const isVisible = extKeys.some(k => ext[k]);
            if (!isVisible) return;

            visibleCount++;
            const btn = document.createElement("button");
            btn.className = "tiptap-toolbar-btn";
            btn.dataset.cmd = btnDef.cmd;
            btn.innerHTML = btnDef.icon;
            btn.title = btnDef.tooltip || "";

            btn.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const editor = instanceRef.data.editor;
                if (!editor) return;

                if (btnDef.hasDropdown) {
                    toggleDropdown(btn, btnDef, editor, instanceRef, toolbar);
                } else if (btnDef.cmd === "addComment") {
                    instanceRef.triggerEvent("toolbar_add_comment");
                } else if (btnDef.action) {
                    btnDef.action(editor);
                }
            });

            groupEl.appendChild(btn);
            buttonMap[btnDef.cmd] = { el: btn, def: btnDef };
        });

        if (visibleCount === 0) return;

        // Add divider before group (except the first)
        if (lastGroupEl) {
            const divider = document.createElement("div");
            divider.className = "tiptap-toolbar-divider";
            toolbar.appendChild(divider);
        }
        toolbar.appendChild(groupEl);
        lastGroupEl = groupEl;
    });

    return { toolbar, buttonMap };
}

// ── Update toolbar active states ─────────────────────────────

function updateToolbarStates(editor, buttonMap, instanceRef) {
    if (!editor || !buttonMap) return;
    Object.keys(buttonMap).forEach(cmd => {
        const { el, def } = buttonMap[cmd];

        // Active state
        if (def.isActive) {
            el.classList.toggle("is-active", def.isActive(editor));
        }

        // Enabled state
        if (def.isEnabled) {
            const enabled = def.isEnabled(editor);
            el.classList.toggle("is-disabled", !enabled);
            el.disabled = !enabled;
        }
    });

    // Update heading dropdown label
    if (buttonMap.heading) {
        const headingBtn = buttonMap.heading.el;
        let label = "¶";
        for (let i = 1; i <= 6; i++) {
            if (editor.isActive("heading", { level: i })) { label = "H" + i; break; }
        }
        // Show a small label indicator next to the icon
        let indicator = headingBtn.querySelector(".tiptap-heading-indicator");
        if (!indicator) {
            indicator = document.createElement("span");
            indicator.className = "tiptap-heading-indicator";
            headingBtn.appendChild(indicator);
        }
        indicator.textContent = label;
    }
}

// ─────────────────────────────────────────────────────────────
// setupEditor — called once from update.js on first property load
// ─────────────────────────────────────────────────────────────
instance.data.setupEditor = function (properties, context) {
    instance.data.debug("starting editor setup");

    let initialContent = properties.bubble.auto_binding() ? properties.autobinding : properties.initialContent;
    instance.data.initialContent = initialContent;
    let content = properties.content_is_json ? JSON.parse(initialContent) : initialContent;

    let placeholder = properties.placeholder;
    let bubbleMenu = properties.bubbleMenu;
    let floatingMenu = properties.floatingMenu;

    let preserveWhitespace =
        properties.parseOptions_preserveWhitespace === "true" ? true : properties.parseOptions_preserveWhitespace === "false" ? false : "full";

    // create the editor div
    const randomId = (Math.random() + 1).toString(36).substring(3);
    instance.data.randomId = randomId;

    // Canvas needs block flow (not flex row) so toolbar + editor stack vertically and scroll works
    instance.canvas.css({ display: "block", overflow: "auto" });

    // pull libraries from window.tiptap
    const {
        Editor,
        Node,
        Extension,
        mergeAttributes,
        Document,
        HardBreak,
        Paragraph,
        Text,
        Bold,
        Italic,
        Strike,
        Underline,
        Code,
        Heading,
        Blockquote,
        CodeBlock,
        HorizontalRule,
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem,
        FontFamily,
        Color,
        TextStyle,
        TextAlign,
        Highlight,
        Image,
        Resizable,
        Link,
        Youtube,
        Table,
        TableRow,
        TableHeader,
        TableCell,
        Mention,
        CharacterCount,
        Dropcursor,
        Gapcursor,
        UndoRedo,
        Placeholder,
        TrailingNode,
        Focus,
        Selection,
        BubbleMenu,
        FloatingMenu,
        FileHandler,
        UniqueID,
        Subscript,
        Superscript,
        Typography,
        ListKeymap,
        FontSize,
        Details,
        DetailsContent,
        DetailsSummary,
        InvisibleCharacters,
        DragHandle,
    } = window.tiptap;

    // Store extension states for action files to reference
    instance.data.ext = {
        bold: properties.ext_bold,
        italic: properties.ext_italic,
        strike: properties.ext_strike,
        underline: properties.ext_underline,
        code: properties.ext_code,
        highlight: properties.ext_highlight,
        fontfamily: properties.ext_fontfamily,
        color: properties.ext_color,
        heading: properties.ext_heading,
        blockquote: properties.ext_blockquote,
        horizontalrule: properties.ext_horizontalrule,
        codeblock: properties.ext_codeblock,
        bulletlist: properties.ext_bulletlist,
        orderedlist: properties.ext_orderedlist,
        tasklist: properties.ext_tasklist,
        image: properties.ext_image,
        youtube: properties.ext_youtube,
        link: properties.ext_link,
        table: properties.ext_table,
        bubblemenu: properties.ext_bubblemenu,
        floatingmenu: properties.ext_floatingmenu,
        placeholder: properties.ext_placeholder,
        textalign: properties.ext_textalign,
        dropcursor: properties.ext_dropcursor,
        gapcursor: properties.ext_gapcursor,
        history: properties.ext_history && !properties.collab_active,
        hardbreak: properties.ext_hardbreak,
        mention: properties.ext_mention,
        uniqueid: properties.ext_uniqueid,
        subscript: properties.ext_subscript,
        superscript: properties.ext_superscript,
        fontsize: properties.ext_fontsize,
        details: properties.ext_details,
        invisiblecharacters: properties.ext_invisiblecharacters,
        draghandle: properties.ext_draghandle,
        comment: properties.ext_comment,
    };

    // parse heading levels
    instance.data.headings = [];
    if (properties.ext_heading) {
        properties.headings.split(",").map((item) => {
            instance.data.headings.push(parseInt(item));
        });
    }

    // ── Build extensions ─────────────────────────────────────

    const extensions = [
        Document,
        Paragraph,
        Text,
        ListItem,
        TextStyle,
        CharacterCount.configure({
            limit: properties.characterLimit || null,
        }),
    ];

    if (properties.ext_uniqueid) {
        if (!properties.extension_uniqueid_types) {
            context.reportDebugger("UniqueID extension is active but the types are empty. You could target `paragraph, heading`, for example.");
            return;
        }
        let unique_id_types = properties.extension_uniqueid_types.split(",").map((item) => {
            return item.trim();
        });

        if (unique_id_types.length === 0) {
            context.reportDebugger(
                "UniqueID extension is active but there are no types for it to target. You could target `paragraph, heading`, for example.",
            );
            return;
        }

        let attributeName = properties.extension_uniqueid_attrName || "id";
        instance.data.debug("UniqueID attributeName:", attributeName);

        extensions.push(
            UniqueID.configure({
                types: unique_id_types,
                attributeName: attributeName,
            }),
        );
    }

    // ── Extension toggles (each controlled by its own yes/no property) ──

    if (properties.ext_dropcursor) {
        const dropcursorConfig = {};
        if (properties.dropcursor_color) dropcursorConfig.color = properties.dropcursor_color;
        if (properties.dropcursor_width) dropcursorConfig.width = properties.dropcursor_width;
        extensions.push(Dropcursor.configure(dropcursorConfig));
    }
    if (properties.ext_gapcursor) extensions.push(Gapcursor);
    if (properties.ext_trailingnode) extensions.push(TrailingNode);
    if (properties.ext_focus) extensions.push(Focus.configure({ className: "has-focus", mode: properties.ext_focus_mode || "deepest" }));
    if (properties.ext_selection) extensions.push(Selection);
    if (properties.ext_hardbreak) {
        extensions.push(HardBreak.configure({ keepMarks: properties.hardBreakKeepMarks }));
    }
    if (properties.ext_history && !properties.collab_active) extensions.push(UndoRedo);
    if (properties.ext_bold) extensions.push(Bold);
    if (properties.ext_italic) extensions.push(Italic);
    if (properties.ext_strike) extensions.push(Strike);
    if (properties.ext_fontfamily) extensions.push(FontFamily);
    if (properties.ext_color) extensions.push(Color);
    if (properties.ext_heading) extensions.push(Heading.configure({ levels: instance.data.headings }));
    if (properties.ext_bulletlist) extensions.push(BulletList.configure({
        keepMarks: properties.list_keepMarks || false,
        keepAttributes: properties.list_keepAttributes || false,
    }));
    if (properties.ext_orderedlist) extensions.push(OrderedList.configure({
        keepMarks: properties.list_keepMarks || false,
        keepAttributes: properties.list_keepAttributes || false,
    }));
    if (properties.ext_tasklist) extensions.push(TaskList, TaskItem.configure({ nested: true }));

    if (properties.ext_mention) {
        if (!properties.mention_list) {
            instance.data.debug("tried to use Mention extension, but mention_list is empty. Mention extension not loaded");
        } else {
            const suggestion_config = instance.data.configureSuggestion(instance, properties);
            extensions.push(
                Mention.configure({
                    HTMLAttributes: {
                        class: "mention",
                    },
                    renderHTML({ options, node }) {
                        return [
                            "a",
                            mergeAttributes({ href: `${properties.mention_base_url}${node.attrs.id}` }, options.HTMLAttributes),
                            `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
                        ];
                    },
                    deleteTriggerWithBackspace: true,
                    suggestion: suggestion_config,
                }),
            );
        }
    }

    if (properties.ext_highlight) extensions.push(Highlight.configure({ multicolor: properties.highlight_multicolor !== false }));
    if (properties.ext_underline) extensions.push(Underline);
    if (properties.ext_codeblock) extensions.push(CodeBlock.configure({
        exitOnTripleEnter: properties.codeblock_exitOnTripleEnter !== false,
        exitOnArrowDown: properties.codeblock_exitOnArrowDown !== false,
        defaultLanguage: properties.codeblock_defaultLanguage || null,
        enableTabIndentation: properties.codeblock_tabIndentation || false,
        tabSize: properties.codeblock_tabSize || 4,
    }));
    if (properties.ext_code) extensions.push(Code);
    if (properties.ext_blockquote) extensions.push(Blockquote);
    if (properties.ext_horizontalrule) extensions.push(HorizontalRule);
    if (properties.ext_youtube) extensions.push(Youtube.configure({
        nocookie: properties.youtube_nocookie !== false,
        allowFullscreen: properties.youtube_allowFullscreen !== false,
        addPasteHandler: properties.youtube_addPasteHandler !== false,
        width: properties.youtube_defaultWidth || 640,
        height: properties.youtube_defaultHeight || 480,
    }));
    if (properties.ext_table) {
        const tableResizable = properties.table_resizable !== false;
        extensions.push(
            Table.configure({
                resizable: tableResizable,
                handleWidth: properties.table_handleWidth || 5,
                cellMinWidth: properties.table_cellMinWidth || 25,
                lastColumnResizable: properties.table_lastColumnResizable !== false,
                allowTableNodeSelection: properties.table_allowNodeSelection || false,
            }),
            TableRow, TableHeader, TableCell
        );
    }
    if (properties.ext_image) {
        extensions.push(Image.configure({ inline: properties.image_inline || false, allowBase64: properties.allowBase64 }), Resizable);
    }
    if (properties.ext_link) {
        const linkConfig = {
            openOnClick: properties.link_openOnClick || false,
            autolink: properties.link_autolink !== false,
            linkOnPaste: properties.link_linkOnPaste !== false,
            defaultProtocol: properties.link_defaultProtocol || "https",
            HTMLAttributes: {},
        };
        if (properties.link_target) {
            linkConfig.HTMLAttributes.target = properties.link_target;
        }
        if (properties.link_rel) {
            linkConfig.HTMLAttributes.rel = properties.link_rel;
        }
        if (properties.link_protocols) {
            const protocols = properties.link_protocols.split(",").map(p => p.trim()).filter(Boolean)
                .map(p => ({ scheme: p, optionalSlashes: true }));
            if (protocols.length > 0) linkConfig.protocols = protocols;
        }
        extensions.push(Link.configure(linkConfig));
    }
    if (properties.ext_placeholder) extensions.push(Placeholder.configure({
        placeholder: placeholder,
        showOnlyWhenEditable: properties.placeholder_showOnlyWhenEditable !== false,
        showOnlyCurrent: properties.placeholder_showOnlyCurrent !== false,
        includeChildren: properties.placeholder_includeChildren || false,
    }));
    if (properties.ext_textalign) extensions.push(TextAlign.configure({ types: ["heading", "paragraph"] }));

    // ── Phase 2 extensions ───────────────────────────────────

    if (properties.ext_subscript) extensions.push(Subscript);
    if (properties.ext_superscript) extensions.push(Superscript);
    if (properties.ext_fontsize) extensions.push(FontSize);
    if (properties.ext_typography) extensions.push(Typography);
    if (properties.ext_listkeymap) extensions.push(ListKeymap);
    if (properties.ext_details) {
        extensions.push(
            Details.configure({ persist: properties.details_persist || false }),
            DetailsContent,
            DetailsSummary,
        );
    }
    if (properties.ext_invisiblecharacters) {
        extensions.push(InvisibleCharacters.configure({
            visible: properties.invisiblecharacters_visible !== false,
        }));
    }
    if (properties.ext_draghandle) {
        const dragHandleConfig = {
            render() {
                const el = document.createElement("div");
                el.classList.add("tiptap-drag-handle");
                el.innerHTML = "⠿";
                return el;
            },
        };

        if (properties.draghandle_nested) {
            dragHandleConfig.nested = true;
        }

        extensions.push(DragHandle.configure(dragHandleConfig));
    }
    if (properties.ext_comment) {
        const Comment = window.tiptapComment;
        extensions.push(Comment.configure({
            HTMLAttributes: {
                class: "flourish-comment",
            },
            onCommentActivated: (commentId) => {
                instance.publishState("active_comment_id", commentId);
                if (commentId) {
                    instance.triggerEvent("comment_clicked");
                }
            },
        }));
    }

    // ── PreserveAttributes extension ─────────────────────────

    const PreserveAttributes = Extension.create({
        name: "preserveAttributes",

        addGlobalAttributes() {
            return [
                {
                    // Apply to all block nodes
                    types: ["paragraph", "heading", "blockquote", "codeBlock", "listItem", "table", "tableRow", "tableCell", "tableHeader"],
                    attributes: {
                        class: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("class"),
                            renderHTML: (attributes) => {
                                if (!attributes.class) return {};
                                return { class: attributes.class };
                            },
                        },
                        style: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("style"),
                            renderHTML: (attributes) => {
                                if (!attributes.style) return {};
                                return { style: attributes.style };
                            },
                        },
                        id: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("id"),
                            renderHTML: (attributes) => {
                                if (!attributes.id) return {};
                                return { id: attributes.id };
                            },
                        },
                        "data-attributes": {
                            default: null,
                            parseHTML: (element) => {
                                const dataAttrs = {};
                                Array.from(element.attributes).forEach((attr) => {
                                    if (attr.name.startsWith("data-")) {
                                        dataAttrs[attr.name] = attr.value;
                                    }
                                });
                                return Object.keys(dataAttrs).length ? dataAttrs : null;
                            },
                            renderHTML: (attributes) => {
                                if (!attributes["data-attributes"]) return {};
                                return attributes["data-attributes"];
                            },
                        },
                    },
                },
                {
                    // Apply to inline marks
                    types: ["bold", "italic", "strike", "code", "link"],
                    attributes: {
                        class: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("class"),
                            renderHTML: (attributes) => {
                                if (!attributes.class) return {};
                                return { class: attributes.class };
                            },
                        },
                        style: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("style"),
                            renderHTML: (attributes) => {
                                if (!attributes.style) return {};
                                return { style: attributes.style };
                            },
                        },
                    },
                },
            ];
        },
    });

    // ── CustomDiv extension ──────────────────────────────────

    const CustomDivExtension = Node.create({
        name: "customDiv",
        group: "block",
        content: "block*",
        defining: true,

        addAttributes() {
            return {
                class: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("class"),
                },
                style: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("style"),
                },
                id: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("id"),
                },
                "data-attributes": {
                    default: null,
                    parseHTML: (element) => {
                        const dataAttrs = {};
                        Array.from(element.attributes).forEach((attr) => {
                            if (attr.name.startsWith("data-")) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        });
                        return Object.keys(dataAttrs).length ? dataAttrs : null;
                    },
                },
            };
        },

        parseHTML() {
            return [{ tag: "div" }];
        },

        renderHTML({ node, HTMLAttributes }) {
            const attrs = { ...node.attrs };

            // Merge data attributes
            if (attrs["data-attributes"]) {
                Object.assign(attrs, attrs["data-attributes"]);
                delete attrs["data-attributes"];
            }

            // Remove null/undefined attributes
            Object.keys(attrs).forEach((key) => {
                if (attrs[key] === null || attrs[key] === undefined) {
                    delete attrs[key];
                }
            });

            return ["div", { ...attrs, ...HTMLAttributes }, 0];
        },
    });

    if (properties.preserve_attributes) {
        extensions.push(PreserveAttributes);

        if (properties.preserve_unknown_tags) {
            // Add custom div support
            extensions.push(CustomDivExtension);
        }
    }

    // ── File upload handling ─────────────────────────────────

    function handleUpload(file, editor, pos) {
        const attachFilesTo = properties.attachFilesTo || null;
        return new Promise((resolve, reject) => {
            if (!instance.canUploadFile(file)) {
                const message = "Not allowed to upload this file";
                context.reportDebugger(message);
                instance.publishState("fileUploadErrorMessage", message);
                reject(new Error(message));
                return;
            }
            if (!properties.attachFilesTo) {
                context.reportDebugger(
                    "Uploading a file, but there's no object to attach to. This file could be accessible by anyone. Consider the privacy implications.",
                );
            }

            instance.publishState("fileUploadProgress", 0);
            const uploadedFile = instance.uploadFile(
                file,
                (err, url) => {
                    if (err) {
                        context.reportDebugger(err.message);
                        instance.publishState("fileUploadErrorMessage", err.message);
                        reject(err);
                        return;
                    }

                    if (file.type.startsWith("image/")) {
                        // Insert at the drop position
                        if (pos) {
                            editor.commands.insertContentAt(pos, {
                                type: "image",
                                attrs: { src: url },
                            });
                        } else {
                            // Fallback to regular image insertion if no position specified
                            editor.commands.setImage({ src: url });
                        }
                    }
                    instance.data.fileUploadUrls.push(url);
                    instance.triggerEvent("fileUploaded");
                    instance.publishState("fileUploadUrls", instance.data.fileUploadUrls);
                    resolve(url);
                },
                properties.attachFilesTo,
                (progress) => {
                    instance.publishState("fileUploadProgress", progress);
                },
            );
        });
    }

    let allowedMimeTypes = undefined;
    if (properties.allowedMimeTypes) {
        allowedMimeTypes = properties.allowedMimeTypes.get(0, properties.allowedMimeTypes.length());
    }

    extensions.push(
        FileHandler.configure({
            onDrop: async (editor, files, pos) => {
                instance.data.fileUploadUrls = [];
                try {
                    const uploadPromises = Array.from(files).map((file) => handleUpload(file, editor, pos));

                    // Wait for all uploads to complete
                    const urls = await Promise.all(uploadPromises);
                    instance.data.debug("file upload URLs:", urls);
                    instance.publishState("fileUploadUrls", urls);
                } catch (error) {
                    instance.triggerEvent("fileUploadError");
                    console.error("Upload error:", error);
                    context.reportDebugger(error.message);
                    instance.publishState("fileUploadErrorMessage", error.message);
                }
            },

            onPaste: async (editor, files, htmlContent) => {
                instance.data.fileUploadUrls = [];
                if (htmlContent) return;
                try {
                    const uploadPromises = Array.from(files).map((file) => handleUpload(file, editor));

                    // Wait for all uploads to complete
                    const urls = await Promise.all(uploadPromises);
                    instance.publishState("fileUploadUrls", urls);
                } catch (error) {
                    instance.triggerEvent("fileUploadError");
                    console.error("Upload error:", error);
                    context.reportDebugger(error.message);
                    instance.publishState("fileUploadErrorMessage", error.message);
                }
            },
            allowedMimeTypes: allowedMimeTypes,
        }),
    );

    // Store extensions for use by getSelection's generateHTML
    instance.data.editorExtensions = extensions;

    // ── Parse options ────────────────────────────────────────

    const parseOptions = {
        preserveWhitespace: preserveWhitespace,
    };

    // If attribute preservation is enabled, add custom parsing
    if (properties.preserve_html_attributes) {
        parseOptions.transformPastedHTML = (html) => {
            // Pre-process HTML to ensure better attribute preservation
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Find all div elements and ensure they're properly structured
            const divs = doc.querySelectorAll("div");
            divs.forEach((div) => {
                // Mark divs for preservation
                if (div.hasAttribute("style") || div.hasAttribute("class")) {
                    div.setAttribute("data-preserve-div", "true");
                }
            });

            return doc.body.innerHTML;
        };
    }

    // ── Editor options & callbacks ───────────────────────────

    const options = {
        element: null, // set later after toolbar is built
        editable: properties.isEditable,
        content: content,
        extensions: extensions,
        parseOptions: parseOptions,
        injectCSS: true,
        onCreate({ editor }) {
            instance.data.debug("editor created and ready");
            instance.data.editor_is_ready = true;
            instance.triggerEvent("is_ready");
            instance.publishState("is_ready", true);

            instance.publishState("contentHTML", editor.getHTML());
            instance.publishState("contentText", editor.getText());
            instance.publishState("contentJSON", JSON.stringify(instance.data.editor.getJSON()));
            instance.publishState("isEditable", editor.isEditable);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            // CharacterCount is always loaded as a core extension
            instance.publishState("characterCount", editor.storage.characterCount.characters());
            instance.publishState("wordCount", editor.storage.characterCount.words());

            // Publish initial invisible characters state
            if (properties.ext_invisiblecharacters) {
                instance.publishState("invisible_characters_visible", properties.invisiblecharacters_visible !== false);
            }

            // If collaboration is active, try to set initial content
            if (properties.collab_active && instance.data.maybeSetCollabInitialContent) {
                // Try immediately (in case provider already synced)
                instance.data.maybeSetCollabInitialContent();

                // Poll as a fallback — onSynced may not fire reliably in all providers
                if (instance.data.provider && !instance.data.collabInitialContentSet) {
                    let pollAttempts = 0;
                    const maxAttempts = 50; // 50 * 200ms = 10 seconds
                    instance.data._collabSyncPollInterval = setInterval(() => {
                        pollAttempts++;
                        // Safety: stop polling if provider was destroyed (e.g. auth retry teardown)
                        if (!instance.data.provider) {
                            clearInterval(instance.data._collabSyncPollInterval);
                            instance.data._collabSyncPollInterval = null;
                            return;
                        }
                        const providerSynced = instance.data.provider.synced || instance.data.provider.isSynced;
                        if (providerSynced && !instance.data.collabHasSynced) {
                            instance.data.debug("collab sync detected via polling");
                            instance.data.collabHasSynced = true;
                            instance.publishState("collab_synced", true);
                            instance.triggerEvent("collab_synced");
                        }
                        if (instance.data.collabHasSynced) {
                            instance.data.maybeSetCollabInitialContent();
                        }
                        if (instance.data.collabInitialContentSet || pollAttempts >= maxAttempts) {
                            clearInterval(instance.data._collabSyncPollInterval);
                            instance.data._collabSyncPollInterval = null;
                        }
                    }, 200);
                }
            }
        },
        onUpdate({ editor }) {
            const contentHTML = editor.getHTML();
            instance.publishState("contentHTML", contentHTML);
            instance.publishState("contentText", editor.getText());
            instance.publishState("contentJSON", JSON.stringify(editor.getJSON()));
            instance.publishState("isEditable", editor.isEditable);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            instance.publishState("characterCount", editor.storage.characterCount.characters());
            instance.publishState("wordCount", editor.storage.characterCount.words());

            if (!instance.data.isProgrammaticUpdate) {
                if (!properties.collab_active) {
                    instance.data.updateContent(contentHTML);
                } else {
                    instance.triggerEvent("contentUpdated");
                }
                instance.data.isDebouncingDone = false;
            }
        },
        onFocus({ editor, event }) {
            instance.data.debug("editor focused");
            instance.triggerEvent("isFocused");
            instance.publishState("isFocused", true);
            instance.data.is_focused = true;
        },
        onBlur({ editor, event }) {
            instance.data.debug("editor blurred");
            instance.triggerEvent("isntFocused");
            instance.publishState("isFocused", false);
            instance.data.is_focused = false;
            if (!properties.collab_active) {
                instance.publishAutobinding(editor.getHTML());
            }
        },
        onTransaction({ editor, transaction }) {
            instance.data.getSelection(editor);
            instance.data.publishActiveStates(editor);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            instance.publishState("characterCount", editor.storage.characterCount.characters());
            instance.publishState("wordCount", editor.storage.characterCount.words());
            if (instance.data.updateToolbarStates) instance.data.updateToolbarStates(editor);
        },
        onSelectionUpdate({ editor }) {
            instance.data.getSelection(editor);
            instance.data.publishActiveStates(editor);
            if (instance.data.updateToolbarStates) instance.data.updateToolbarStates(editor);
        },
    };

    // ── Menu setup ───────────────────────────────────────────

    const menuErrorMessage = " not found. Is the entered id correct? FYI: the Bubble element should default to visible.";

    // Helper: Tiptap v3 uses Floating UI instead of tippy.js for BubbleMenu/FloatingMenu.
    // v3 does NOT initially hide the element (isVisible starts false, so hide() is a no-op).
    // We must hide menu elements ourselves before passing them to the extension.
    function hideMenuElement(el) {
        el.style.visibility = "hidden";
        el.style.opacity = "0";
    }

    if (bubbleMenu && properties.ext_bubblemenu) {
        // Find all elements with the id matching properties.bubbleMenu
        let bubbleMenuElements = document.querySelectorAll(`#${bubbleMenu}`);

        // If no elements found, log an error
        if (bubbleMenuElements.length === 0) {
            const errorMessage = "BubbleMenu" + menuErrorMessage;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
        } else if (bubbleMenuElements.length === 1) {
            // If only one element is found, make that the bubble menu.
            hideMenuElement(bubbleMenuElements[0]);
            options.extensions.push(
                BubbleMenu.configure({
                    element: bubbleMenuElements[0],
                    appendTo: () => document.body,
                }),
            );
        } else if (bubbleMenuElements.length >= 2) {
            // If multiple elements found, try to find the closest and warn the developer
            const errorMessage = `Bubble Menu: found multiple elements with the same ID ${bubbleMenu}. Assuming that the closest one is the correct one. However, the developer should update the code to ensure that the IDs are unique. Tiptap ID: ${instance.data.randomId}.`;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
            let bubbleMenuDiv = instance.data.findElement(bubbleMenu);
            hideMenuElement(bubbleMenuDiv);
            options.extensions.push(
                BubbleMenu.configure({
                    element: bubbleMenuDiv,
                    appendTo: () => document.body,
                }),
            );
        }
    }

    if (floatingMenu && properties.ext_floatingmenu) {
        // Find all elements with the id matching properties.floatingMenu
        let floatingMenuElements = document.querySelectorAll(`#${floatingMenu}`);

        // If no elements found, log an error
        if (floatingMenuElements.length === 0) {
            const errorMessage = "FloatingMenu" + menuErrorMessage;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
        } else if (floatingMenuElements.length === 1) {
            // If only one element is found, make that the floating menu.
            hideMenuElement(floatingMenuElements[0]);
            options.extensions.push(
                FloatingMenu.configure({
                    element: floatingMenuElements[0],
                    appendTo: () => document.body,
                }),
            );
        } else if (floatingMenuElements.length >= 2) {
            // If multiple elements found, try to find the closest and warn the developer
            const errorMessage = `Floating Menu: found multiple elements with the same ID ${floatingMenu}. Assuming that the closest one is the correct one. However, the developer should update the code to ensure that the IDs are unique. Tiptap ID: ${instance.data.randomId}.`;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
            let floatingMenuDiv = instance.data.findElement(floatingMenu);
            hideMenuElement(floatingMenuDiv);
            options.extensions.push(
                FloatingMenu.configure({
                    element: floatingMenuDiv,
                    appendTo: () => document.body,
                }),
            );
        }
    }

    // ── Collaboration ────────────────────────────────────────

    instance.data.maybeSetupCollaboration(instance, properties, options, extensions);

    // ── Build toolbar and editor div, append to canvas ───────

    var d = document.createElement("div");
    d.id = "tiptapEditor-" + randomId;
    instance.data.tiptapEditorID = d.id;
    options.element = d;

    // Build and insert toolbar before editor div
    const { toolbar, buttonMap } = buildToolbar(properties, instance.data.ext, randomId, instance);
    instance.data.toolbarEl = toolbar;
    instance.data.toolbarButtonMap = buttonMap;
    if (!properties.toolbar_show) toolbar.style.display = "none";
    if (properties.toolbar_sticky) toolbar.classList.add("tiptap-toolbar-sticky");

    // Negate canvas padding so toolbar spans edge-to-edge
    const canvasEl = instance.canvas[0] || instance.canvas;
    const cs = window.getComputedStyle(canvasEl);
    const pTop = parseFloat(cs.paddingTop) || 0;
    const pRight = parseFloat(cs.paddingRight) || 0;
    const pBottom = parseFloat(cs.paddingBottom) || 0;
    const pLeft = parseFloat(cs.paddingLeft) || 0;
    if (pTop || pRight || pLeft) {
        toolbar.style.margin = `-${pTop}px -${pRight}px 0 -${pLeft}px`;
        toolbar.style.paddingLeft = `calc(8px + ${pLeft}px)`;
        toolbar.style.paddingRight = `calc(8px + ${pRight}px)`;
        toolbar.style.paddingTop = `calc(6px + ${pTop}px)`;
    }

    instance.canvas.append(toolbar);

    // Append editor div after toolbar
    instance.canvas.append(d);

    // Wire up toolbar state updates
    instance.data.updateToolbarStates = function (editor) {
        updateToolbarStates(editor, instance.data.toolbarButtonMap, instance);
    };

    // ── Create the editor ────────────────────────────────────

    try {
        instance.data.editor = new Editor(options);
        instance.data.isEditorSetup = true;
        instance.data._currentCollabDocId = properties.collab_doc_id;
        instance.data.debug("editor instance created, waiting for onCreate");
    } catch (error) {
        console.error("[Tiptap] failed trying to create the Editor:", error);
    }
};