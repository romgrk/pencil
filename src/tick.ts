export type Callback = (t: number, dt: number) => void
export type TickResult = ReturnType<typeof tick>

const noop = () => {}

/**
 * Run a callback on every animation frame.
 */
export function tick(onChange: Callback = noop) {
  let id = 0
  let last = performance.now()
  let callback = onChange

  const step = (timestamp: number) => {
    id = requestAnimationFrame(step)
    callback(timestamp, timestamp - last)
    last = timestamp
  }

  const start = (onChange?: Callback) => {
    if (onChange) {
      callback = onChange
    }
    id = requestAnimationFrame(step)
  }
  const stop = () => { cancelAnimationFrame(id) }

  return { start, stop }
}
