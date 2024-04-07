import type { Container } from './Container'
import type { EventManager, EventName } from './EventManager'
import { positionAtObjectCached } from './position'

export const moveEvents: EventName[] = [
  'pointerout',
  'pointerover',
  'pointerenter',
  'pointerleave',
  'pointermove',
  'pointermove_global',
]

export const MOVE_MASK = {
  'pointerout':         1 << 0,
  'pointerover':        1 << 1,
  'pointerenter':       1 << 2,
  'pointerleave':       1 << 3,
  'pointermove':        1 << 4,
  'pointermove_global': 1 << 5,
}
const MOVE_MASK_FULL = Object.values(MOVE_MASK).reduce((full, current) => full | current, 0)

function updateMaskFlag(flag: number, event: keyof typeof MOVE_MASK, value: boolean) {
  if (value) {
    return flag | MOVE_MASK[event]
  } else {
    return flag & (MOVE_MASK_FULL ^ MOVE_MASK[event])
  }
}

export class MoveBehavior {
  eventManager: EventManager
  nodeHover: Container | null
  nodesEnter: Set<Container>

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.nodeHover = null
    this.nodesEnter = new Set()
  }

  enable() {
    this.eventManager.graph.canvas.addEventListener('pointermove', this.onPointerMove)
  }

  disable() {
    this.eventManager.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  onPointerMove = (event: PointerEvent) => {

    const previousEnter = new Set(this.nodesEnter)
    const newNodesEnter = new Set<Container>()

    // pointerenter
    // pointerleave
    // pointerover
    // pointerout
    // pointermove

    const allNodes = new Set([
      ...this.eventManager.nodesByEvent['pointerover'],
    ])

    for (let node of this.eventManager.nodesByEvent['pointerover'].values()) {
      if (!previousEnter.has(node)) {
        const position = positionAtObjectCached(node, event, this.eventManager.transformCache)

        if (node.contains(position)) {
          node._events!['pointerover'].forEach(l => l(position, event))
          newNodesEnter.add(node)
        }
      }
    }

    for (let node of newNodesEnter.values()) {
      this.nodesEnter.add(node)
    }
  }
}
