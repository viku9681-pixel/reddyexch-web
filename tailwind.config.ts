import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white:   '#FFFFFF',
        black:   '#1A1A1A',
        red:     '#FF3B30',
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
      },
      fontFamily: {
        sans:       ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      spacing: {
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '6':  '24px',
        '8':  '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'fast': '200ms',
        'base': '300ms',
      },
      animation: {
        'wa-pulse':      'wa-pulse 2s ease-out infinite',
        'cricket-float': 'cricket-float 4s ease-in-out infinite',
      },
      keyframes: {
        'wa-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 59, 48, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(255, 59, 48, 0)' },
        },
        'cricket-float': {
          '0%, 100%': { transform: 'translateY(0) translateZ(0)' },
          '50%':      { transform: 'translateY(-12px) translateZ(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
