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

  pointerdown: (position: Point, event: PointerEvent) => void,
  pointerup: (position: Point, event: PointerEvent) => void,
  pointerclick: (position: Point, event: MouseEvent) => void,
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

const CONTACT_MASK = {
  'pointerdown':        1 << 0,
  'pointerup':          1 << 1,
  'pointerclick':       1 << 2,
}
export type ContactEventName = keyof typeof CONTACT_MASK

export class EventManager {
  graph: Graph
  transformCache: Map<Container, Matrix>

  moveNodes: Set<Container>
  moveNodesAsArray: Container[] | null
  hoverNode: Container | null
  enterNodes: Set<Container>

  nodesForEvent: Record<ContactEventName, {
    set: Set<Container>,
    array: Container[] | null
  }>
  downNode: Container | null
  upNode: Container | null

  constructor(graph: Graph) {
    this.graph = graph
    this.transformCache = new Map()

    this.moveNodes = new Set()
    this.moveNodesAsArray = null
    this.hoverNode = null
    this.enterNodes = new Set()

    this.nodesForEvent = {
      pointerdown: { set: new Set(), array: null },
      pointerup: { set: new Set(), array: null },
      pointerclick: { set: new Set(), array: null },
    }
    this.downNode = null
    this.upNode = null

    this.enable()
  }

  enable() {
    this.graph.canvas.addEventListener('pointermove', this.onPointerMove)
    this.graph.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.graph.canvas.addEventListener('pointerup',   this.onPointerUp)
    this.graph.canvas.addEventListener('click',       this.onPointerClick)
  }

  disable() {
    this.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.graph.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.graph.canvas.removeEventListener('pointerup',   this.onPointerUp)
    this.graph.canvas.removeEventListener('click',       this.onPointerClick)
  }

  onPointerDown = (event: PointerEvent) => {
    const nodes =
      this.nodesForEvent.pointerdown.array ??=
        Array.from(this.nodesForEvent.pointerdown.set)
          .concat(Array.from(this.nodesForEvent.pointerclick.set))

    let capturingNode = null
    let capturingNodePosition = null

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const position = positionAtObjectCached(node, event, this.transformCache)
      if (node.contains(position)) {
        capturingNode = node
        capturingNodePosition = position
      }
    }

    if (capturingNode) {
      const listeners = capturingNode.events.listeners
      listeners.pointerdown?.forEach(l => l(capturingNodePosition!, event))
    }

    this.downNode = capturingNode
  }

  onPointerUp = (event: PointerEvent) => {
    const nodes =
      this.nodesForEvent.pointerup.array ??=
        Array.from(this.nodesForEvent.pointerup.set)
          .concat(Array.from(this.nodesForEvent.pointerclick.set))

    let capturingNode = null
    let capturingNodePosition = null

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const position = positionAtObjectCached(node, event, this.transformCache)
      if (node.contains(position)) {
        capturingNode = node
        capturingNodePosition = position
      }
    }

    if (capturingNode) {
      const listeners = capturingNode.events.listeners
      listeners.pointerup?.forEach(l => l(capturingNodePosition!, event))
      if (capturingNode === this.downNode) {
        listeners.pointerclick?.forEach(l => l(capturingNodePosition!, event))
      }
    }
  }

  onPointerClick = (event: MouseEvent) => {
    if (this.downNode && this.upNode && this.downNode === this.upNode) {
      const position = positionAtObjectCached(this.upNode, event, this.transformCache)
      this.upNode.events.listeners.pointerclick?.forEach(l => l(position, event))
    }
    this.downNode = null
    this.upNode = null
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
      for (const event in CONTACT_MASK) {
        if (this.nodesForEvent[event as ContactEventName].set.delete(node)) {
          this.nodesForEvent[event as ContactEventName].array = null
        }
      }
    }
  }

  on(event: EventName, node: Container) {
    if (event in MOVE_MASK) {
      updateMoveFlag(node, event as MoveEventName) // no need to check, we know we need to listen
      this.moveNodes.add(node)
      this.moveNodesAsArray = null
    }
    if (event in CONTACT_MASK) {
      this.nodesForEvent[event as ContactEventName].set.add(node)
      this.nodesForEvent[event as ContactEventName].array = null
    }
  }

  off(event: EventName, node: Container) {
    if (event in MOVE_MASK) {
      if (!updateMoveFlag(node, event as MoveEventName)) {
        this.moveNodes.delete(node)
        this.moveNodesAsArray = null
      }
    }
    if (event in CONTACT_MASK) {
      if ((node.events.listeners[event]?.size ?? 0) === 0) {
        this.nodesForEvent[event as ContactEventName].set.delete(node)
        this.nodesForEvent[event as ContactEventName].array = null
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
      const position = positionAtObjectCached(this.hoverNode, event, this.transformCache)
      this.hoverNode.events.listeners.pointerout?.forEach(l => l(position, event))
      this.hoverNode = null
      this.graph.canvas.style.cursor = 'auto'
    }

    // FIXME: enterNodeLast not precise enough for good hover behavior
    if (enterNodeLast && enterNodeLast !== this.hoverNode) {
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
