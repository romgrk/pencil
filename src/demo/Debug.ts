import { point, Arc, Circle, Quadratic, TAU } from '2d-geometry'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { animate, Animation } from '../graph/animate'
import * as elements from '../graph/elements'


export class Debug extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([])
    this.root.add(content)

    this.render()
  }
}

