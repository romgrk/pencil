import { Point, Matrix } from '2d-geometry'
import type { Graph } from './Graph'
import { traverse } from './traverse'
import { EventName } from './EventManager'

export class Container {
  graph: Graph | null
  parent: Container | null
  children: Container[]
  tags: Set<string> | null // FIXME: integers?
  listeners: Record<string, Set<Function>> | null

  visible: boolean
  transform: Matrix
  mask: Container | null
  alpha: number

  constructor(children: Container[] = [], transform?: Matrix, mask?: Container, alpha?: number) {
    this.graph = null
    this.parent = null
    this.children = children
    this.tags = null
    this.listeners = null

    this.visible = true
    this.transform = transform ?? Matrix.IDENTITY.clone()
    this.mask = mask ?? null
    this.alpha = NaN
    this.alpha = alpha ?? 1

    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }
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

  needsContext() {
    return !this.transform.isIdentity() || this.alpha !== 1 || this.mask !== null
  }

  on(event: EventName, callback: Function) {
    this.listeners ??= {}
    this.listeners[event] ??= new Set()
    this.listeners[event].add(callback)
    this.graph?.eventManager.on(event, this)
  }

  off(event: EventName, callback: Function) {
    const listeners = this.listeners?.[event]
    if (listeners) {
      listeners.delete(callback)
      this.graph?.eventManager.off(event, this)
    }
  }

  add(node: Container) {
    node.parent = this
    this.children.push(node)
    this.graph?.attach(node)
  }

  remove(node: Container) {
    if (node.parent === this) {
      const index = this.children.findIndex(c => c !== node)
      if (index !== -1) {
        this.children.splice(index, 1)
        this.graph?.detach(node)
      }
      node.parent = null
    }
  }

  clear() {
    this.children.forEach(node => {
      node.parent = null
      this.graph?.detach(node)
    })
    this.children.length = 0
  }

  contains(point: Point) {
    const currentPoint =
      this.transform.isIdentity() ? point : point.transform(this.transform.invert())

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].contains(currentPoint)) {
        return true
      }
    }
    return false
  }

  addTag(tag: string) {
    this.tags ??= new Set()
    this.tags.add(tag)
  }

  query(tag: string): Container | null {
    try {
      traverse(this, child => {
        if (child.tags && child.tags.has(tag)) {
          throw child
        }
      })
    } catch (result: any) {
      return result
    }
    return null
  }

  queryAll(tag: string) {
    const result = [] as Container[]
    traverse(this, child => {
      if (child.tags && child.tags.has(tag)) {
        result.push(child)
      }
    })
    return result
  }

  render(graph: Graph) {
    const { pencil } = graph

    const needsContext = this.needsContext()

    if (needsContext) {
      pencil.prepare(this)
    }

    for (let j = 0; j < this.children.length; j++) {
      const child = this.children[j]
      if (child.constructor === Container) {
        child.render(graph)
      } else {
        const needsContext = child.needsContext()

        if (needsContext) {
          pencil.prepare(child)
        }

        child.render(graph)

        if (needsContext) {
          pencil.restore()
        }
      }
    }

    if (needsContext) {
      pencil.restore()
    }
  }
}
