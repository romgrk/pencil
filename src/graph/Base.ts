import type { Matrix } from '2d-geometry'
import type { Graph } from './Graph'

const EMPTY_CHILDREN = Object.freeze([]) as unknown as Base[]

export abstract class Base {
  parent: Base | null
  children: Base[]
  tags: Set<string> // FIXME: integers?

  transform: Matrix | null
  mask: Base | null
  alpha: number

  constructor() {
    this.parent = null
    this.children = EMPTY_CHILDREN
    this.transform = null
    this.mask = null
    this.alpha = NaN
    this.alpha = 1
    this.tags = new Set()
  }

  abstract render(graph: Graph): void
}
