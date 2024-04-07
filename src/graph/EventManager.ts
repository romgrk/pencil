import { Point, Matrix } from '2d-geometry'
import type { Graph } from './Graph'
import type { Container } from './Container'
import { positionAtObjectCached } from './position'

export type Events = {
  pointerover: (position: Point, event: PointerEvent) => void,
  pointerout: (position: Point, event: PointerEvent) => void,
  pointerenter: (position: Point, event: PointerEvent) => void,
  pointerleave: (position: Point, event: PointerEvent) => void,
  pointermove: (position: Point, event: PointerEvent) => void,
  pointermove_global: (position: Point, event: PointerEvent) => void,
}
export type EventListeners = { [K in keyof Events]?: Set<Events[K]> }
export type EventName = keyof Events

const MOVE_MASK = {
  'pointerout':         1 << 0,
  'pointerover':        1 << 1,
  'pointerenter':       1 << 2,
  'pointerleave':       1 << 3,
  'pointermove':        1 << 4,
  'pointermove_global': 1 << 5,
}
const MOVE_MASK_FULL = Object.values(MOVE_MASK).reduce((full, current) => full | current, 0)
export type MoveEventName = keyof typeof MOVE_MASK


export class EventManager {
  graph: Graph
  transformCache: Map<Container, Matrix>

  moveNodes: Set<Container>
  moveNodesAsArray: Container[] | null
  hoverNode: Container | null
  enterNodes: Set<Container>

  constructor(graph: Graph) {
    this.graph = graph
    this.transformCache = new Map()

    this.moveNodes = new Set()
    this.moveNodesAsArray = null

    this.hoverNode = null
    this.enterNodes = new Set()

    this.enable()
  }

  enable() {
    this.graph.canvas.addEventListener('pointermove', this.onPointerMove)
  }

  disable() {
    this.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  destroy() {
    this.disable()
  }

  attach(node: Container) {
    if (node._events) {
      for (let event in node._events.listeners) {
        this.on(event as EventName, node)
      }
    }
  }

  detach(node: Container) {
    if (node._events) {
      if (this.moveNodes.delete(node)) {
        this.moveNodesAsArray = null
      }
    }
  }

  on(event: EventName, node: Container) {
    if (event in MOVE_MASK) {
      updateMoveFlag(node, event) // no need to check, we know we need to listen
      this.moveNodes.add(node)
      this.moveNodesAsArray = null
    }
  }

  off(event: EventName, node: Container) {
    if (event in MOVE_MASK) {
      if (!updateMoveFlag(node, event)) {
        this.moveNodes.delete(node)
        this.moveNodesAsArray = null
      }
    }
  }

  render() {
    this.transformCache = new Map()
  }

  onPointerMove = (event: PointerEvent) => {
    const moveNodes = this.moveNodesAsArray ??= Array.from(this.moveNodes)
    const enterNodes = new Set<Container>()
    let enterNodeLast = null as Container | null

    for (let i = 0; i < moveNodes.length; i++) {
      const node = moveNodes[i]
      const listeners = node.events.listeners
      const position = positionAtObjectCached(node, event, this.transformCache)

      if (node.contains(position)) {
        console.log('contains', node, position)
        enterNodeLast = node

        enterNodes.add(node)
        if (!this.enterNodes.has(node)) {
          listeners.pointerenter?.forEach(l => l(position, event))
        }
        listeners.pointermove?.forEach(l => l(position, event))
      } else {
        if (this.enterNodes.has(node)) {
          listeners.pointerleave?.forEach(l => l(position, event))
        }
      }
      listeners.pointermove_global?.forEach(l => l(position, event))
    }

    if (this.hoverNode && this.hoverNode !== enterNodeLast) {
      console.log('out', enterNodeLast, this.hoverNode)
      const position = positionAtObjectCached(this.hoverNode, event, this.transformCache)
      this.hoverNode.events.listeners.pointerout?.forEach(l => l(position, event))
      this.hoverNode = null
      this.graph.canvas.style.cursor = 'auto'
    }

    // FIXME: enterNodeLast not precise enough for good hover behavior
    if (enterNodeLast && enterNodeLast !== this.hoverNode) {
      console.log('over', enterNodeLast, this.hoverNode)
      const position = positionAtObjectCached(enterNodeLast, event, this.transformCache)
      enterNodeLast.events.listeners.pointerover?.forEach(l => l(position, event))
      this.hoverNode = enterNodeLast
      this.graph.canvas.style.cursor = enterNodeLast.events.cursor
    }

    this.enterNodes = enterNodes
  }
}

function updateMoveFlag(node: Container, event: MoveEventName) {
  const events = node.events
  const isListening = (events.listeners[event]?.size ?? 0) > 0

  const newFlag = isListening ?
    events.moveFlag | MOVE_MASK[event] :
    events.moveFlag & (MOVE_MASK_FULL ^ MOVE_MASK[event])

  events.moveFlag = newFlag

  return events.moveFlag !== 0
}
