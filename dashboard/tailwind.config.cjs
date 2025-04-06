/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3effb',
          100: '#e7dbf7',
          200: '#d2bcef',
          300: '#b792e5',
          400: '#9f69db',
          500: '#8645d1',
          600: '#7437a8',
          700: '#582985',
          800: '#3c1f5a',
          900: '#2a1a3a',
          950: '#180e22',
        },
        secondary: {
          50: '#ebedfd',
          100: '#d8dcfb',
          200: '#b2b9f7',
          300: '#8b97f3',
          400: '#6570ee',
          500: '#504cea',
          600: '#3830bb',
          700: '#28248d',
          800: '#1b195f',
          900: '#110e30',
          950: '#08061a',
        },
        dark: {
          100: '#3f3846',
          200: '#343039',
          300: '#29262c',
          400: '#1e1c20',
          500: '#131114',
          600: '#0e0d10',
          700: '#0a090b',
          800: '#050506',
          900: '#000000',
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.7s ease-out",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      },
    },
  },
  plugins: [],
}
