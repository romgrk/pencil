import { Box } from '2d-geometry'
import { EventManager } from './EventManager'
import { Container } from './Container'
import { Node } from './Node'
import { Pencil } from './Pencil'
import { PIXEL_RATIO } from './constants'
import { traverse } from'./traverse'

const CONTENT = `<canvas />`

export type Options = {
  width?: number,
  height?: number,
}

export type Mixin = {
  enable(): void
  disable(): void
}

export class Graph {
  domNode: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  pencil: Pencil

  width: number
  height: number

  root: Container
  background: Container
  layersByName: Record<string, Container>

  _eventManager: EventManager | null
  _validIndexes: boolean
  _disposables: Function[]

  constructor(root: HTMLElement, options?: Options) {
    this.domNode = root
    this.domNode.classList.add('PencilGraph')
    this.domNode.innerHTML = CONTENT
    this.canvas = this.domNode.querySelector('canvas')!
    this.ctx = this.canvas.getContext('2d')!
    this.pencil = new Pencil(this)

    this.width  = options?.width ?? 500
    this.height = options?.height ?? 300

    this.canvas.width = this.width * PIXEL_RATIO
    this.canvas.height = this.height * PIXEL_RATIO
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    this.root = new Container()
    this.root.graph = this
    this.background = new Container([new Node(new Box(0, 0, this.width, this.height))])
    this.root.add(this.background)
    this.layersByName = {}

    this._eventManager = null
    this._validIndexes = false
    this._disposables = []
  }

  set cursor(value: string) {
    this.canvas.style.cursor = value
  }

  get eventManager() {
    return this._eventManager ??= new EventManager(this)
  }

  attach(node: Container) {
    this._validIndexes = false
    traverse(node, node => {
      node.graph = this
      if (node._events) {
        this.eventManager.attach(node)
      }
    })
  }

  detach(node: Container) {
    this._validIndexes = false
    traverse(node, node => {
      node.graph = null
      if (node._events) {
        this.eventManager.detach(node)
      }
    })
  }

  defer(fn: Function) {
    this._disposables.push(fn)
  }

  destroy() {
    this._eventManager?.destroy()
    this._disposables.forEach(d => d())
  }

  render() {
    this.pencil.setup()
    this.root.render(this)
    this._eventManager?.render()
  }
}

export default Graph
