
let updateCallbacks = [] as (FrameRequestCallback | null)[]
let renderCallbacks = [] as (FrameRequestCallback | null)[]

let updateNextId = 1
let updateStartId = updateNextId

let renderNextId = 1
let renderStartId = renderNextId

let isScheduled = false

function onAnimationFrame(timestamp: number) {
  isScheduled = false

  updateStartId = updateNextId
  let currentUpdateCallbacks = updateCallbacks
  updateCallbacks = []
  for (let i = 0; i < currentUpdateCallbacks.length; i++) {
    currentUpdateCallbacks[i]?.(timestamp)
  }

  let currentRenderCallbacks = renderCallbacks
  renderCallbacks = []
  for (let i = 0; i < currentRenderCallbacks.length; i++) {
    currentRenderCallbacks[i]?.(timestamp)
  }
  renderStartId = renderNextId
}

export function requestUpdateFrame(fn: FrameRequestCallback) {
  const id = updateNextId++
  updateCallbacks.push(fn)
  if (!isScheduled) {
    requestAnimationFrame(onAnimationFrame)
    isScheduled = true
  }
  return id
}

export function cancelUpdateFrame(id: number) {
  const index = id - updateStartId
  if (index < 0 || index >= updateCallbacks.length) {
    return
  }
  updateCallbacks[index] = null
}

export function requestRenderFrame(fn: FrameRequestCallback) {
  const id = renderNextId++
  renderCallbacks.push(fn)
  if (!isScheduled) {
    requestAnimationFrame(onAnimationFrame)
    isScheduled = true
  }
  return id
}

export function cancelRenderFrame(id: number) {
  const index = id - renderStartId
  if (index < 0 || index >= renderCallbacks.length) {
    return
  }
  renderCallbacks[index] = null
}
