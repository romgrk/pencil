export class Dataset<T = unknown> {
  entries: T[]
  xGet: (t: T) => number
  yGet: (t: T) => number
  stats: Stats

  constructor(entries: T[], xGet: (t: T) => number, yGet: (t: T) => number) {
    this.entries = entries
    this.xGet = xGet
    this.yGet = yGet
    this.stats = computeStats(this, 0, entries.length)
  }
}

type Stats = ReturnType<typeof computeStats>
function computeStats<T>(dataset: Dataset<T>, startIndex: number, endIndex: number) {
  let minX = +Infinity
  let maxX = -Infinity
  let minY = +Infinity
  let maxY = -Infinity
  let maxYTotal = -Infinity
  let minYTotal = +Infinity

  for (let i = 0; i < dataset.entries.length; i++) {
    const entry = dataset.entries[i]

    const y = dataset.yGet(entry)

    if (y > maxYTotal)
      maxYTotal = y

    if (y < minYTotal)
      minYTotal = y

    if (i < startIndex || i >= endIndex)
      continue

    if (y < minY)
      minY = y
    if (y > maxY)
      maxY = y

    const x = dataset.xGet(entry)

    if (x < minX)
      minX = x
    if (x > maxX)
      maxX = x
  }

  [minYTotal, maxYTotal] = domainWithPadding([minYTotal, maxYTotal])
  if (minYTotal > 0)
    minYTotal = 0

  if (maxYTotal === 0)
    maxYTotal = 10

  const range = { minX, maxX, minY, maxY }
  const total = { maxY: maxYTotal, minY: minYTotal }

  return { range, total }
}

function domainWithPadding([start, end]: [number, number], factor: number = 4): [number, number] {
  const range = end - start
  const newRange = boundFor(range / factor)

  let newStart = sign(start, -1) * Math.ceil(Math.abs(start / newRange)) * newRange
  if (start >= 0 && newStart < 0)
    newStart = 0

  const newEnd = newStart + (newRange * Math.ceil((end - newStart) / newRange))

  return [newStart, newEnd]
}

function boundFor(n: number): number {
  const decimal = 10 ** Math.ceil(Math.log10(n))

  if ((decimal / 4) > n)
    return (decimal / 4)

  if ((decimal / 2) > n)
    return (decimal / 2)

  return decimal
}

function sign(n: number, defaultSign: number) {
  return Math.sign(n) || defaultSign
}
