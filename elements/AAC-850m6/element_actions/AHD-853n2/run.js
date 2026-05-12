function(instance, properties, context) {
  if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Remove comment");

  if (instance.data.active_nodes.includes("Comment")) {
    instance.data.editor.commands.unsetComment(properties.comment_id);
  } else {
    console.log("tried to Remove comment, but Comment extension is not active.");
  }
}
