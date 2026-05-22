import { createTimeline, cubicBezier } from 'animejs'

export const DIVE_MS = 620

const EASE_DIVE = cubicBezier(0.4, 0, 0.2, 1)   // material standard — smooth in+out

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
  // Cap at 9× — enough to fill the screen without noticeable pixel blur
  const cover = Math.max(window.innerWidth, window.innerHeight)
  return Math.min((cover / Math.max(size, 24)) * 0.55, 9)
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
    scale: [1, maxScale],
    duration: DIVE_MS,
    ease: EASE_DIVE,
  }, 0)

  return {
    cancel: () => {
      tl.cancel()
      cameraEl.style.willChange = 'auto'
    },
  }
}
