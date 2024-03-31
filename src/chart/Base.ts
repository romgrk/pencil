const EMPTY_CHILDREN = Object.freeze([]) as unknown as Base[]

export abstract class Base {
  parent: Base | null
  children: Base[]

  constructor() {
    this.parent = null
    this.children = EMPTY_CHILDREN
  }

  abstract render(): void
}
