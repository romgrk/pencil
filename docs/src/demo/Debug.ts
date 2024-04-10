// import { point, Arc, Circle, Quadratic, TAU } from '2d-geometry'
import { Graph, Container } from 'pencil'
import * as elements from 'pencil/elements'


export class Debug extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([])
    this.root.add(content)

    this.render()
  }
}

