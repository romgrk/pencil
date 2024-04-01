import { Matrix } from '2d-geometry'
import { Dataset } from './Dataset'
import { Layer } from './Layer'
import { Pencil } from './Pencil'
import { PIXEL_RATIO, TRANSFORM_PIXEL_RATIO } from './constants'

const PADDING = 50


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

export class Chart {
  root: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  pencil: Pencil

  width: number
  height: number
  transform: Matrix

  layerRoot: Layer
  layersByName: Record<string, Layer>

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
  }

  render() {
    this.pencil.clear()
    this.layerRoot.render(this)
  }
}

export default Chart
