import { Circle, Matrix } from '2d-geometry'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { Animation } from '../graph/animate'
import * as elements from '../graph/elements'

export class DemoEvents extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([], Matrix.IDENTITY)
    this.root.add(content)

    const cursor = new Container([
      new Node(new Circle(0, 0, 8), Style.from({ stroke: '#e45050' }))
    ])

    const colors = [
      '#568fff',
      '#566eff',
      '#5451e7',
      '#7b51e7',
      '#a251e7',
      '#b551e7',
    ]

    const addBall = (color: string, x: number, y: number) => {
      const animation = new Animation()
      const style = Style.from({ fill: color })
      const node = new Node(new Circle(0, 0, 10), style)
      const circle = new Container([node])
      circle.addTag('circle')
      circle.x = x
      circle.y = y
      circle.events.cursor = 'pointer'
      circle.on('pointerenter', () => {
        animation.start({ from: circle.scale, to: 1.5 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerleave', () => {
        animation.start({ from: circle.scale, to: 1 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerdown', () => {
        animation.start({ from: circle.scale, to: 1.3, duration: 100 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerup', () => {
        animation.start({ from: circle.scale, to: 1.5, duration: 100 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerclick', () => {
        node.style = Style.from({ fill: colors[~~(Math.random() * colors.length)] })
        this.render()
      })
      circle.on('dragmove', (_, __, offset) => {
        circle.x += offset.x
        circle.y += offset.y
        this.render()
      })
      circle.on('wheel', (_, event) => {
        circle.scale *= event.deltaY > 0 ? 1.1 : 0.9
        this.render()
      })
      content.add(circle)
    }

    {
      const animation = new Animation()
      const style = Style.from({ fill: colors[0] })
      const circle = new Container([
        new Node(new Circle(0, 0, 50), style)
      ])
      circle.addTag('circle')
      circle.x = 300
      circle.y = 300
      circle.events.cursor = 'pointer'
      circle.on('pointerenter', () => {
        animation.start({ from: circle.scale, to: 1.5 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerleave', () => {
        animation.start({ from: circle.scale, to: 1 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerdown', () => {
        animation.start({ from: circle.scale, to: 1.4 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      circle.on('pointerup', () => {
        animation.start({ from: circle.scale, to: 1.5 }, (scale) => {
          circle.scale = scale
          this.render()
        })
      })
      content.add(circle)
    }

    for (let i = 0; i < 100; i++) {
      const x = Math.round(Math.random() * this.width)
      const y = Math.round(Math.random() * this.height)
      const color = colors[~~(Math.random() * colors.length)]
      addBall(color, x, y)
    }

    this.root.add(cursor)

    this.render()
  }
}

