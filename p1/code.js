var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function traverse(node) {
    return __awaiter(this, void 0, void 0, function* () {
        if ("children" in node) {
            if (node.type !== "INSTANCE") {
                for (const child of node.children) {
                    traverse(child);
                }
                // TODO: Customizable node name
            }
            else if (node.name === '_Specification') {
                const spaceComp = node.children.find(element => element.name === 'Line' || element.name === 'Space');
                const textNode = node.children.find(element => element.type === "TEXT");
                const textToDisplay = String(`${Math.max(spaceComp.width, spaceComp.height)}px`);
                let len = textNode.characters.length;
                yield figma.loadFontAsync(textNode.getRangeFontName(0, 1));
                textNode.deleteCharacters(0, len);
                textNode.insertCharacters(0, textToDisplay);
            }
        }
    });
}
traverse(figma.root);
figma.closePlugin();