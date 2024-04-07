import { Circle, Bezier, Path, Segment, Matrix, point } from '2d-geometry'
import { Graph } from './graph/Graph'
import { Container } from './graph/Container'
import { Node } from './graph/Node'
import { Style } from './graph/Style'
import { animate, Animation } from './graph/animate'
import * as elements from './graph/elements'


export class CustomGraph extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([], Matrix.IDENTITY)
    this.root.add(content)

    const cursor = new Container([
      new Node(new Circle(0, 0, 8), Style.from({ strokeStyle: '#e45050' }))
    ])

    const colors = [
      '#568fff',
      '#566eff',
      '#5451e7',
      '#7b51e7',
      '#a251e7',
      '#b551e7',
    ]
    {
      const animation = new Animation()
      const style = Style.from({ fillStyle: '#566eff' })
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.addTag('circle')
      circle.x = 200
      circle.y = 200
      circle.on('pointerover', () => {
        this.cursor = 'pointer'
        animation.start({ from: circle.scale, to: 2 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerout', () => {
        this.cursor = 'default'
        animation.start({ from: circle.scale, to: 1 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      content.add(circle)
    }

    const addBall = (color: string, x: number, y: number) => {
      const animation = new Animation()
      const style = Style.from({ fillStyle: color })
      const circle = new Container([
        new Node(new Circle(0, 0, 10), style)
      ])
      circle.addTag('circle')
      circle.x = x
      circle.y = y
      circle.on('pointerover', () => {
        this.cursor = 'pointer'
        animation.start({ from: circle.scale, to: 2 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerout', () => {
        this.cursor = 'default'
        animation.start({ from: circle.scale, to: 1 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      content.add(circle)
    }

    for (let i = 0; i < 27; i++) {
      const x = Math.round(Math.random() * this.width)
      const y = Math.round(Math.random() * this.height)
      const color = colors[~~(Math.random() * colors.length)]
      addBall(color, x, y)
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

    this.root.add(cursor)

    this.render()
  }
}

