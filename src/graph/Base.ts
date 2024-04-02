import { Matrix } from '2d-geometry'
import type { Graph } from './Graph'

const EMPTY_CHILDREN = Object.freeze([]) as unknown as Base[]

export abstract class Base {
  parent: Base | null
  children: Base[]
  tags: Set<string> | null // FIXME: integers?

  transform: Matrix
  mask: Base | null
  alpha: number

  constructor() {
    this.parent = null
    this.children = EMPTY_CHILDREN
    this.transform = Matrix.IDENTITY
    this.mask = null
    this.alpha = NaN
    this.alpha = 1
    this.tags = null
  }

  addTag(tag: string) {
    if (!this.tags) {
      this.tags = new Set()
    }
    this.tags.add(tag)
  }

  abstract render(graph: Graph): void
}
