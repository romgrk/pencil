import { Box, Matrix, Point, Segment, Circle } from '2d-geometry'
import { Node } from './Node'
import { Dataset } from './Dataset'
import { Layer } from './Layer'
import { Pencil } from './Pencil'
import { Style } from './Style'
import { linearScale, LinearScale } from './linearScale'
import animate, { Easing } from './animate'
import { PIXEL_RATIO, TRANSFORM_EMPTY, TRANSFORM_PIXEL_RATIO } from './constants'

// <div class='ZenChart'>
//   <canvas class='ZenChart__canvas' />
// </div>

const CONTENT = `
  <canvas class="ZenChart__canvas" />
`

const PADDING = 50
const AXIS_ORIGIN = new Point(PADDING, PADDING)

export type Options = {
  width?: number,
  height?: number,
  dataset: Dataset<any>,
}

const colors = {
  debug: '#ff0000dd',
  axisLine: '#d0d0d0',
  pointFill: '#599eff',
}

class DebugNode extends Node {
  render() {
    const { ctx } = this.chart

    ctx.lineWidth = 2
    ctx.strokeStyle = colors.debug
    ctx.strokeRect(
      0,
      0,
      this.chart.width - 1,
      this.chart.height - 1,
    )
  }
}

class GridNode extends Node {
  static style = Style.from({ strokeStyle: colors.axisLine })

  render() {
    const { pencil } = this.chart

    pencil.style(GridNode.style)
    pencil.drawShape(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(0, this.chart.height - 2 * PADDING),
      )
    )
    pencil.drawShape(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(this.chart.width - 2 * PADDING, 0),
      )
    )
  }
}

export class Chart {
  root: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  pencil: Pencil

  width: number
  height: number
  transform: Matrix

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

    const graphBox = new Box(
      PADDING, PADDING,
      this.width - PADDING, this.height - PADDING
    )

    this.dataset = options.dataset
    this.scale = {
      x: linearScale(
        [this.dataset.stats.range.minX, this.dataset.stats.range.maxX],
        [0, graphBox.width]
      ),
      y: linearScale(
        [this.dataset.stats.range.minY, this.dataset.stats.range.maxY],
        [0, graphBox.height]
      ),
    }

    this.layers = []
    this.layersByName = {}

    this.layersByName.content = new Layer(this, [])
    this.layersByName.grid = new Layer(this, [new GridNode(this)])

    const pointsMask = new Box(0, 0, 0, graphBox.height)
    this.layersByName.points = new Layer(
      this,
      [],
      TRANSFORM_EMPTY.translate(graphBox.xmin, graphBox.ymin),
      new Node(this, pointsMask)
    )

    this.layersByName.debug = new Layer(this, [
      new DebugNode(this),
      new Node(this, graphBox, Style.from({ strokeStyle: colors.debug }))
    ], TRANSFORM_EMPTY)

    this.layersByName.content.add(this.layersByName.grid)
    this.layersByName.content.add(this.layersByName.points)

    this.layers.push(this.layersByName.content)
    this.layers.push(this.layersByName.debug)

    this.populateDataset()
    this.render()

    animate({
      from: 0,
      to: graphBox.width,
      duration: 1_000,
      easing: Easing.EASE_IN_OUT,
      onChange: (width) => {
        pointsMask.xmax = width
        this.render()
      }
    })
  }

  populateDataset() {
    const dataset = this.dataset
    const layer = this.layersByName.points
    layer.clear()

    for (let i = 0; i < dataset.entries.length; i++) {
      const entry = dataset.entries[i]
      const x = this.scale.x(dataset.xGet(entry))
      const y = this.scale.y(dataset.yGet(entry))
      layer.add(new Node(
        this,
        new Circle(new Point(x, y), 2),
        Style.from({ fillStyle: colors.pointFill })
      ))
    }
  }

  render() {
    this.pencil.clear()

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      layer.render()
    }
  }
}

export default Chart
