/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-deep': '#0d0221',
        'space-mid': '#1a0533',
        'space-light': '#2d1b69',
        'neon-cyan': '#00F5FF',
        'neon-pink': '#FF006E',
        'neon-yellow': '#FFD60A',
        'neon-purple': '#7B2FBE',
        'neon-magenta': '#FF00FF',
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        tech: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glitch': 'glitch 3s infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'color-shift': 'colorShift 4s linear infinite',
        'typewriter': 'typewriter 4s steps(40) 1s forwards',
        'orbit': 'orbit 12s linear infinite',
        'pixel-in': 'pixelIn 0.6s ease-out forwards',
        'retro-grid': 'retroGrid 20s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'glow-spin': 'glowSpin 3s linear infinite',
        'drift': 'drift 15s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 1px)', opacity: '0.8' },
          '94%': { transform: 'translate(2px, -1px)', opacity: '0.6' },
          '96%': { transform: 'translate(-1px, 2px)', opacity: '0.8' },
          '98%': { transform: 'translate(1px, -2px)', opacity: '0.9' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 5px var(--glow-color), 0 0 10px var(--glow-color), 0 0 20px var(--glow-color)' },
          '50%': { boxShadow: '0 0 10px var(--glow-color), 0 0 30px var(--glow-color), 0 0 60px var(--glow-color)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        colorShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
        },
        pixelIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0', filter: 'blur(10px)' },
          '50%': { transform: 'scale(1.05)', filter: 'blur(0)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        retroGrid: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -15px) rotate(5deg)' },
          '50%': { transform: 'translate(-5px, -25px) rotate(-3deg)' },
          '75%': { transform: 'translate(15px, -10px) rotate(4deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
