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
  status: Status
  appearance: Appearance
}

const init = async () => {
  figma.showUI(__uiFiles__.main, { width: 240, height: 332 })
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

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

figma.ui.onmessage = ({ type, payload }: MessageProps) => {
  console.log(type, payload)
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

    const dateObj = new Date()
    const day = dateObj.getDay()
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    const formattedDate = `${month} ${day}, ${year}`

    el.name = `${el.name.replace(/^(🚧|⏰|✅) /, '')} | Archived on ${formattedDate}`
    el.y = isFinite(minY) ? minY - el.height - 400 : 0
    el.x = isFinite(x) ? x : 0
  })
}

init()

figma.on('run', ({ parameters }: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters)
  }
})

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/^-/, '')

function startPluginWithParameters(parameters: PluginParameters) {
  const { workStatus } = parameters
  changeStatus({
    status: slugify(workStatus) as Status,
    appearance: 'light',
  })

  figma.closePlugin()
}

figma.parameters.on('input', ({ query, result }) => {
  result.setSuggestions(
    ['🚧  In progress', '⏰  Awaiting feedback', '✅  Development ready'].filter((s) => s.includes(query))
  )
})
