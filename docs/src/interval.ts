export function clampWidth(interval: [number, number], minWidth: number, maxWidth: number) {
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

