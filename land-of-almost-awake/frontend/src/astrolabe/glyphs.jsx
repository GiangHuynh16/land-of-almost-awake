export const GLYPHS = {
  miamas: (
    <g>
      <path d="M 50 80 C 24 60, 22 40, 36 30 C 46 24, 50 32, 50 38 C 50 32, 54 24, 64 30 C 78 40, 76 60, 50 80 Z" />
      <path d="M 50 38 C 46 26, 40 22, 44 14 C 38 22, 44 30, 50 38 Z" />
    </g>
  ),
  mibatalos: (
    <g>
      <path d="M 50 18 L 56 30 L 56 64 L 50 70 L 44 64 L 44 30 Z" />
      <rect x="34" y="56" width="32" height="3" />
      <path d="M 30 78 L 70 38" strokeWidth="3" stroke="currentColor" fill="none" />
      <circle cx="50" cy="74" r="3" />
    </g>
  ),
  miploris: (
    <g>
      <path d="M 22 36 L 50 56 L 78 36 L 78 70 L 22 70 Z" />
      <path d="M 22 36 L 50 18 L 78 36" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M 50 56 C 50 64 46 68 50 74 C 54 68 50 64 50 56" />
    </g>
  ),
  mimovas: (
    <g>
      <path d="M 30 70 C 28 40, 50 26, 72 30 C 64 50, 50 64, 30 70 Z" />
      <path d="M 30 70 C 42 60, 54 50, 64 38" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="62" r="2" />
      <circle cx="52" cy="48" r="2" />
    </g>
  ),
  miaudacas: (
    <g>
      <path d="M 50 14 L 56 44 L 86 50 L 56 56 L 50 86 L 44 56 L 14 50 L 44 44 Z" />
      <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </g>
  ),
  miveritas: (
    <g>
      <circle cx="34" cy="34" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="66" cy="66" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M 42 42 L 60 60" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M 56 60 L 60 64 L 56 68" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M 38 42 L 42 38 L 46 42" stroke="currentColor" strokeWidth="3" fill="none" />
    </g>
  ),

  // small stamps
  acorn: <g><path d="M 50 22 C 32 22, 30 38, 30 38 L 70 38 C 70 38, 68 22, 50 22 Z" /><path d="M 32 38 C 32 58, 40 78, 50 78 C 60 78, 68 58, 68 38 Z" /><path d="M 50 16 L 50 22" stroke="currentColor" strokeWidth="2" /></g>,
  moth: <g><path d="M 50 30 C 22 30, 16 60, 22 70 C 36 64, 44 50, 50 50 C 56 50, 64 64, 78 70 C 84 60, 78 30, 50 30 Z" /><path d="M 50 28 L 50 70" stroke="currentColor" strokeWidth="2" /><circle cx="50" cy="32" r="3" /></g>,
  star: <g><path d="M 50 18 L 58 42 L 84 44 L 64 60 L 72 84 L 50 70 L 28 84 L 36 60 L 16 44 L 42 42 Z" /></g>,
  crown: <g><path d="M 22 64 L 28 36 L 40 56 L 50 30 L 60 56 L 72 36 L 78 64 Z" /><rect x="22" y="64" width="56" height="6" /></g>,
  feather: <g><path d="M 32 76 C 34 56, 44 30, 70 22 C 68 46, 58 64, 36 76 Z" /><path d="M 70 22 L 30 80" stroke="currentColor" strokeWidth="1.5" fill="none" /></g>,
  bell: <g><path d="M 50 22 C 32 22, 30 48, 28 60 L 72 60 C 70 48, 68 22, 50 22 Z" /><path d="M 28 60 L 72 60 L 70 66 L 30 66 Z" /><circle cx="50" cy="74" r="4" /></g>,
  candle: <g><rect x="44" y="28" width="12" height="42" /><rect x="38" y="68" width="24" height="8" /><path d="M 50 18 C 46 22, 50 26, 50 28 C 50 26, 54 22, 50 18 Z" /></g>,
  spiral: <g><path fill="none" stroke="currentColor" strokeWidth="3.5" d="M 50 50 m 20 0 a 20 20 0 1 1 -16 -19 a 14 14 0 1 1 12 14 a 9 9 0 1 1 -8 -9" /></g>,
  bee: <g><ellipse cx="50" cy="56" rx="22" ry="14" /><path d="M 38 50 L 38 62 M 50 46 L 50 66 M 62 50 L 62 62" stroke="#f5e9d3" strokeWidth="3" /><path d="M 30 44 C 24 36, 32 30, 40 40 Z" /><path d="M 70 44 C 76 36, 68 30, 60 40 Z" /></g>,
  wave: <g><path fill="none" stroke="currentColor" strokeWidth="4" d="M 14 50 Q 26 30, 38 50 T 62 50 T 86 50" /><path fill="none" stroke="currentColor" strokeWidth="4" d="M 14 66 Q 26 46, 38 66 T 62 66 T 86 66" /></g>,
  arrow: <g><path d="M 18 70 L 78 70 L 78 64 L 64 50 L 78 36 L 78 30 L 18 30 Z" /><circle cx="28" cy="50" r="3" fill="#f5e9d3" /></g>,
  tree: <g><path d="M 50 18 L 28 50 L 38 50 L 22 72 L 38 72 L 28 84 L 72 84 L 62 72 L 78 72 L 62 50 L 72 50 Z" /><rect x="46" y="80" width="8" height="8" /></g>,
}

export const STAMP_KEYS = ['acorn', 'moth', 'star', 'crown', 'feather', 'bell', 'candle', 'spiral', 'bee', 'wave', 'arrow', 'tree']
