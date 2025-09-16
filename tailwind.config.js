/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'impact': ['Impact', 'Arial Black', 'sans-serif'],
        'bebas': ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif'],
        'oswald': ['Oswald', 'Impact', 'Arial Black', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        'dark-blue': {
          400: '#1e3a8a',
          500: '#1e40af',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'luxury-pulse': 'luxuryPulse 3s ease-in-out infinite',
      },
      keyframes: {
        luxuryPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}


