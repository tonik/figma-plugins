const NAMES_WIDTH = []
const NAMES_HEIGHT = []

async function traverse(node, name) {
  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        traverse(child, name)
      }
    // TODO: Customizable node name
    } else if (node.name === name) {
      const spaceComp = node.children.find(element => element.name === 'Line' || element.name === 'Space')
      const textNode = node.children.find(element => element.type === "TEXT")
      const valueToDisplay = NAMES_WIDTH.includes(name) ? spaceComp.width : NAMES_HEIGHT.includes(name) ? spaceComp.height : null

      const textToDisplay = String(`${ valueToDisplay }px`)

      let len = textNode.characters.length
      await figma.loadFontAsync(textNode.getRangeFontName(0, 1))

      textNode.deleteCharacters(0, len)
      textNode.insertCharacters(0, textToDisplay)

    }
  }
}

for (const selectedComp of figma.currentPage.selection) {
  traverse(figma.root, selectedComp.name)
}
figma.closePlugin()
