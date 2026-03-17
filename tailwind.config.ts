import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: '#faf7f3',
          100: '#f5f0e8',
          200: '#ece5d8',
          300: '#ddd4bf',
          400: '#d4c3a6',
          500: '#c9b892',
          600: '#b8956a',
          700: '#a68356',
          800: '#947142',
          900: '#82602e',
        },
        secondary: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#b0b0b0',
          500: '#8c8c8c',
          600: '#5a5a5a',
          700: '#4a4a4a',
          800: '#3a3a3a',
          900: '#2a2a2a',
        },
        accent: {
          50: '#f0faf7',
          100: '#dff5f0',
          200: '#b8e6dd',
          300: '#8dd6cb',
          400: '#62c7b9',
          500: '#4a9b7f',
          600: '#3a8a6d',
          700: '#2a795b',
          800: '#1f6349',
          900: '#164c37',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [typography],
  corePlugins: {
    preflight: true,
  },
}
export default config
