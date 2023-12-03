
module.exports = {
  content: ["./app/*.{js,jsx,ts,tsx}", "./components/**/**/*.{js,jsx,ts,tsx}", "./app/**/**/**/*.{js,jsx,ts,tsx}", "./assets/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
    screens: {
      'ph': '0px',

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '920px',
      // => @media (min-width: 920px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    }
  },
  darkMode: 'class',
}