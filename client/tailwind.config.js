/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware surfaces (flip in .dark via CSS variables in index.css)
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',

        // Brand — indigo ink
        primary: {
          50: '#EEEFFB',
          100: '#DADCF6',
          200: '#BBBEEE',
          300: '#9295E0',
          400: '#6E6FD2',
          500: '#5350BE',
          600: '#423CA0',
          700: '#312E81',
          800: '#282569',
          900: '#201E52',
          950: '#141232',
        },
        // Brand — deep teal
        secondary: {
          50: '#EFFCF9',
          100: '#C9F5EC',
          200: '#97E9DB',
          300: '#5BD6C4',
          400: '#2BBBA7',
          500: '#149F8E',
          600: '#0F8174',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Accent — warm copper
        accent: {
          50: '#FBF3EE',
          100: '#F6E1D3',
          200: '#ECC1A6',
          300: '#E09E74',
          400: '#D47E4C',
          500: '#C2683A',
          600: '#A5522C',
          700: '#843F23',
          800: '#633020',
          900: '#4A261B',
          950: '#2A140E',
        },
        // Warm neutral ramp (overrides default gray so existing gray-* usages warm up)
        gray: {
          50: '#FAFAF7',
          100: '#F3F2EC',
          200: '#E7E5DC',
          300: '#D6D3C7',
          400: '#B4AFA1',
          500: '#8C887A',
          600: '#6B6758',
          700: '#514E42',
          800: '#393730',
          900: '#232119',
          950: '#15140F',
        },
        success: {
          50: '#ECFDF3',
          100: '#D1FADF',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
        warning: {
          50: '#FFFAEB',
          100: '#FEF0C7',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        error: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'ui-serif', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 27, 34, 0.05), 0 1px 3px rgba(28, 27, 34, 0.06)',
        card: '0 1px 3px rgba(28, 27, 34, 0.06), 0 10px 28px -14px rgba(28, 27, 34, 0.18)',
        lift: '0 18px 40px -16px rgba(28, 27, 34, 0.22)',
        ring: '0 0 0 1px rgba(28, 27, 34, 0.06)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 0.25s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
