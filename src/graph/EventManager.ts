import { Point, Matrix } from '2d-geometry'
import { Graph } from './Graph'
import { Container } from './Container'
import { MoveBehavior } from './MoveBehavior'

export type Events = {
  pointerover: { position: Point, event: PointerEvent },
  pointerout: { position: Point, event: PointerEvent },
  pointermove: { position: Point, event: PointerEvent },
  pointermove_global: { position: Point, event: PointerEvent },
}
export type EventName = keyof Events

export type BehaviorName = 'move'

const behaviorByEvent: Record<EventName, BehaviorName> = {
  'pointerout': 'move',
  'pointerover': 'move',
  'pointermove': 'move',
  'pointermove_global': 'move',
}

export class EventManager {
  graph: Graph
  nodesByEvent: Record<string, Set<Container>>
  transformCache: Map<Container, Matrix>

  hover: MoveBehavior

  constructor(graph: Graph) {
    this.graph = graph

    this.nodesByEvent = {}
    this.transformCache = new Map() // FIXME: invalidation

    this.hover = new MoveBehavior(this)
    this.hover.enable()
  }

  destroy() {
    this.hover.disable()
  }

  attach(node: Container) {
    if (node.listeners) {
      for (let eventName in node.listeners) {
        this.nodesByEvent[eventName] ??= new Set()
        this.nodesByEvent[eventName].add(node)
      }
    }
  }

  detach(node: Container) {
    if (node.listeners) {
      for (let eventName in node.listeners) {
        this.nodesByEvent[eventName]?.delete(node)
      }
    }
  }

  on(event: EventName, node: Container) {
    this.nodesByEvent[event] ??= new Set()
    this.nodesByEvent[event].add(node)
  }

  off(event: EventName, node: Container) {
    if (node.listeners![event].size === 0) {
      this.nodesByEvent[event].delete(node)
    }
  }
}
