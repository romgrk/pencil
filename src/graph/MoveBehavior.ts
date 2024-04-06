import type { Container } from './Container'
import type { EventManager } from './EventManager'
import { positionAtObjectCached } from './position'

export class MoveBehavior {
  eventManager: EventManager
  nodesHover: Set<Container>

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.nodesHover = new Set()
  }

  enable() {
    this.eventManager.graph.canvas.addEventListener('pointermove', this.onPointerMove)
  }

  disable() {
    this.eventManager.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  onPointerMove = (event: PointerEvent) => {

    const previousHover = new Set(this.nodesHover)

    for (let node of this.nodesHover.values()) {
      const position = positionAtObjectCached(node, event, this.eventManager.transformCache)

      if (!node.contains(position)) {
        node.listeners!['pointerout']?.forEach(l => l(position, event))
        this.nodesHover.delete(node)
      }
    }

    const newNodesHover = new Set<Container>()

    for (let node of this.eventManager.nodesByEvent['pointerover'].values()) {
      if (!previousHover.has(node)) {
        const position = positionAtObjectCached(node, event, this.eventManager.transformCache)

        if (node.contains(position)) {
          node.listeners!['pointerover'].forEach(l => l(position, event))
          newNodesHover.add(node)
        }
      }
    }

    for (let node of newNodesHover.values()) {
      this.nodesHover.add(node)
    }
  }
}
