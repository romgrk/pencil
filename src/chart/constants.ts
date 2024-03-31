import { Matrix } from '2d-geometry'

export const PIXEL_RATIO = (typeof window !== 'undefined' && window.devicePixelRatio) || 1

export const TRANSFORM_EMPTY = new Matrix(
  1, 0,
  0, 1,
  0, 0
)

export const TRANSFORM_PIXEL_RATIO = new Matrix(
  PIXEL_RATIO, 0,
  0, PIXEL_RATIO,
  0, 0
)
