import { point, arc, ray, circle, Polygon, Circle, Quadratic, TAU, CW, CCW } from '2d-geometry'
import { parsePath } from '2d-geometry/svg'
import { intersect, subtract } from '2d-geometry'
import { Graph, Container, Node, Style } from 'pencil'
import * as elements from 'pencil/elements'

const red = '#D42222'
const yellow = '#D4A922'
const blue = '#2290D4'

export class Debug extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    const content = new Container([])
    content.x = 100
    content.y = 100

    const p = parsePath('M 0 0 A 150 150 0 0 0 100 100')[0]
    console.log(p.length)
    const n = node(p.slice(0, p.length / 2), Style.from({ stroke: yellow }))
    content.add(n)

    {
      const a = arc(point(0, 0), 50, 0, TAU / 4, false)
      const n = node(a, Style.from({ stroke: yellow }))
      n.y = 200
      content.add(n)
    }
    {
      const a = arc(point(0, 0), 50, -TAU / 8, TAU / 8, CCW)
      const n = node(a, Style.from({ stroke: yellow }))
      n.y = 400
      content.add(n)
    }

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(content)

    this.render()
  }
}

function dot(x: number, y: number, fill?: string) {
  return node(circle(x, y, 3), Style.from({ fill }))
}

function node(s: any, t: any) {
  return new Node(s, t)
}
