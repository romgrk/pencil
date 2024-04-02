import { Point } from '2d-geometry'
import type { Shape } from '2d-geometry'
import type { Graph } from './Graph'
import { Base } from './Base'
import { Style } from './Style'
import { TextStyle } from './TextStyle'
import { measureText } from './measureText'

export class Node extends Base {
  shape: Shape
  style: Style

  constructor(shape?: Shape, style?: Style) {
    super()
    this.shape = shape ?? Point.EMPTY
    this.style = style ?? Style.EMPTY
  }

  contains(p: Point) {
    return this.shape.contains(p)
  }

  render(graph: Graph) {
    graph.pencil.style(this.style)
    graph.pencil.draw(this.shape)
  }
}

export class TextNode extends Node {
  static STYLE = Style.from({ fillStyle: 'black' })

  readonly text: string
  textStyle: TextStyle
  position: Point
  _dimensions: TextMetrics | null

  constructor(
    text: string | number,
    position: Point,
    textStyle: TextStyle,
    style: Style = TextNode.STYLE,
  ) {
    super()
    this.style = style ?? TextNode.STYLE
    this.text = String(text)
    this.textStyle = textStyle
    this.position = position
    this._dimensions = null
  }

  get dimensions() {
    if (!this._dimensions) {
      this._dimensions = measureText(this.text, this.textStyle)
    }
    return this._dimensions
  }

  render(graph: Graph) {
    const { pencil } = graph
    pencil.style(this.style)
    pencil.textStyle(this.textStyle)
    pencil.drawText(this.text, this.position)
  }
}

