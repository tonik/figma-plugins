type Status = 'in-progress' | 'awaiting-feedback' | 'done'
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
  figma.showUI(__uiFiles__.main, { width: 400, height: 400 })

  // figma.currentPage.selection.forEach((el) => {
  //   console.log(el.y)
  // })
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
  done: {
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
  console.log('archive')
  const archivePage = figma.root.findChild((node) => node.name === 'Archive') ?? figma.createPage()
  archivePage.name = 'Archive'

  figma.currentPage.selection.forEach((el) => {
    const yPositions = archivePage.children.map((child) => ({
      y: child.y,
      x: child.x,
    }))
    const minY = Math.min(...yPositions.map((pos) => pos.y))
    const x = Math.min(...yPositions.filter((pos) => pos.y === minY).map((pos) => pos.x))

    archivePage.appendChild(el)
    el.name = `${el.name.replace(/^(🚧|⏰|✅) /, '')} | Archived on ${new Date().toLocaleDateString()}`
    el.y = minY - el.height - 400
    el.x = x
  })
}

init()
