import { Point, Matrix, Shape } from '2d-geometry'
import type { Graph } from './Graph'
import { traverse } from './traverse'
import type { EventName, Events, EventListeners } from './EventManager'

export type EventMeta = {
  moveFlag: number
  cursor: HTMLElement['style']['cursor']
  listeners: EventListeners
}
const createEvents = () => ({ moveFlag: 0, cursor: 'auto', listeners: {} }) as EventMeta

export class Container {
  graph: Graph | null
  parent: Container | null
  children: Container[]
  tags: Set<string> | null // FIXME: integers?

  visible: boolean
  mask: Shape | null
  alpha: number

  _x: number
  _y: number
  _rotation: number
  _scale: number
  _transform: Matrix | null

  _events: EventMeta | null

  constructor(children: Container[] = []) {
    this.graph = null
    this.parent = null
    this.children = children
    this.tags = null

    this.visible = true
    this.mask = null
    this.alpha = NaN
    this.alpha = 1

    this._x = NaN
    this._x = 0
    this._y = NaN
    this._y = 0
    this._rotation = NaN
    this._rotation = 0
    this._scale = NaN
    this._scale = 1
    this._transform = null

    this._events = null

    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }

  }

  get x() { return this._x }
  set x(n: number) { this._x = n; this._transform = null }

  get y() { return this._y }
  set y(n: number) { this._y = n; this._transform = null }

  get rotation() { return this._rotation }
  set rotation(n: number) { this._rotation = n; this._transform = null }

  get scale() { return this._scale }
  set scale(n: number) { this._scale = n; this._transform = null }

  get transform() {
    return this._transform ??= Matrix.fromTransform(
      this._x,
      this._y,
      this._rotation,
      this._scale,
    )
  }

  get events() { return this._events ??= createEvents() }

  hasTransform() {
    return this._x !== 0 || this._y !== 0 || this._rotation !== 0 || this._scale !== 1
  }

  needsContext() {
    return this._x !== 0 || this._y !== 0 || this._rotation !== 0 || this._scale !== 1 || this.alpha !== 1 || this.mask !== null
  }

  on<T extends EventName>(event: T, callback: Events[T]) {
    this._events ??= createEvents()
    this._events.listeners[event] ??= new Set() as any
    this._events.listeners[event]!.add(callback)
    this.graph?.eventManager.on(event, this)
  }

  off<T extends EventName>(event: T, callback: Events[T]) {
    const listeners = this._events?.listeners[event]
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
