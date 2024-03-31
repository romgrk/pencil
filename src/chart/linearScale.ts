/**
 * Equivalent for d3.scale.linear
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
) {

  if (domain[0] === domain[1] || range[0] === range[1]) {
    return (value: number) => range[0]
  }

  const ratio = (range[1] - range[0]) / (domain[1] - domain[0])

  return (value: number) => {
    return range[0] + ratio * (value - domain[0]);
  };
}

export type LinearScale = (x: number) => number
