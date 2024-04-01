import { Matrix } from '2d-geometry'
import { Dataset } from './Dataset'
import { Base } from './Base'
import { Layer } from './Layer'
import { Pencil } from './Pencil'
import { PIXEL_RATIO, TRANSFORM_PIXEL_RATIO, TRANSFORM_EMPTY } from './constants'

// <div class='ZenChart'>
//   <canvas class='ZenChart__canvas' />
// </div>

const CONTENT = `
  <canvas class="ZenChart__canvas" />
`

export type Options = {
  width?: number,
  height?: number,
  dataset: Dataset<any>,
}

export type Mixin = {
  disable?(): void
}

export class Graph {
  root: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  pencil: Pencil

  width: number
  height: number
  transform: Matrix

  layerRoot: Layer
  layersByName: Record<string, Layer>

  mixins: Mixin[]

  constructor(root: HTMLElement, options: Options) {
    this.root = root
    this.root.classList.add('ZenChart')
    this.root.innerHTML = CONTENT
    this.canvas = this.root.querySelector('canvas')!
    this.ctx = this.canvas.getContext('2d')!
    this.pencil = new Pencil(this)

    this.width = options.width ?? 500
    this.height = options.height ?? 300

    this.canvas.width = this.width * PIXEL_RATIO
    this.canvas.height = this.height * PIXEL_RATIO
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    this.transform = TRANSFORM_PIXEL_RATIO

    this.layerRoot = new Layer()
    this.layersByName = {
      root: this.layerRoot
    }

    this.mixins = []
  }

  destroy() {
    this.mixins.forEach(m => m.disable?.())
  }

  render() {
    this.pencil.clear()
    this.layerRoot.render(this)
  }

  traverseWithTransform(fn: (element: Base, transform: Matrix) => void) {
    const transforms = [this.transform]
    let currentTransform = this.transform

    function traverse(element: Base, fn: (element: Base, transform: Matrix) => void) {
      currentTransform =
        element.transform === TRANSFORM_EMPTY ?
          currentTransform :
          currentTransform.multiply(element.transform)
      transforms.push(currentTransform)
      fn(element, currentTransform)
      for (let i = 0; i < element.children.length; i++) {
        traverse(element.children[i], fn)
      }
      transforms.pop()
      currentTransform = transforms[transforms.length - 1]
    }

    traverse(this.layerRoot, fn)
  }
}

export default Graph
