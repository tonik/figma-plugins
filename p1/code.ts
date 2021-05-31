figma.showUI(__html__);

async function traverse(node, name, actionType) {
  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        traverse(child, name, actionType)
      }
    // TODO: Customizable node name
    } else if (node.name === name) {
      const spaceComp = node.children.find(element => element.name === 'Line' || element.name === 'Space')
      const textNode = node.children.find(element => element.type === "TEXT")
      const valueToDisplay = actionType === 'width' ? spaceComp.width : spaceComp.height

      const textToDisplay = String(`${ valueToDisplay }px`)

      let len = textNode.characters.length
      await figma.loadFontAsync(textNode.getRangeFontName(0, 1))

      textNode.deleteCharacters(0, len)
      textNode.insertCharacters(0, textToDisplay)

    }
  }
}


figma.ui.onmessage = msg => {
  if (msg.type === 'start') {
    for (const selectedComp of figma.currentPage.selection) {
      traverse(figma.root, selectedComp.name, msg.actionType)
    }
  }

  figma.closePlugin();
};
