async function traverse(node) {
  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        traverse(child)
      }
    // TODO: Customizable node name
    } else if (node.name === '_Specification'){
      const spaceComp = node.children.find(element => element.name === 'Line' || element.name === 'Space')
      const textNode = node.children.find(element => element.type === "TEXT")
      const textToDisplay = String(`${Math.max(spaceComp.width, spaceComp.height)}px`)

      let len = textNode.characters.length
      await figma.loadFontAsync(textNode.getRangeFontName(0, 1))

      textNode.deleteCharacters(0, len)
      textNode.insertCharacters(0, textToDisplay)

    }
  }
}

traverse(figma.root)
figma.closePlugin()
