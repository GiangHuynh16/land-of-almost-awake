import { createTimeline, cubicBezier } from 'animejs'

export const DIVE_HOLD_MS = 1000
export const DIVE_SNAP_MS = 520
export const DIVE_MS = DIVE_HOLD_MS + DIVE_SNAP_MS

const EASE_HEAVY = 'linear'
const EASE_SNAP = cubicBezier(0.84, 0, 1, 0.28)

export function anchorInCamera(cameraEl, viewportOrigin) {
  const cam = cameraEl.getBoundingClientRect()
  if (!viewportOrigin) {
    return { x: cam.width / 2, y: cam.height / 2, size: 48 }
  }
  return {
    x: viewportOrigin.x - cam.left,
    y: viewportOrigin.y - cam.top,
    size: viewportOrigin.size ?? 48,
  }
}

export function zoomScaleForOrb(size = 48) {
  const cover = Math.max(window.innerWidth, window.innerHeight)
  return Math.min((cover / Math.max(size, 16)) * 1.02, 28)
}

function scaleTransform(s) {
  return `translate3d(0, 0, 0) scale3d(${s}, ${s}, 1)`
}

export function setCameraAt(cameraEl, anchor, scale) {
  cameraEl.style.transformOrigin = `${anchor.x}px ${anchor.y}px`
  cameraEl.style.transform = scaleTransform(scale)
}

export function resetCamera(cameraEl) {
  if (!cameraEl) return
  cameraEl.style.transform = ''
  cameraEl.style.transformOrigin = ''
  cameraEl.style.willChange = 'auto'
}

export function runDiveZoom(cameraEl, anchor, maxScale, { onComplete } = {}) {
  setCameraAt(cameraEl, anchor, 1)
  cameraEl.style.willChange = 'transform'

  const tl = createTimeline({
    autoplay: true,
    onComplete: () => {
      setCameraAt(cameraEl, anchor, maxScale)
      cameraEl.style.willChange = 'auto'
      onComplete?.()
    },
  })

  tl.add(cameraEl, {
    scale: [1, 1.035],
    duration: DIVE_HOLD_MS,
    ease: EASE_HEAVY,
  }, 0)
  tl.add(cameraEl, {
    scale: [1.035, maxScale],
    duration: DIVE_SNAP_MS,
    ease: EASE_SNAP,
  }, DIVE_HOLD_MS)

  return {
    cancel: () => {
      tl.cancel()
      cameraEl.style.willChange = 'auto'
    },
  }
}
