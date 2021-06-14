const hslToHex = ({ h, s, l }: HSL) => {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`
}

const hslToRgb = ({ h, s, l }: HSL) => {
  h /= 360
  s /= 100
  l /= 100
  let r: number
  let g: number
  let b: number

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  if (s === 0) {
    r = l
    g = l
    b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r, g, b }
}

const rgbToHsl = ({ r, g, b }) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  let s
  const l = (max + min) / 2

  if (max === min) {
    h = 0
    s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
        break
    }

    h /= 6
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  }
}

const colorLuminance = ({ h, s, l }: HSL, range: Array<number>) => {
  const colors = []

  for (let i = range[0]; i < range[1]; i++) {
    colors.push({
      h,
      s,
      l: Math.max(l + 7.5 * i, 0),
    })
  }

  return colors
}

const createColorBadge = async ({ text, color }: { text: string; color: RGB }) => {
  await figma.loadFontAsync({ family: 'IBM Plex Mono', style: 'Regular' })

  const badgeText = figma.createText()
  badgeText.name = 'Badge'
  badgeText.fontName = { family: 'IBM Plex Mono', style: 'Regular' }
  badgeText.fontSize = 16
  badgeText.strokeWeight = 400
  badgeText.lineHeight = { value: 24, unit: 'PIXELS' }
  badgeText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0.03921568627 } }]
  badgeText.insertCharacters(0, text)

  const badgeFrame = figma.createFrame()
  badgeFrame.name = 'badgeFrame'
  badgeFrame.x = 572
  badgeFrame.layoutMode = 'VERTICAL'
  badgeFrame.paddingLeft = 12
  badgeFrame.paddingRight = 12
  badgeFrame.paddingTop = 4
  badgeFrame.paddingBottom = 4
  badgeFrame.resizeWithoutConstraints(92, 32)
  badgeFrame.fills = [{ type: 'SOLID', color }]
  badgeFrame.appendChild(badgeText)

  return badgeFrame
}

const createColorFrame = ({ color }: { color: RGB }) => {
  const colorFrame = figma.createFrame()
  colorFrame.name = 'Color'
  colorFrame.resizeWithoutConstraints(488, 128)
  colorFrame.fills = [{ type: 'SOLID', color }]

  return colorFrame
}

const createTitleFrame = () => {
  const titleFrame = figma.createFrame()
  titleFrame.name = 'Title'
  titleFrame.resizeWithoutConstraints(664, 32)
  titleFrame.fills = []

  return titleFrame
}

const createTitleText = async ({ text }: { text: string }) => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

  const titleText = figma.createText()
  titleText.name = 'Title'
  titleText.fontName = { family: 'Inter', style: 'Regular' }
  titleText.fontSize = 24
  titleText.strokeWeight = 500
  titleText.lineHeight = { value: 32, unit: 'PIXELS' }
  titleText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0.03921568627 } }]
  titleText.insertCharacters(0, text)

  return titleText
}

const createDescriptionText = async ({ text }: { text: string }) => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

  const descriptionText = figma.createText()
  descriptionText.name = 'Description'
  descriptionText.x = 40
  descriptionText.fontName = { family: 'Inter', style: 'Regular' }
  descriptionText.fontSize = 16
  descriptionText.strokeWeight = 400
  descriptionText.lineHeight = { value: 24, unit: 'PIXELS' }
  descriptionText.fills = [{ type: 'SOLID', color: { r: 0.5176470588, g: 0.5176470588, b: 0.5882352941 } }]

  descriptionText.insertCharacters(0, text)

  return descriptionText
}

const createLineElement = () => {
  const lineElement = figma.createLine()
  lineElement.name = 'Line'
  lineElement.y = 127
  lineElement.resize(1216, 0)
  lineElement.strokes = [{ type: 'SOLID', color: { r: 0.9294117647, g: 0.9294117647, b: 0.9843137255 } }]

  return lineElement
}

const createContentInnerFrame = () => {
  const contentInnerFrame = figma.createFrame()
  contentInnerFrame.name = 'Content inner'
  contentInnerFrame.x = 552
  contentInnerFrame.y = 32
  contentInnerFrame.resizeWithoutConstraints(664, 64)
  contentInnerFrame.fills = []
  contentInnerFrame.layoutMode = 'VERTICAL'
  contentInnerFrame.itemSpacing = 8

  return contentInnerFrame
}

const createContentFrame = () => {
  const contentFrame = figma.createFrame()
  contentFrame.name = 'Content'
  contentFrame.fills = []
  contentFrame.layoutMode = 'HORIZONTAL'
  contentFrame.counterAxisAlignItems = 'CENTER'
  contentFrame.itemSpacing = 64
  contentFrame.resizeWithoutConstraints(1216, 128)

  return contentFrame
}

const createElementComponent = () => {
  const elementComponent = figma.createComponent()
  elementComponent.name = 'Element'
  elementComponent.resizeWithoutConstraints(1216, 128)

  return elementComponent
}

let mainComponent: ComponentNode = null

const createItem = async ({
  title,
  colorInRgb,
  colorInHex,
  offsetTop,
}: {
  title: string
  colorInRgb: RGB
  colorInHex: string
  offsetTop: number
}) => {
  if (mainComponent) {
    const elementComponent = mainComponent.createInstance()
    elementComponent.y = offsetTop
    const titleElement = elementComponent.findOne((n) => n.type === 'TEXT' && n.name === 'Title') as TextNode
    const colorElement = elementComponent.findOne((n) => n.type === 'FRAME' && n.name === 'Color') as FrameNode
    const badgeElement = elementComponent.findOne((n) => n.type === 'TEXT' && n.name === 'Badge') as TextNode
    console.log('colorElement', colorElement)
    colorElement.fills = [{ type: 'SOLID', color: colorInRgb }]
    titleElement.deleteCharacters(0, titleElement.characters.length)
    titleElement.insertCharacters(0, title)
    badgeElement.deleteCharacters(0, badgeElement.characters.length)
    badgeElement.insertCharacters(0, colorInHex)

    return elementComponent
  }

  const elementComponent = await createElementComponent()
  mainComponent = elementComponent
  elementComponent.y = offsetTop
  const contentFrame = await createContentFrame()
  const contentInnerFrame = await createContentInnerFrame()
  const descriptionText = await createDescriptionText({ text: 'Short information about usage.' })
  const titleFrame = await createTitleFrame()
  const badgeText = await createColorBadge({
    text: colorInHex,
    color: { r: 0.9294117647, g: 0.9294117647, b: 0.9843137255 },
  })
  const titleText = await createTitleText({ text: title })
  const colorFrame = await createColorFrame({ color: colorInRgb })
  const lineElement = await createLineElement()

  await titleFrame.appendChild(badgeText)
  await titleFrame.appendChild(titleText)

  await contentInnerFrame.appendChild(titleFrame)
  await contentInnerFrame.appendChild(descriptionText)

  await contentFrame.appendChild(colorFrame)
  await contentFrame.appendChild(contentInnerFrame)

  await elementComponent.appendChild(lineElement)
  await elementComponent.appendChild(contentFrame)

  return elementComponent
}

let container: FrameNode = null
const range = [-4, 5]

const createPallete = async (el: SceneNode) => {
  if ('fills' in el) {
    const { r, g, b } = el.fills[0].color
    const { h, s, l } = rgbToHsl({ r, g, b })
    const palette: Array<HSL> = colorLuminance({ h, s, l }, range)
    container = figma.createFrame()
    container.name = el.name
    container.resizeWithoutConstraints(1216, 128 * palette.length)
    container.x = 1216 * figma.currentPage.selection.indexOf(el)

    for await (const color of palette) {
      const colorInHex = hslToHex(color)
      const colorInRgb = hslToRgb({ h: color.h, s: color.s, l: color.l })
      const styleName = `${el.name} - ${(palette.length + 1) * 100 - (palette.indexOf(color) + 1) * 100}`
      const style = figma.createPaintStyle()
      style.name = styleName
      style.paints = [{ type: 'SOLID', color: colorInRgb }]

      const item = await createItem({
        title: styleName,
        colorInRgb,
        colorInHex,
        offsetTop: palette.indexOf(color) * 128,
      })
      container.appendChild(item)
      container.appendChild(item)
    }
  }
}

figma.currentPage.selection.forEach(async (el, index) => {
  await createPallete(el)

  if (index === figma.currentPage.selection.length - 1) {
    figma.currentPage.selection = [container]
    figma.viewport.scrollAndZoomIntoView([container])
    figma.closePlugin()
  }
})