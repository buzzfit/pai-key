// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Darkened matrix green (from #00FF41 to a deeper #00AA2B)
        'matrix-green': '#00AA2B',
        'matrix-dark': '#0f0f0f',
      },
    },
  },
  plugins: [],
};
