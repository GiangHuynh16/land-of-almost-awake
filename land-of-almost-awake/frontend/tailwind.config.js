/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'rose-1': '#EFB0C9',
        'rose-2': '#F4C2D7',
        'rose-3': '#F8DAE9',
        'rose-d': '#c87aa0',
        'blue-1': '#B9D6F3',
        'blue-2': '#A1C9F1',
        'blue-d': '#6b9ed4',
        cream: '#F1E8D9',
        ink: '#4a3142',
        'ink-soft': '#826878',
        'ink-faint': '#c0a9b6',
        line: '#ecdde3',
        page: '#fbf2e7',
        paper: '#fdf6ec',
        'bg-card': '#ffffff',
        'bg-deep': '#f1e8d9',
        ua: '#EFB0C9',
        'ua-d': '#b86a8b',
        ub: '#A1C9F1',
        'ub-d': '#5e8ac4',
      },
      fontFamily: {
        serif: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 22px rgba(96,58,78,0.10)',
        deep: '0 22px 50px rgba(96,58,78,0.20)',
        soft: '0 4px 14px rgba(96,58,78,0.08)',
      },
      borderRadius: {
        pill: '999px',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 36px rgba(96,58,78,0.18), 0 0 0 0 rgba(239,176,201,0.5)' },
          '50%': { boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 36px rgba(96,58,78,0.18), 0 0 0 14px rgba(239,176,201,0.0)' },
        },
        stampDrop: {
          '0%': { transform: 'scale(2.6) rotate(15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.9) rotate(-9deg)', opacity: '1' },
          '75%': { transform: 'scale(1.06) rotate(-7deg)' },
          '100%': { transform: 'scale(1) rotate(-7deg)', opacity: '1' },
        },
        inkSplash: {
          '0%': { transform: 'scale(0.2)', opacity: '0.9' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 6px rgba(255,250,240,0.6), 0 0 0 8px rgba(239,176,201,0.6), 0 0 30px rgba(239,176,201,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255,250,240,0.6), 0 0 0 8px rgba(239,176,201,0.6), 0 0 60px rgba(239,176,201,0.7)' },
        },
        raySpin: {
          to: { transform: 'rotate(360deg)' },
        },
        fall: {
          to: { transform: 'translateY(120vh) rotate(720deg)', opacity: '0.2' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          from: { transform: 'translateY(20px) scale(0.98)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        orbPulse: 'orbPulse 2.6s ease-in-out infinite',
        stampDrop: 'stampDrop 0.85s cubic-bezier(0.34,1.56,0.64,1) both',
        inkSplash: 'inkSplash 0.95s ease-out 0.2s both',
        glow: 'glow 3s ease-in-out infinite',
        raySpin: 'raySpin 22s linear infinite',
        fadeUp: 'fadeUp 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
        rise: 'rise 0.32s cubic-bezier(0.2,0.8,0.2,1)',
        fadeIn: 'fadeIn 0.2s ease',
      },
    },
  },
  plugins: [],
};

