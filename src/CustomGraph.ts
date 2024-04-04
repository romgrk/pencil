import { Circle, Bezier, Path, Segment, Matrix, point, ShapeTag } from '2d-geometry'
import { Graph } from './graph/Graph'
import { Container } from './graph/Container'
import { Node } from './graph/Node'
import { Style } from './graph/Style'
import { HoverBehavior } from './graph/HoverBehavior'
import { traverseWithTransform } from './graph/traverse'
import { animate } from './graph/animate'
import * as elements from './graph/elements'


export class CustomGraph extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([], Matrix.IDENTITY.translate(100, 100))
    this.root.add(content)

    const cursor = new Container([
      new Node(new Circle(0, 0, 8), Style.from({ strokeStyle: '#e45050' }))
    ])

    const style = Style.from({ fillStyle: '#566eff' })
    {
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.addTag('circle')
      circle.x = 200
      circle.y = 200
      content.add(circle)
    }
    {
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.addTag('circle')
      circle.x = 200
      circle.y = 300
      content.add(circle)
    }
    {
      const style = Style.from({ lineWidth: 3, strokeStyle: '#566eff' })
      const path = new Path([
        new Bezier(
          point(0, 0),
          point(0,   -130),
          point(200, -130),
          point(200, 0),
        ),
        new Segment(
          point(200, 0),
          point(220, 0),
        ),
        new Bezier(
          point(220, 0),
          point(220, -150),
          point(-20, -150),
          point(-20, 0),
        ),
        new Segment(
          point(-20, 0),
          point(0, 0),
        ),
      ])
      const node = new Node(
        Path.EMPTY,
        style
      )
      const container = new Container([
        node,
      ])
      container.x = 200
      container.y = 400
      content.add(container)

      animate({ from: 0, to: 1, duration: 2000 }, (f) => {
        const partial = path.slice(0, path.length * f)
        node.shape = partial
        this.render()
      })
    }

    const hover = new HoverBehavior(this, {
      onPointerMove: (position) => {
        cursor.x = position.x
        cursor.y = position.y

        traverseWithTransform(this.root, (element, transform) => {
          if (element instanceof Node && element.shape.tag === ShapeTag.Circle && element.parent!.tags?.has('circle')) {
            const currentPosition = position.transform(transform.invert())

            if (element.shape.contains(currentPosition)) {
              const circle = element.parent!
              console.log(circle)
              animate({ from: circle.scale, to: 2 }, (scale) => {
                circle.scale = scale
                this.render()
              })
            }
          }
        })

        this.render()
      },
    })
    hover.enable()

    this.root.add(cursor)

    this.render()
  }
}

