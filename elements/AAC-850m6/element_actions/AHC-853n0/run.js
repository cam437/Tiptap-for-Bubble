function(instance, properties, context) {
  if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Add comment to selection");

  if (instance.data.active_nodes.includes("Comment")) {
    instance.data.editor.chain().focus().setComment(properties.comment_id).run();
  } else {
    console.log("tried to Add comment, but Comment extension is not active.");
  }
}
