// import BezierEasing from 'bezier-easing'

export type Animation = ReturnType<typeof animate>
export type EasingFn = (t: number) => number

export const Easing = {
  LINEAR:      (t: number) => t,
  EASE_IN_OUT: (t: number) => t * t * (3 - 2 * t),
  // BEZIER:      BezierEasing,
}

type Options = {
  from?: number,
  to?: number,
  duration: number,
  delay?: number,
  easing?: EasingFn,
}

type AnimateCallback = (value: number, done: boolean) => void

type AnimatePromise = Promise<void> & { cancel: Function }

/**
 * Animate a value using `requestAnimationFrame()`. This function does not
 * call `options.onChange` in the current event loop cycle. It is not guaranteed
 * to stop exactly after `options.duration`, but it does guarantee that it will
 * never call `options.onChange` with a value outside `options.to`.
 */
export default function animate(options: Options, onChange: AnimateCallback) {
  const { from = 0, to = 1, duration, delay = 0, easing = Easing.EASE_IN_OUT } = options
  const start = performance.now()
  let id = 0

  let resolve: Function
  const promise = new Promise((_resolve) => { resolve = _resolve }) as AnimatePromise

  const step = (timestamp: number) => {
    const elapsed = timestamp - start - delay

    if (elapsed < 0) {
      id = requestAnimationFrame(step)
    } else if (elapsed >= duration) {
      onChange(to, true)
      resolve()
    } else {
      onChange(lerp(easing(elapsed / duration), from, to), false)
      id = requestAnimationFrame(step)
    }
  }

  promise.cancel = () => { cancelAnimationFrame(id) }

  id = requestAnimationFrame(step)

  return promise
}

export function lerp(factor: number, a: number, b: number) {
  return a * (1 - factor) + b * factor
}
