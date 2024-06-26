import { Point, Vector } from '2d-geometry'
import type { Graph } from './Graph'
import type { Container } from './Container'
import { positionAtObject } from './position'
import { applyIndexes } from './traverse'

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

  dragstart: (origin: Point) => void,
  dragmove: (origin: Point, current: Point, offset: Vector) => void,
  dragend: (origin: Point, current: Point, offset: Vector) => void,

  wheel: (position: Point, event: WheelEvent) => void,
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

const OTHER_MASK = {
  'pointerdown':        1 << 0,
  'pointerup':          1 << 1,
  'pointerclick':       1 << 2,
  'dragmove':           1 << 3,
  'wheel':              1 << 4,
}
export type OtherEventName = keyof typeof OTHER_MASK

export class EventManager {
  graph: Graph

  moveNodes: Set<Container>
  moveNodesAsArray: Container[] | null
  hoverNode: Container | null
  enterNodes: Set<Container>

  nodesForEvent: Record<OtherEventName, {
    set: Set<Container>,
    array: Container[] | null
  }>
  downNode: Container | null
  upNode: Container | null

  dragNode: Container | null
  dragOrigin: Point
  dragPrevious: Point
  dragOccurred: boolean

  constructor(graph: Graph) {
    this.graph = graph

    this.moveNodes = new Set()
    this.moveNodesAsArray = null
    this.hoverNode = null
    this.enterNodes = new Set()

    this.nodesForEvent = {
      pointerdown: { set: new Set(), array: null },
      pointerup: { set: new Set(), array: null },
      pointerclick: { set: new Set(), array: null },
      dragmove: { set: new Set(), array: null },
      wheel: { set: new Set(), array: null },
    }
    this.downNode = null
    this.upNode = null
    this.dragNode = null
    this.dragOrigin = Point.EMPTY
    this.dragPrevious = Point.EMPTY
    this.dragOccurred = false

    this.enable()
  }

  enable() {
    this.graph.canvas.addEventListener('pointermove', this.onPointerMove)
    this.graph.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.graph.canvas.addEventListener('pointerup',   this.onPointerUp)
    this.graph.canvas.addEventListener('click',       this.onPointerClick)
    this.graph.canvas.addEventListener('touchstart',  this.onTouchStart)
    this.graph.canvas.addEventListener('wheel',       this.onWheel)
  }

  disable() {
    this.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.graph.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.graph.canvas.removeEventListener('pointerup',   this.onPointerUp)
    this.graph.canvas.removeEventListener('click',       this.onPointerClick)
    this.graph.canvas.removeEventListener('touchstart',  this.onTouchStart)
    this.graph.canvas.removeEventListener('wheel',       this.onWheel)
    this.stopDrag()
  }

  updateIndexes() {
    if (this.graph._validIndexes === false) {
      this.graph._validIndexes = true
      applyIndexes(this.graph.root)
    }
  }

  startDrag() {
    document.addEventListener('pointermove', this.onDragMove)
    document.addEventListener('pointerup',   this.onDragEnd)
  }

  stopDrag() {
    document.removeEventListener('pointermove', this.onDragMove)
    document.removeEventListener('pointerup',   this.onDragEnd)
    this.dragNode = null
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
      for (const event in OTHER_MASK) {
        if (this.nodesForEvent[event as OtherEventName].set.delete(node)) {
          this.nodesForEvent[event as OtherEventName].array = null
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
    if (event in OTHER_MASK) {
      this.nodesForEvent[event as OtherEventName].set.add(node)
      this.nodesForEvent[event as OtherEventName].array = null
    }
  }

  off(event: EventName, node: Container) {
    if (event in MOVE_MASK) {
      if (!updateMoveFlag(node, event as MoveEventName)) {
        this.moveNodes.delete(node)
        this.moveNodesAsArray = null
      }
    }
    if (event in OTHER_MASK) {
      if ((node.events.listeners[event]?.size ?? 0) === 0) {
        this.nodesForEvent[event as OtherEventName].set.delete(node)
        this.nodesForEvent[event as OtherEventName].array = null
      }
    }
  }

  render() {}

  onPointerMove = (event: PointerEvent) => {
    this.updateIndexes()
    const moveNodes = this.moveNodesAsArray ??= Array.from(this.moveNodes)
    const enterNodes = new Set<Container>()
    let capturingNode = null as Container | null

    for (let i = 0; i < moveNodes.length; i++) {
      const node = moveNodes[i]
      const listeners = node.events.listeners
      const position = positionAtObject(node, event)

      if (node.contains(position)) {
        if (!capturingNode || node.index > capturingNode.index) {
          capturingNode = node
        }

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

    if (this.hoverNode && this.hoverNode !== capturingNode) {
      const position = positionAtObject(this.hoverNode, event)
      this.hoverNode.events.listeners.pointerout?.forEach(l => l(position, event))
      this.hoverNode = null
      this.graph.canvas.style.cursor = 'auto'
    }

    if (capturingNode && capturingNode !== this.hoverNode) {
      const position = positionAtObject(capturingNode, event)
      capturingNode.events.listeners.pointerover?.forEach(l => l(position, event))
      this.hoverNode = capturingNode
      this.graph.canvas.style.cursor = capturingNode.events.cursor
    }

    this.enterNodes = enterNodes
  }

  onPointerDown = (event: PointerEvent) => {
    this.updateIndexes()
    const nodes =
      this.nodesForEvent.pointerdown.array ??=
        Array.from(this.nodesForEvent.pointerdown.set)
          .concat(Array.from(this.nodesForEvent.pointerclick.set))
          .concat(Array.from(this.nodesForEvent.dragmove.set))

    let capturingNode = null
    let capturingNodePosition = null

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const position = positionAtObject(node, event)
      if (node.contains(position)) {
        if (!capturingNode || node.index > capturingNode.index) {
          capturingNode = node
          capturingNodePosition = position
        }
      }
    }

    this.downNode = capturingNode
    this.dragOccurred = false

    if (capturingNode) {
      const listeners = capturingNode.events.listeners
      listeners.pointerdown?.forEach(l => l(capturingNodePosition!, event))

      // Drag start
      if (listeners.dragmove?.size) {
        const position = positionAtObject(capturingNode.parent!, event)
        this.dragNode = capturingNode
        this.dragOrigin = position
        this.dragPrevious = position
        this.startDrag()
        listeners.dragstart?.forEach(l => l(capturingNodePosition!))
      }
    }
  }

  onPointerUp = (event: PointerEvent) => {
    this.updateIndexes()
    const nodes =
      this.nodesForEvent.pointerup.array ??=
        Array.from(this.nodesForEvent.pointerup.set)
          .concat(Array.from(this.nodesForEvent.pointerclick.set))

    let capturingNode = null
    let capturingNodePosition = null

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const position = positionAtObject(node, event)
      if (node.contains(position)) {
        if (!capturingNode || node.index > capturingNode.index) {
          capturingNode = node
          capturingNodePosition = position
        }
      }
    }

    this.upNode = capturingNode

    if (capturingNode) {
      const listeners = capturingNode.events.listeners
      listeners.pointerup?.forEach(l => l(capturingNodePosition!, event))
      this.onPointerClick(event)
    }
  }

  onPointerClick = (event: MouseEvent) => {
    if (this.downNode && this.upNode && this.downNode === this.upNode && !this.dragOccurred) {
      const position = positionAtObject(this.upNode, event)
      this.upNode.events.listeners.pointerclick?.forEach(l => l(position, event))
    }
    this.downNode = null
    this.upNode = null
  }

  onTouchStart = (event: TouchEvent) => {
    if (this.dragNode) {
      event.preventDefault()
    }
  }

  onDragMove = (event: PointerEvent) => {
    const current = positionAtObject(this.dragNode!.parent!, event)
    const offset = new Vector(this.dragPrevious, current)
    const listeners = this.dragNode!.events.listeners
    listeners.dragmove?.forEach(l => l(this.dragOrigin, current, offset))
    this.dragPrevious = current
    this.dragOccurred = true
  }

  onDragEnd = (event: PointerEvent) => {
    const current = positionAtObject(this.dragNode!.parent!, event)
    const offset = new Vector(this.dragPrevious, current)
    const listeners = this.dragNode!.events.listeners
    listeners.dragend?.forEach(l => l(this.dragOrigin, current, offset))
    this.stopDrag()
  }

  onWheel = (event: WheelEvent) => {
    this.updateIndexes()
    const nodes = this.nodesForEvent.wheel.array ??= Array.from(this.nodesForEvent.wheel.set)

    let capturingNode = null
    let capturingNodePosition = null

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const position = positionAtObject(node, event)
      if (node.contains(position)) {
        if (!capturingNode || node.index > capturingNode.index) {
          capturingNode = node
          capturingNodePosition = position
        }
      }
    }

    if (capturingNode) {
      const listeners = capturingNode.events.listeners
      listeners.wheel?.forEach(l => l(capturingNodePosition!, event))
    }
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
