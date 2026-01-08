import { createPreset } from 'fumadocs-ui/tailwind-plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  presets: [createPreset()],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        dflow: {
          // Primary brand colors
          cyan: 'hsl(174, 100%, 42%)',
          'cyan-light': 'hsl(174, 100%, 50%)',
          teal: 'hsl(168, 84%, 40%)',
          gold: 'hsl(45, 93%, 58%)',

          // Background layers
          deep: 'hsl(222, 47%, 6%)',
          surface: 'hsl(220, 40%, 9%)',
          elevated: 'hsl(218, 35%, 12%)',
          hover: 'hsl(216, 30%, 15%)',

          // Text hierarchy
          'text-primary': 'hsl(210, 40%, 96%)',
          'text-secondary': 'hsl(215, 20%, 65%)',
          'text-muted': 'hsl(215, 15%, 45%)',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'data-flow': 'data-flow 8s ease infinite',
        float: 'float 20s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px hsla(174, 100%, 42%, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 30px hsla(174, 100%, 42%, 0.4)',
          },
        },
        'data-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(-30px, -20px) scale(1.05)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 40px hsla(174, 100%, 42%, 0.3)',
        'glow-gold': '0 0 30px hsla(45, 93%, 58%, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        grid: `
          linear-gradient(hsla(215, 20%, 30%, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, hsla(215, 20%, 30%, 0.1) 1px, transparent 1px)
        `,
      },
    },
  },
  plugins: [],
};
