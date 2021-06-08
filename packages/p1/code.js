const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }

    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }

      function rejected(value) {
        try {
          step(generator.throw(value))
        } catch (e) {
          reject(e)
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }

function traverse(node) {
  return __awaiter(this, void 0, void 0, function* () {
    if ('children' in node) {
      if (node.type !== 'INSTANCE') {
        for (const child of node.children) {
          traverse(child)
        }
      } else if (node.name === '_Specification') {
        const spaceComp = node.children.find((element) => /^(size|space)\/(width|height)/.test(element.name))
        const textNode = node.children.find((element) => element.type === 'TEXT')
        const valueToDisplay = /^(size|space)\/(width)/.test(spaceComp.name)
          ? spaceComp === null || spaceComp === void 0
            ? void 0
            : spaceComp.width
          : spaceComp === null || spaceComp === void 0
          ? void 0
          : spaceComp.height
        const textToDisplay = String(`${valueToDisplay}px`)
        const len = textNode.characters.length
        yield figma.loadFontAsync(textNode.getRangeFontName(0, 1))
        textNode.deleteCharacters(0, len)
        textNode.insertCharacters(0, textToDisplay)
      }
    }
  })
}

traverse(figma.root)
figma.closePlugin()
