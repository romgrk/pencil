import { Bezier, Box, Path, Point, Segment, Circle, lerp } from '2d-geometry'
import {
  Node,
  Text,
  Container,
  Style,
  TextStyle,
  linearScale,
  LinearScale,
  animate,
  Easing,
  positionAtObject,
  PIXEL_RATIO,
} from 'pencil'
import { Graph, Options as GraphOptions } from 'pencil/Graph'
import * as elements from 'pencil/elements'
import * as Interval from '../interval'
import { Dataset } from '../Dataset'

export type Options = GraphOptions & {
  dataset: Dataset<any>,
}

const colors = {
  debug: '#ff0000dd',
  axisLine: '#aaa',
  axisLabel: '#777',
  pointFill: '#599eff',
  pathStroke: '#599eff',
}

const PADDING = 50

const AXIS_TICK_STYLE = Style.from({ stroke: colors.axisLine })
const LABEL_STYLE = Style.from({ fill: colors.axisLabel })
const LABEL_TEXT_STYLE = TextStyle.from({
  font: '16px serif',
  textAlign: 'center',
  textBaseline: 'top',
})

class AxisLines extends Node {
  static style = Style.from({ stroke: colors.axisLine })

  factor: number = 1

  render(graph: Graph) {
    const { pencil } = graph

    const origin = new Point(PADDING, graph.height - PADDING)

    pencil.style(AxisLines.style)
    pencil.draw(
      new Segment(
        origin,
        origin.translate(0, this.factor * -(graph.height - 2 * PADDING)),
      )
    )
    pencil.draw(
      new Segment(
        origin,
        origin.translate(this.factor * (graph.width - 2 * PADDING), 0),
      )
    )
  }
}

class PathNode extends Node {
  static style = Style.from({
    lineWidth: 2,
    stroke: colors.pathStroke
  })

  static buildPath(graph: LinearChart, dataset: Dataset) {
    // See https://proandroiddev.com/drawing-bezier-curve-like-in-google-material-rally-e2b38053038c
    const points = dataset.entries.map(entry => [
      graph.scale.x(dataset.xGet(entry)),
      graph.scale.y(dataset.yGet(entry)),
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

    return new Path(parts)
  }

  fullShape: Path

  constructor(graph: LinearChart, dataset: Dataset) {
    super()

    this.shape = PathNode.buildPath(graph, dataset)
    this.style = PathNode.style
    this.fullShape = this.shape as Path
  }
}

class PathAreaNode extends Node {
  constructor(graph: LinearChart, dataset: Dataset) {
    super()

    const path = PathNode.buildPath(graph, dataset)
    path.parts.unshift(new Segment(
      new Point(path.parts[0].start.x, graph.content.height),
      path.parts[0].start,
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, graph.content.height),
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, graph.content.height),
    ))

    this.shape = path
    this.style = Style.from({
      fill: {
        positions: [0, 0, 0, graph.content.height],
        stops: [
          [0.0, colors.pathStroke + '11'],
          [0.6, colors.pathStroke + '11'],
          [1.0, colors.pathStroke + '11'],
        ],
      }
    })
  }
}

export class LinearChart extends Graph {
  content: Box
  dataset: Dataset
  scale: {
    x: LinearScale,
    y: LinearScale,
  }

  constructor(root: HTMLElement, options: Options) {
    super(root, options)

    this.content = new Box(PADDING, PADDING, this.width - PADDING, this.height - PADDING)

    this.dataset = options.dataset
    this.scale = {
      x: linearScale(
        [this.dataset.stats.range.minX, this.dataset.stats.range.maxX],
        [0, this.content.width]
      ),
      y: linearScale(
        [this.dataset.stats.range.minY / 4, this.dataset.stats.range.maxY * 1.1],
        [this.content.height, 0]
      ),
    }

    this.layersByName.container = new Container(
      [],
      { x: this.content.xmin, y: this.content.ymin }
    )
    this.layersByName.content = new Container([])

    const axisNode = new AxisLines()
    this.layersByName.axis = new Container([axisNode])

    const pathNode = new PathNode(this, this.dataset)
    const pathAreaNode = new PathAreaNode(this, this.dataset)
    this.layersByName.path = new Container([
      pathNode,
      pathAreaNode,
    ])
    this.layersByName.points = new Container([])
    this.layersByName.xLabels = new Container([])

    this.layersByName.content.add(this.layersByName.path)
    this.layersByName.content.add(this.layersByName.points)
    this.layersByName.content.add(this.layersByName.xLabels)

    this.layersByName.container.add(this.layersByName.content)

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(this.layersByName.container)
    this.root.add(this.layersByName.axis)

    const cursorShape = new Circle(100, 100, 10)
    const cursor = new Node(cursorShape, Style.from({ stroke: 'red' }))
    this.root.add(new Container([cursor]))

    this.background.on('dragstart', () => {
      this.layersByName.path.alpha = 0.7
      this.layersByName.points.children.forEach((p: Container) => {
        p.alpha = 0.7
      })
      this.render()
    })
    this.background.on('dragmove', (_, __, { x: dx }) => {
      const content = this.layersByName.content
      content.x += dx
      this.render()
    })
    this.background.on('dragend', () => {
      this.layersByName.path.alpha = 1
      this.layersByName.points.children.forEach((p: Container) => {
        p.alpha = 1
      })
      this.render()
    })

    let scrollAnimation: Promise<void> | undefined
    this.background.on('wheel', (_, event) => {
      if (event.deltaX !== 0) {
        onScrollHorizontal(event)
      } else {
        onScrollVertical(event)
      }
    })
    const onScrollHorizontal = (event: WheelEvent) => {
      const content = this.layersByName.content
      content.x += event.deltaX / PIXEL_RATIO
      this.render()
    }
    const onScrollVertical = (event: WheelEvent) => {
      if (scrollAnimation) {
        return
      }
      if (event.deltaX !== 0) {
        return
      }

      const position = positionAtObject(this.layersByName.content, event)
      position.x -= this.layersByName.content.x

      const currentWidth = this.scale.x.domain[1] - this.scale.x.domain[0]
      const nextWidth = currentWidth * (event.deltaY < 0 ? 0.5 : 2)

      const n = position.x / (this.scale.x.range[1] - this.scale.x.range[0])

      const center = this.scale.x.domain[0] + currentWidth * n

      const extent = this.dataset.stats.range.maxX - this.dataset.stats.range.minX
      if (nextWidth < extent / 10 || nextWidth > extent) {
        return
      }

      scrollAnimation = animate({
        from: 0,
        to: 1,
      }, (f) => {
        const domainWidth = lerp(currentWidth, nextWidth, f)
        const domain = Interval.clampWidth([
          center - domainWidth * n,
          center + domainWidth * (1 - n),
        ] as [number, number], extent / 10, extent)

        this.scale.x = linearScale(domain, this.scale.x.range)

        const pathNode = new PathNode(this, this.dataset)
        const pathAreaNode = new PathAreaNode(this, this.dataset)
        this.layersByName.path.clear()
        this.layersByName.path.add(pathNode)
        this.layersByName.path.add(pathAreaNode)

        this.populateDataset()

        this.render()
      })
      .then(() => { scrollAnimation = undefined })
    }


    // Setup

    pathNode.shape = new Path([])
    pathAreaNode.alpha = 0
    this.populateDataset(0, 0)
    this.render()

    animate({ duration: 500, easing: Easing.EASE_IN_OUT }, (f) => {
      axisNode.factor = f
      this.render()
    })
    .then(() =>
      animate({ from: 0, to: pathNode.fullShape.length, duration: 1_000, easing: Easing.EASE_IN_OUT },
        (length, done) => {
          if (done) {
            pathNode.shape = pathNode.fullShape
          } else {
            pathNode.shape = pathNode.fullShape.slice(0, length)
          }
          this.render()
        }
      )
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 250, easing: Easing.LINEAR }, (f) => {
        this.populateDataset(1 + 2 * f, 0)
        this.render()
      })
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 500, easing: Easing.LINEAR }, (f) => {
        pathAreaNode.alpha = f
        this.populateDataset(3, f)
        this.render()
      })
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

      const point = new Container([
        new Node(
          new Circle(0, 0, r), Style.from({ fill: colors.pointFill })
        )
      ])
      point.x = x
      point.y = y

      points.add(point)

      if (lastLabelX < x) {
        const textNode = new Text(
          dataset.xLabel(entry),
          new Point(x, this.content.height + 5),
          LABEL_TEXT_STYLE,
          LABEL_STYLE,
        )
        lastLabelX = x + textNode.dimensions.width + 40
        xLabels.add(new Container([
          new Node(new Segment(
            x, this.content.height,
            x, this.content.height + 3,
          ), AXIS_TICK_STYLE),
          textNode,
        ]))
      }
    }
  }

}
