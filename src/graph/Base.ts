import { Matrix } from '2d-geometry'
import type { Graph } from './Graph'

const EMPTY_CHILDREN = Object.freeze([]) as unknown as Base[]

export abstract class Base {
  parent: Base | null
  children: Base[]
  tags: Set<string> | null // FIXME: integers?

  visible: boolean
  transform: Matrix
  mask: Base | null
  alpha: number

  constructor() {
    this.parent = null
    this.children = EMPTY_CHILDREN
    this.visible = true
    this.transform = Matrix.IDENTITY.clone()
    this.mask = null
    this.alpha = NaN
    this.alpha = 1
    this.tags = null
  }

  get x() { return this.transform.tx }
  set x(n: number) { this.transform.tx = n }

  get y() { return this.transform.ty }
  set y(n: number) { this.transform.ty = n }

  get scale() { return this.transform.a }
  set scale(n: number) {
    this.transform.a = n
    this.transform.d = n
  }

  addTag(tag: string) {
    if (!this.tags) {
      this.tags = new Set()
    }
    this.tags.add(tag)
  }

  abstract render(graph: Graph): void
}
