import type { Chart } from './Chart'

const EMPTY_CHILDREN = Object.freeze([]) as unknown as Base[]

export abstract class Base {
  parent: Base | null
  children: Base[]
  alpha: number
  tags: Set<string> // FIXME: integers?

  constructor() {
    this.parent = null
    this.children = EMPTY_CHILDREN
    this.alpha = NaN
    this.alpha = 1
    this.tags = new Set()
  }

  abstract render(chart: Chart): void
}
