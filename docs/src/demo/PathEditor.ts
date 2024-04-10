import { TAU, Circle, RoundedRect, Point, Path, Segment, Bezier, Vector } from '2d-geometry'
import { Graph, Container, Node, Style, Text, TextStyle } from 'pencil'
import * as elements from 'pencil/elements'

const pathStyle = Style.from({ stroke: '#e45050' })

export class PathEditor extends Graph {
  points: Point[]
  path: Path
  pathNode: Node
  controls: Container

  constructor(domNode: any, options: any) {
    super(domNode, options)

    const content = new Container([])
    const pathNode = this.pathNode = new Node(new Path([]), pathStyle)
    const controls = this.controls = new Container([])

    this.points = [
      new Point(200, 300),
      new Point(200, 200),
      new Point(300, 190),
    ]
    this.path = Path.fromPoints(this.points)
    this.pathNode.shape = this.path

    this.background.on('dragstart', (position) => {
      this.points.push(position)
      this.path = Path.fromPoints(this.points)
      pathNode.shape = this.path
      this.renderPath()
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

      this.renderPath()
      this.render()
    })

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(content)
    this.root.add(pathNode)
    this.root.add(controls)

    this.buildUI()

    this.renderPath()
    this.render()
  }

  renderPath() {
    this.controls.clear()
    this.path.parts.forEach(part => {
      if (part instanceof Bezier) {
        this.controls.add(Dot(part.start, Style.from({ stroke: 'red' })))
        this.controls.add(Dot(part.end, Style.from({ stroke: 'red' })))
        this.controls.add(new Node(new Segment(part.start, part.control1), Style.from({ stroke: 'white ' })))
        this.controls.add(Dot(part.control1, Style.from({ stroke: 'white' })))
        this.controls.add(Dot(part.control2, Style.from({ stroke: 'white' })))
        this.controls.add(new Node(new Segment(part.end, part.control2), Style.from({ stroke: 'white ' })))
      }
      if (part instanceof Segment) {
        this.controls.add(Dot(part.start, Style.from({ stroke: 'yellow' })))
        this.controls.add(Dot(part.end, Style.from({ stroke: 'yellow' })))
      }
    })
  }

  smoothPath = () => {
    const parts = this.path.parts
    const newParts = parts.map(p => new Bezier(p.start, p.start, p.end, p.end))

    for (let i = 0; i < newParts.length - 1; i++) {
      const part = newParts[i]
      const next = newParts[i + 1]

      const a = new Vector(part.start, part.end).invert().normalize()
      const b = new Vector(next.start, next.end).normalize()
      const ta = a.slope
      const tb = b.slope > a.slope ? b.slope - TAU : b.slope
      const dt = ta - tb
      const v = new Vector(ta - dt / 2)
      const length = Math.min(part.length / 4, next.length / 4)
      const pa = part.end.translate(v.rotate90CCW().multiply(length))
      const pb = part.end.translate(v.rotate90CW().multiply(length))
      part.control2 = pa
      next.control1 = pb
    }
    newParts[0].control1 =
      newParts[0].start.translate(
        newParts[0].control2.distanceTo(newParts[0].end)[1].vector
          .rotate90CW()
          .normalize()
          .multiply(newParts[0].control2.distanceTo(newParts[0].end)[0])
      )

    this.path = new Path(newParts)
    this.pathNode.shape = this.path
    this.renderPath()
    this.render()
  }

  toggleControls = () => {
    this.controls.visible = !this.controls.visible
    this.render()
  }

  buildUI() {
    const buttonSmooth = Button(this, { label: 'Smooth', onClick: this.smoothPath })
    buttonSmooth.y = 0
    const buttonToggle = Button(this, { label: 'Toggle', onClick: this.toggleControls })
    buttonToggle.y = 45

    const tools = new Container([
      buttonSmooth,
      buttonToggle,
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

function Dot(point: Point, style: Style) {
  const dot = new Node(new Circle(0, 0, 5), style)
  dot.x = point.x
  dot.y = point.y
  return dot
}
