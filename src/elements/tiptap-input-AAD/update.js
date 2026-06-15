// First run: set up the editor
if (!instance.data.isEditorSetup) {
    instance.data.setupEditor(properties);
}

if (!instance.data.editor_is_ready) return;

const editor = instance.data.editor;

// ── Editable toggle ───────────────────────────────────────────────────────
if (properties.isEditable !== undefined && editor.isEditable !== (properties.isEditable !== false)) {
    editor.setEditable(properties.isEditable !== false);
}

// ── Initial content / value update ───────────────────────────────────────
if (
    properties.initialContent !== undefined &&
    properties.initialContent !== instance.data._prevInitialContent
) {
    instance.data._prevInitialContent = properties.initialContent;
    const content = properties.initialContent || "";
    if (content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
        instance.publishState("plain_text", editor.getText({ blockSeparator: "\n" }));
        instance.publishState("serialized_value", editor.getHTML());
    }
}

// ── Mention candidate feed ────────────────────────────────────────────────
if (
    properties.ext_mention &&
    properties.candidates !== instance.data._prevMentionCandidates
) {
    instance.data._prevMentionCandidates = properties.candidates;
    if (instance.data._updateMentionCandidates) {
        instance.data._updateMentionCandidates(properties.candidates || "[]");
    }
}

// ── Stylesheet refresh ────────────────────────────────────────────────────
instance.data.applyStylesheet(properties);
