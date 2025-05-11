// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Further darkened matrix green (from #00AA2B to approximately #005517)
        'matrix-green': '#005517',
        'matrix-dark': '#0f0f0f',
      },
    },
  },
  plugins: [],
};
