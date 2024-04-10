type Fn = (value: number) => number

export type LinearScale = {
  (value: number): number
  domain: [number, number]
  range: [number, number]
  inverse: Fn
}

/**
 * Equivalent for d3.scale.linear
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): LinearScale {

  let scale: LinearScale = getScale(domain, range) as any
  scale.domain = domain
  scale.range = range
  scale.inverse = getScale(range, domain)

  return scale
}

function getScale(
  domain: [number, number],
  range: [number, number],
): Fn {

  let scale: LinearScale
  if (domain[0] === domain[1] || range[0] === range[1]) {
    scale = ((_value: number) => range[0]) as any
  } else {
    const ratio = (range[1] - range[0]) / (domain[1] - domain[0])

    scale = ((value: number) => {
      return range[0] + ratio * (value - domain[0]);
    }) as any
  }

  return scale
}
