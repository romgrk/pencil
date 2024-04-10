import { Point, Matrix, Shape } from '2d-geometry'
import type { Graph } from './Graph'
import type { EventName, Events, EventListeners } from './EventManager'

export type EventMeta = {
  moveFlag: number
  cursor: HTMLElement['style']['cursor']
  listeners: EventListeners
}
const createEvents = () => ({ moveFlag: 0, cursor: 'auto', listeners: {} }) as EventMeta

type Options = { x?: number, y?: number, rotation?: number, scale?: number }

export class Container {
  index: number
  graph: Graph | null
  parent: Container | null
  children: Container[]

  visible: boolean
  mask: Shape | null
  alpha: number

  _x: number
  _y: number
  _rotation: number
  _scale: number
  _transform: Matrix | null

  _events: EventMeta | null

  constructor(children: Container[] = [], options?: Options) {
    this.index = -1
    this.graph = null
    this.parent = null
    this.children = children

    this.visible = true
    this.mask = null
    this.alpha = NaN
    this.alpha = 1

    this._x = NaN
    this._x = options?.x ?? 0
    this._y = NaN
    this._y = options?.y ?? 0
    this._rotation = NaN
    this._rotation = options?.rotation ?? 0
    this._scale = NaN
    this._scale = options?.scale ?? 1
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
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].contains(point)) {
        return true
      }
    }
    return false
  }

  render(graph: Graph) {
    if (!this.visible) return

    const { pencil } = graph

    const needsContext = this.needsContext()

    if (needsContext) {
      pencil.prepare(this)
    }

    for (let j = 0; j < this.children.length; j++) {
      const child = this.children[j]
      if (child.constructor === Container) {
        child.render(graph)
      } else if (child.visible) {
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
