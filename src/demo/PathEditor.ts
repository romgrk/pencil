import { Circle, Box, Rect, RoundedRect, Matrix, Point, Path } from '2d-geometry'
import { Graph, Container, Node, Style, Text, TextStyle, Animation } from '../graph'
import * as elements from '../graph/elements'

const pathStyle = Style.from({ stroke: '#e45050' })

export class PathEditor extends Graph {
  points: Point[]
  path: Path

  constructor(domNode: any, options: any) {
    super(domNode, options)

    const content = new Container([])
    const pathNode = new Node(new Path([]), pathStyle)

    this.points = []
    this.path = new Path([])

    this.background.on('dragstart', (position) => {
      this.points.push(position)
      this.path = Path.fromPoints(this.points)
      pathNode.shape = this.path
      const pointNode = new Node(new Circle(0, 0, 3), pathStyle)
      pointNode.x = position.x
      pointNode.y = position.y
      content.add(pointNode)
      this.render()
    })

    this.background.on('dragmove', (_, position) => {
      if (this.points[this.points.length - 1].distanceTo(position)[0] < 10)
        return
      this.points.push(position)
      this.path = Path.fromPoints(this.points)
      pathNode.shape = this.path

      // const pointNode = new Node(new Circle(0, 0, 3), pathStyle)
      // pointNode.x = position.x
      // pointNode.y = position.y
      // content.add(pointNode)

      this.render()
    })

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(content)
    this.root.add(pathNode)

    this.buildUI()

    this.render()
  }

  buildUI() {
    const buttonDraw = Button(this, { label: 'Draw' })
    buttonDraw.y = 0
    const buttonEdit = Button(this, { label: 'Edit' })
    buttonEdit.y = 45

    const tools = new Container([
      buttonDraw,
      buttonEdit,
    ])
    tools.x = 10
    tools.y = 10

    this.root.add(tools)
  }
}

function Button(graph: Graph, options: { label: string, onClick?: Function }) {
  const text = new Text(
    options.label,
    Point.EMPTY,
    TextStyle.from({ font: '16px sans-serif', textAlign: 'center', textBaseline: 'middle' }),
    Style.from({ fill: '#ccc', }),
  )
  // const width = 20 + Math.max(100, text.dimensions.width)
  // const height = 20 + Math.max(text.dimensions.fontBoundingBoxDescent)
  text.x = 10 + text.width / 2
  text.y = 10 + text.height / 2
  const width  = 20 + Math.max(100, text.width)
  const height = 20 + text.height

  const normalStyle = Style.from({ stroke: '#424242', fill: '#323232' })
  const hoverStyle  = Style.from({ stroke: '#565656', fill: '#383838' })
  const activeStyle = Style.from({ stroke: '#424242', fill: '#303030' })

  const background = new RoundedRect(0, 0, width, height, 10)
  const backgroundNode = new Node(background, normalStyle)
  const button = new Container(
    [
      backgroundNode,
      text
    ]
  )
  button.x = 0
  button.y = 0
  button.events.cursor = 'pointer'
  button.on('pointerover', () => {
    backgroundNode.style = hoverStyle
    graph.render()
  })
  button.on('pointerdown', () => {
    backgroundNode.style = activeStyle
    graph.render()
  })
  button.on('pointerup', () => {
    backgroundNode.style = hoverStyle
    graph.render()
  })
  button.on('pointerout', () => {
    backgroundNode.style = normalStyle
    graph.render()
  })
  button.on('pointerclick', () => { options.onClick?.() })

  return button
}
