type Status = 'in-progress' | 'awaiting-feedback' | 'development-ready'
type Appearance = 'dark' | 'light'
type StatusInfo = {
  icon: string
  colorSchemes: {
    [key in Appearance]: {
      color: RGB
    }
  }
}
type ChangeStatusPayload = {
  status?: Status
  appearance: Appearance
}

const init = async () => {
  figma.showUI(__uiFiles__.main, { width: 240, height: 332 })

  const selection = figma.currentPage.selection[0]
  const { backgrounds } = figma.currentPage
  const canvasBackground = rgbToHsl(backgrounds[0].type === 'SOLID' && backgrounds[0].color)
  const appearance = canvasBackground.l > 40 ? 'light' : 'dark'

  if (isSection(selection) || isFrame(selection)) {
    const status = recognizeStatus(selection)
    figma.ui.postMessage({ status, appearance })
  }
}

type MessageProps =
  | {
      type: 'change-status'
      payload?: ChangeStatusPayload
    }
  | {
      type: 'archive'
      payload: never
    }

interface PluginParameters extends ParameterValues {
  workStatus?: Status
}

figma.ui.onmessage = ({ type, payload }: MessageProps) => {
  switch (type) {
    case 'change-status':
      changeStatus(payload)
      break
    case 'archive':
      archive()
      break
    default:
      break
  }
}

const statusInfo: {
  [key in Status]: StatusInfo
} = {
  'in-progress': {
    colorSchemes: {
      light: {
        color: {
          b: 0.9529411792755127,
          g: 0.9529411792755127,
          r: 0.9529411792755127,
        },
      },
      dark: {
        color: {
          b: 0.24313725531101227,
          g: 0.24313725531101227,
          r: 0.24313725531101227,
        },
      },
    },
    icon: '🚧',
  },
  'awaiting-feedback': {
    colorSchemes: {
      light: {
        color: {
          b: 0.8196078538894653,
          g: 0.9843137264251709,
          r: 1,
        },
      },
      dark: {
        color: {
          b: 0,
          g: 0.23529411852359772,
          r: 0.2862745225429535,
        },
      },
    },
    icon: '⏰',
  },
  'development-ready': {
    colorSchemes: {
      light: {
        color: {
          r: 0.8745098114013672,
          g: 0.9529411792755127,
          b: 0.8745098114013672,
        },
      },
      dark: {
        color: {
          b: 0.15294118225574493,
          g: 0.2666666805744171,
          r: 0.11372549086809158,
        },
      },
    },
    icon: '✅',
  },
}

const rgbToHsl = ({ r, g, b }: RGB) => {
  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin
  let h = 0
  let s = 0
  let l = 0

  if (delta === 0) h = 0
  else if (cmax === r) h = ((g - b) / delta) % 6
  else if (cmax === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  h = Math.round(h * 60)

  if (h < 0) h += 360
  l = (cmax + cmin) / 2
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  s = Number((s * 100).toFixed(1))
  l = Number((l * 100).toFixed(1))

  return {
    h,
    s,
    l,
  }
}

const recognizeStatus = (selection: FrameNode | SectionNode): Status => {
  const { color } = selection.fills[0]
  return Object.keys(statusInfo).find((status) => {
    return (
      (statusInfo[status].colorSchemes.light.color.r === color.r &&
        statusInfo[status].colorSchemes.light.color.g === color.g &&
        statusInfo[status].colorSchemes.light.color.b === color.b) ||
      (statusInfo[status].colorSchemes.dark.color.r === color.r &&
        statusInfo[status].colorSchemes.dark.color.g === color.g &&
        statusInfo[status].colorSchemes.dark.color.b === color.b)
    )
  }) as Status
}

const isSection = (node: SceneNode): node is SectionNode => {
  return node.type === 'SECTION'
}

const isFrame = (node: SceneNode): node is FrameNode => {
  return node.type === 'FRAME'
}

const changeStatus = ({ status, appearance }: ChangeStatusPayload) => {
  if (figma.currentPage.selection.length === 0) {
    figma.notify('Please select a section or frame.')
    return
  }

  figma.currentPage.selection.forEach((el) => {
    el.name = `${statusInfo[status].icon} ${el.name.replace(/^(🚧|⏰|✅) /, '')}`

    if (isSection(el) || isFrame(el)) {
      el.fills = [{ type: 'SOLID', color: statusInfo[status].colorSchemes[appearance].color, opacity: 0.64 }]
    } else {
      figma.notify('Please select a section or frame.')
    }
  })
}

const archive = () => {
  const archivePage = figma.root.findChild((node) => node.name === 'Archive') ?? figma.createPage()
  archivePage.name = 'Archive'

  figma.currentPage.selection.forEach((el) => {
    const yPositions = archivePage.children?.map((child) => ({
      y: child.y,
      x: child.x,
    }))
    const minY = Math.min(...yPositions.map((pos) => pos.y))
    const x = Math.min(...yPositions.filter((pos) => pos.y === minY).map((pos) => pos.x))

    archivePage.appendChild(el)

    const timeElapsed = Date.now()
    const dateObj = new Date(timeElapsed)
    const formattedDate = dateObj.toDateString()

    el.name = `${el.name.replace(/^(🚧|⏰|✅) /, '')} | Archived on ${formattedDate}`
    el.y = isFinite(minY) ? minY - el.height - 400 : 0
    el.x = isFinite(x) ? x : 0
  })
}

init()

figma.on('run', ({ parameters }: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters)
    figma.closePlugin()
  }
})

figma.on('selectionchange', () => {
  startPluginWithParameters({})
})

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^\w- ]+/g, '')
    .replace(/ +/g, '-')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/^-/, '')

function startPluginWithParameters(parameters: PluginParameters) {
  const { workStatus } = parameters

  figma.currentPage.selection.forEach((el) => {
    const status = recognizeStatus(el as FrameNode | SectionNode)
    const { backgrounds } = figma.currentPage
    const canvasBackground = rgbToHsl(backgrounds[0].type === 'SOLID' && backgrounds[0].color)
    const appearance = canvasBackground.l > 40 ? 'light' : 'dark'

    figma.ui.postMessage({ status, appearance })

    changeStatus({
      status: slugify(workStatus ?? status) as Status,
      appearance: 'light',
    })
  })
}

figma.parameters.on('input', ({ query, result }) => {
  result.setSuggestions(
    ['🚧  In progress', '⏰  Awaiting feedback', '✅  Development ready'].filter((s) => s.includes(query))
  )
})
