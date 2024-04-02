import { Matrix } from '2d-geometry'

export const PIXEL_RATIO = (typeof window !== 'undefined' && window.devicePixelRatio) || 1

export const TRANSFORM_PIXEL_RATIO = Matrix.IDENTITY.scale(PIXEL_RATIO, PIXEL_RATIO)
