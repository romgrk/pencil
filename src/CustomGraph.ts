import { Circle } from '2d-geometry'
import { Graph } from './graph/Graph'
import { Container } from './graph/Container'
import { Node } from './graph/Node'
import { Style } from './graph/Style'
import { HoverBehavior } from './graph/HoverBehavior'
import { traverseWithTransform } from './graph/traverse'
import animate from './graph/animate'
import * as elements from './graph/elements'


export class CustomGraph extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([
      new elements.Grid()
    ]))

    const cursor = new Container([
      new Node(new Circle(0, 0, 8), Style.from({ strokeStyle: '#e45050' }))
    ])

    const style = Style.from({ fillStyle: '#566eff' })
    {
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.x = 200
      circle.y = 200
      this.root.add(circle)
    }
    {
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.x = 200
      circle.y = 300
      this.root.add(circle)
    }
    {
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.x = 200
      circle.y = 400
      this.root.add(circle)
    }


    const hover = new HoverBehavior(this, {
      onPointerMove: (position) => {
        cursor.x = position.x
        cursor.y = position.y

        // traverseWithTransform(this.root, (element, transform) => {
        //   if (element instanceof Node && element.) {
        //     const currentPosition = position.transform(transform.invert())
        //
        //     if (element.shape.contains(currentPosition)) {
        //       animate({ from: circle.scale, to: 2 }, (scale) => {
        //         circle.scale = scale
        //         this.render()
        //       })
        //     }
        //   }
        // })

        this.render()
      },
    })
    hover.enable()

    this.root.add(cursor)

    this.render()
  }
}

