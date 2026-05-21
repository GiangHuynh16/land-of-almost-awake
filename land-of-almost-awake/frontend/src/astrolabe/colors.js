function clamp01(v) { return Math.max(0, Math.min(1, v)) }

function hexToRgb(h) {
  const s = h.replace('#', '')
  const n = parseInt(s, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

export function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex)
  const m = clamp01(amt)
  return rgbToHex(r + (255 - r) * m, g + (255 - g) * m, b + (255 - b) * m)
}

export function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex)
  const m = clamp01(amt)
  return rgbToHex(r * (1 - m), g * (1 - m), b * (1 - m))
}
