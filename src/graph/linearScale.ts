
export type LinearScale = {
  (value: number): number
  domain: [number, number]
  range: [number, number]
}

/**
 * Equivalent for d3.scale.linear
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): LinearScale {

  let scale: LinearScale
  if (domain[0] === domain[1] || range[0] === range[1]) {
    scale = ((_value: number) => range[0]) as any
  } else {
    const ratio = (range[1] - range[0]) / (domain[1] - domain[0])

    scale = ((value: number) => {
      return range[0] + ratio * (value - domain[0]);
    }) as any
  }

  scale.domain = domain
  scale.range = range

  return scale
}
