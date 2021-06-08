async function traverse(node) {
  if ('children' in node) {
    if (node.type !== 'INSTANCE') {
      for (const child of node.children) {
        traverse(child)
      }
    } else if (node.name === '_Specification') {
      const spaceComp = node.children.find((element) => /^(size|space)\/(width|height)/.test(element.name))
      const textNode = node.children.find((element) => element.type === 'TEXT')
      const valueToDisplay = /^(size|space)\/(width)/.test(spaceComp.name) ? spaceComp?.width : spaceComp?.height
      const textToDisplay = String(`${valueToDisplay}px`)

      const len = textNode.characters.length
      await figma.loadFontAsync(textNode.getRangeFontName(0, 1))

      textNode.deleteCharacters(0, len)
      textNode.insertCharacters(0, textToDisplay)
    }
  }
}

traverse(figma.root)
figma.closePlugin()
