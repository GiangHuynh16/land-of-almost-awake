import { createTimeline, cubicBezier } from 'animejs'

export const DIVE_MS = 560
// How early (ms before zoom ends) to signal onNearComplete so the caller can start fading in the next scene
export const DIVE_OVERLAP_MS = 180

const EASE_DIVE = cubicBezier(0.22, 0, 0.36, 1)   // strong ease-out: fast start, soft landing

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
  // Cap at 5× — browser renders SVG crisply at this scale; higher causes visible pixel blur
  const safeSize = Number.isFinite(size) && size > 0 ? size : 48
  const cover = Math.max(window.innerWidth, window.innerHeight)
  return Math.max(1, Math.min((cover / Math.max(safeSize, 24)) * 0.32, 5))
}

function setCameraAt(cameraEl, anchor, scale) {
  if (!cameraEl) return
  cameraEl.style.transformOrigin = `${anchor.x}px ${anchor.y}px`
  cameraEl.style.transform = `translate3d(0, 0, 0) scale3d(${scale}, ${scale}, 1)`
}

export function resetCamera(cameraEl) {
  if (!cameraEl) return
  cameraEl.style.transform = ''
  cameraEl.style.transformOrigin = ''
  cameraEl.style.willChange = 'auto'
}

export function runDiveZoom(cameraEl, anchor, maxScale, { onNearComplete, onComplete } = {}) {
  setCameraAt(cameraEl, anchor, 1)
  cameraEl.style.willChange = 'transform'

  // Fire onNearComplete DIVE_OVERLAP_MS before the end so the caller can start fading in the
  // next scene while the zoom is still running — eliminates the visible pause between zoom end
  // and scene transition.
  let nearFired = false
  const overlapTimer = onNearComplete
    ? setTimeout(() => { nearFired = true; onNearComplete() }, Math.max(0, DIVE_MS - DIVE_OVERLAP_MS))
    : null

  const tl = createTimeline({
    autoplay: true,
    onComplete: () => {
      cameraEl.style.willChange = 'auto'
      if (onNearComplete && !nearFired) onNearComplete()
      onComplete?.()
    },
  })

  tl.add(cameraEl, {
    scale: [1, maxScale],
    duration: DIVE_MS,
    ease: EASE_DIVE,
  }, 0)

  return {
    cancel: () => {
      clearTimeout(overlapTimer)
      tl.cancel()
      cameraEl.style.willChange = 'auto'
    },
  }
}
