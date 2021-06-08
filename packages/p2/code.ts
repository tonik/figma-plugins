const ColorLuminance = (hex: string, lums: Array<number>) => {
  if (/[^0-9a-f]/gi.test(hex)) {
    throw new Error('Invalid color')
  }

  const colors = []

  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  for (const lum of lums) {
    let color = '#'

    for (let i = 0; i < 3; i++) {
      const cNumber = parseInt(hex.substr(i * 2, 2), 16)
      const colorParh = Math.round(Math.min(Math.max(0, cNumber + cNumber * lum), 255)).toString(16)
      color += ('00' + colorParh).substr(colorParh.length)
    }

    colors.push(color)
  }

  return colors
}

// Console.log(ColorLuminance("6699C", [0, 1, 2]))

figma.closePlugin()
