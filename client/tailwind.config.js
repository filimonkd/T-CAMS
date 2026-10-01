/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Primary: bright professional blue, per the ERP reference. 500 is the
        // active/fill step (solid blue sidebar item, primary button); 600 is
        // the text-on-white step, which clears 4.5:1 where 500 does not.
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        card: '0.75rem', // 12px - cards
        control: '0.5rem', // 8px - buttons, inputs, nav items
      },
      boxShadow: {
        // Deliberately soft. The reference leans on 1px borders for
        // definition and uses shadow only to lift a surface a little.
        subtle: '0 1px 2px 0 rgb(16 24 40 / 0.04)',
        card: '0 1px 2px 0 rgb(16 24 40 / 0.05), 0 1px 3px 0 rgb(16 24 40 / 0.04)',
        overlay: '0 12px 16px -4px rgb(16 24 40 / 0.08), 0 4px 6px -2px rgb(16 24 40 / 0.03)',
        focus: '0 0 0 3px rgb(59 130 246 / 0.35)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },
  plugins: [],
};
