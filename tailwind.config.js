/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040711',
        surface: '#090e1d',
        'surface-elevated': '#10172e',
        'surface-glass': 'rgba(16, 23, 46, 0.75)',
        accent: {
          cyan: '#00f0ff',
          neon: '#00e5ff',
          magenta: '#ff0055',
          plasma: '#e000ff',
          lime: '#00ff66',
          amber: '#ffaa00',
          red: '#ff3366',
        },
        sector: {
          free: '#141c33',
          contiguous: '#00f0ff',
          fragmented: '#ff0055',
          system: '#b026ff',
          optimizing: '#ffaa00',
          wearlevel: '#00ff66',
          locked: '#64748b'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'glow-magenta': '0 0 20px rgba(255, 0, 85, 0.35)',
        'glow-lime': '0 0 20px rgba(0, 255, 102, 0.35)',
        'glow-amber': '0 0 20px rgba(255, 170, 0, 0.35)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser-sweep': 'laserSweep 2s ease-in-out infinite alternate',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        laserSweep: {
          '0%': { transform: 'translateX(-100%)', opacity: '0.2' },
          '50%': { opacity: '0.9' },
          '100%': { transform: 'translateX(100%)', opacity: '0.2' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
