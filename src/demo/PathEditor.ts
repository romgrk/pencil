import { Circle, Box, Matrix, Point, Path } from '2d-geometry'
import { Graph, Container, Node, Style, Text, TextStyle, Animation } from '../graph'
import * as elements from '../graph/elements'

const pathStyle = Style.from({ strokeStyle: '#e45050' })

export class PathEditor extends Graph {
  points: Point[]
  path: Path

  constructor(domNode: any, options: any) {
    super(domNode, options)

    const content = new Container([], Matrix.IDENTITY)
    const cursor = new Container([
      new Node(new Circle(0, 0, 8), Style.from({ strokeStyle: '#e0e0e0' }))
    ])
    const pathNode = new Node(Path.EMPTY, pathStyle)

    this.points = []
    this.path = new Path([])

    this.background.on('pointermove', (position) => {
      cursor.x = position.x
      cursor.y = position.y
      this.render()
    })

    // this.background.on('dragstart', (position) => {
    //   this.points.push(position)
    //   this.path = Path.fromPoints(this.points)
    //   pathNode.shape = this.path
    //   const pointNode = new Node(new Circle(0, 0, 3), pathStyle)
    //   pointNode.x = position.x
    //   pointNode.y = position.y
    //   content.add(pointNode)
    //   this.render()
    // })

    this.background.on('pointerdown', (position) => {
      // if (this.points[this.points.length - 1].distanceTo(position)[0] < 10)
      //   return
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
    this.root.add(cursor)

    this.buildUI()

    this.render()
  }

  buildUI() {
    const text = new Text(
      'Draw',
      Point.EMPTY,
      TextStyle.from({ font: '20px sans-serif', textAlign: 'center' }),
      Style.from({ fillStyle: 'red', }),
    )
    const width = 20 + Math.max(100, text.dimensions.width)
    const height = 20 + Math.max(text.dimensions.fontBoundingBoxDescent)
    text.x = text.dimensions.width / 2
    text.y = height
    const button = new Container(
      [
        new Node(
          new Box(
            -width / 2,
            -height / 2,
            +width / 2,
            +height / 2,
          ),
          Style.from({ fillStyle: '#656565'})
        ),
        text
      ]
    )
    button.x = 10
    button.y = 10

    const tools = new Container([
      new Node(new Circle(0, 0, 50), Style.from({ strokeStyle: 'red' })),
      button,
    ])
    tools.x = 100
    tools.y = 100

    this.root.add(tools)
  }
}

