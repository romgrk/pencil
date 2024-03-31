
export type StyleOptions = {
  lineWidth: number
  strokeStyle: string | null
  fillStyle: string | null
}

const DEFAULT_OPTIONS = {
  lineWidth: 1,
  strokeStyle: null,
  fillStyle: null,
}

export class Style {
  id: number
  options: StyleOptions

  static nextId = 1
  static styleByHash = new Map<string, Style>

  static EMPTY = Style.from({})

  static from(someOptions: Partial<StyleOptions>) {
    const options = Object.assign({}, DEFAULT_OPTIONS, someOptions)
    const hash = options.lineWidth + '##' + options.strokeStyle + '##' + options.fillStyle
    {
      const style = Style.styleByHash.get(hash)
      if (style) {
        return style
      }
    }
    const style = new Style(Style.nextId++, options)
    Style.styleByHash.set(hash, style)
    return style
  }

  constructor(id: number, options: StyleOptions) {
    this.id = id
    this.options = options
  }
}

