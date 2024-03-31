import { Box, Bezier, Matrix, Path, Point, Segment, Circle } from '2d-geometry'
import { Node } from './Node'
import { Dataset } from './Dataset'
import { Layer } from './Layer'
import { Pencil } from './Pencil'
import { Style } from './Style'
import { TextStyle } from './TextStyle'
import { DragBehavior } from './DragBehavior'
import { ScrollBehavior } from './ScrollBehavior'
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
  pointPathStroke: '#599eff',
}
const LABEL_TEXT_STYLE = TextStyle.from({
  font: '16px serif',
  textAlign: 'center',
  textBaseline: 'top',
})
const LABEL_STYLE = Style.from({ fillStyle: colors.axisLine })

const AXIS_STYLE = Style.from({ strokeStyle: colors.axisLine })
const AXIS_TICK_STYLE = Style.from({ lineWidth: 2, strokeStyle: colors.axisLine })

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

  factor: number

  constructor(chart: Chart) {
    super(chart)
    this.factor = 1
  }

  render() {
    const { pencil } = this.chart

    pencil.style(GridNode.style)
    pencil.drawShape(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(0, this.factor * (this.chart.height - 2 * PADDING)),
      )
    )
    pencil.drawShape(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(this.factor * (this.chart.width - 2 * PADDING), 0),
      )
    )
  }
}

class PathNode extends Node {
  static style = Style.from({
    lineWidth: 2,
    strokeStyle: colors.pointPathStroke
  })

  fullShape: Path

  constructor(chart: Chart, dataset: Dataset) {
    super(chart)

    // See https://proandroiddev.com/drawing-bezier-curve-like-in-google-material-rally-e2b38053038c
    const points = dataset.entries.map(entry => [
      chart.scale.x(dataset.xGet(entry)),
      chart.scale.y(dataset.yGet(entry)),
    ])
    const controlPoints1 = [] as [number, number][]
    const controlPoints2 = [] as [number, number][]
    for (let i = 1; i < points.length; i++) {
      controlPoints1.push([(points[i][0] + points[i - 1][0]) / 2, points[i - 1][1]])
      controlPoints2.push([(points[i][0] + points[i - 1][0]) / 2, points[i][1]])
    }

    const parts = [] as Bezier[]
    for (let i = 1; i < points.length; i++) {
      const curve = new Bezier(
        new Point(points[i - 1][0], points[i - 1][1]),

        new Point(controlPoints1[i - 1][0], controlPoints1[i - 1][1]),
        new Point(controlPoints2[i - 1][0], controlPoints2[i - 1][1]),

        new Point(points[i][0], points[i][1]),
      )
      parts.push(curve)
    }

    this.shape = new Path(parts)
    this.style = PathNode.style
    this.fullShape = this.shape as Path
  }
}

class TextNode extends Node {
  static STYLE = Style.from({ fillStyle: 'black' })

  readonly text: string
  textStyle: TextStyle
  position: Point
  _dimensions: TextMetrics | null

  constructor(
    chart: Chart,
    text: string | number,
    position: Point,
    textStyle: TextStyle,
    style: Style = TextNode.STYLE,
  ) {
    super(chart)
    this.style = style ?? TextNode.STYLE
    this.text = String(text)
    this.textStyle = textStyle
    this.position = position
    this._dimensions = null
  }

  get dimensions() {
    if (!this._dimensions) {
      const pencil = this.chart.pencil
      const ctx = this.chart.ctx
      pencil.textStyle(this.textStyle)
      this._dimensions = ctx.measureText(this.text)
    }
    return this._dimensions
  }

  render() {
    const { pencil } = this.chart
    pencil.style(this.style)
    pencil.textStyle(this.textStyle)
    pencil.drawText(this.text, this.position)
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
        [this.dataset.stats.range.minY / 4, this.dataset.stats.range.maxY * 1.1],
        [0, graphBox.height]
      ),
    }

    this.layers = []
    this.layersByName = {}

    this.layersByName.content = new Layer(this, [], TRANSFORM_EMPTY.translate(graphBox.xmin, graphBox.ymin))

    const gridNode = new GridNode(this)
    this.layersByName.grid = new Layer(this, [gridNode])

    const pathNode = new PathNode(this, this.dataset)
    this.layersByName.path = new Layer(this, [pathNode])
    this.layersByName.points = new Layer(this, [])
    this.layersByName.xLabels = new Layer(this, [])

    this.layersByName.debug = new Layer(this, [
      // new DebugNode(this),
      // new Node(this, graphBox, Style.from({ strokeStyle: colors.debug }))
    ], TRANSFORM_EMPTY)

    this.layersByName.content.add(this.layersByName.path)
    this.layersByName.content.add(this.layersByName.points)
    this.layersByName.content.add(this.layersByName.xLabels)

    this.layers.push(this.layersByName.content)
    this.layers.push(this.layersByName.grid)
    this.layers.push(this.layersByName.debug)

    const drag = new DragBehavior(this, {
      onStart: () => {
        const content = this.layersByName.content
        content.alpha = 0.6
        this.render()
      },
      onMove: (_, dx) => {
        const content = this.layersByName.content
        content.transform = content.transform.translate(dx, 0)
        this.render()
      },
      onEnd: () => {
        const content = this.layersByName.content
        content.alpha = 1
        this.render()
      },
    })
    drag.enable()

    const scroll = new ScrollBehavior(this, {
      onScrollHorizontal: (event) => {
        const content = this.layersByName.content
        content.transform = content.transform.translate(
          event.deltaX / PIXEL_RATIO,
          0
        )
        this.render()
      },
      onScrollVertical: (event) => {
        const rangeWidth = this.scale.x.range[1] - this.scale.x.range[0]
        const dw = rangeWidth * 0.01 * (event.deltaY > 0 ? -1 : 1)

        const range = clampIntervalWidth([
          this.scale.x.range[0] - dw,
          this.scale.x.range[1] + dw,
        ] as [number, number], 400, 2_500)

        const xScale = linearScale(this.scale.x.domain, range)
        this.scale.x = xScale

        const pathNode = new PathNode(this, this.dataset)
        this.layersByName.path.clear()
        this.layersByName.path.add(pathNode)

        this.populateDataset()
        this.render()
      },
    })
    scroll.enable()

    pathNode.shape = Path.EMPTY
    this.populateDataset(0, 0)
    this.render()

    animate({ duration: 500, easing: Easing.EASE_IN_OUT, onChange: (f) => {
      gridNode.factor = f
      this.render()
    }})
    .then(() =>
      animate({
        from: 0,
        to: pathNode.fullShape.length,
        duration: 1_000,
        easing: Easing.EASE_IN_OUT,
        onChange: (length, done) => {
          if (done) {
            pathNode.shape = pathNode.fullShape
          } else {
            pathNode.shape = pathNode.fullShape.slice(0, length)
          }
          this.render()
        }
      })
    )
    .then(() =>
      animate({ from: 0, to: 3, duration: 250, easing: Easing.LINEAR, onChange: (r) => {
        this.populateDataset(r, 0)
        this.render()
      }})
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 500, easing: Easing.LINEAR, onChange: (f) => {
        this.populateDataset(3, f)
        this.render()
      }})
    )
  }

  populateDataset(r: number = 3, a: number = 1) {
    const dataset = this.dataset
    const points = this.layersByName.points
    const xLabels = this.layersByName.xLabels
    points.clear()
    xLabels.clear()
    xLabels.alpha = a

    let lastLabelX = -Infinity
    for (let i = 0; i < dataset.entries.length; i++) {
      const entry = dataset.entries[i]
      const x = this.scale.x(dataset.xGet(entry))
      const y = this.scale.y(dataset.yGet(entry))
      points.add(new Node(
        this,
        new Circle(new Point(x, y), r),
        Style.from({ fillStyle: colors.pointFill })
      ))
      if (lastLabelX < x) {
        const textNode = new TextNode(
          this,
          dataset.xLabel(entry),
          new Point(x, -5),
          LABEL_TEXT_STYLE,
          LABEL_STYLE,
        )
        lastLabelX = x + textNode.dimensions.width + 10
        xLabels.add(new Layer(this, [
          new Node(this, new Segment(x, -5, x, 5), AXIS_TICK_STYLE),
          textNode,
        ]))
      }
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

function clampIntervalWidth(interval: [number, number], minWidth: number, maxWidth: number) {
  const width = interval[1] - interval[0]

  if (width < minWidth) {
    const center = interval[0] + width / 2

    return [
      center - minWidth / 2,
      center + minWidth / 2,
    ] as [number, number]
  }

  if (width > maxWidth) {
    const center = interval[0] + width / 2

    return [
      center - maxWidth / 2,
      center + maxWidth / 2,
    ] as [number, number]
  }

  return interval
}

export default Chart
