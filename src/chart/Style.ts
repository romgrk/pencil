
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

  static from(someOptions: Partial<StyleOptions>): Style;
  static from(lineWidth: number, strokeStyle?: string | null, fillStyle?: string | null): Style;
  static from(a: unknown, b?: unknown, c?: unknown) {
    let options: StyleOptions
    let hash: string

    if (typeof a === 'object') {
      options = Object.assign({}, DEFAULT_OPTIONS, a)
      hash = options.lineWidth + '#' + options.strokeStyle + '#' + options.fillStyle
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
    else {
      const lineWidth   = (a as number) ?? DEFAULT_OPTIONS.lineWidth
      const strokeStyle = (b as string) ?? DEFAULT_OPTIONS.strokeStyle
      const fillStyle   = (c as string) ?? DEFAULT_OPTIONS.fillStyle
      hash = lineWidth + '##' + strokeStyle + '##' + fillStyle
      {
        const style = Style.styleByHash.get(hash)
        if (style) {
          return style
        }
      }
      options = { lineWidth, strokeStyle, fillStyle }
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

