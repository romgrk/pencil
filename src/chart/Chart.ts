import { Box, Matrix } from '2d-geometry'
import { Dataset } from './Dataset'
import { Layer } from './Layer'
import { Pencil } from './Pencil'
import { linearScale, LinearScale } from './linearScale'
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

  content: Box

  layers: Layer[]
  layersByName: Record<string, Layer>

  dataset: Dataset
  scale: {
    x: LinearScale,
    y: LinearScale,
  }

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

    this.content = new Box(
      PADDING, PADDING,
      this.width - PADDING, this.height - PADDING
    )

    this.dataset = options.dataset
    this.scale = {
      x: linearScale(
        [this.dataset.stats.range.minX, this.dataset.stats.range.maxX],
        [0, this.content.width]
      ),
      y: linearScale(
        [this.dataset.stats.range.minY / 4, this.dataset.stats.range.maxY * 1.1],
        [0, this.content.height]
      ),
    }

    this.layers = []
    this.layersByName = {}
  }

  render() {
    this.pencil.clear()

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      layer.render(this)
    }
  }
}

export default Chart
