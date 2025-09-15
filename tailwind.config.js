module.exports = {
  content: [
    "./extension/src/**/*.{svelte,ts,js}",
    "./packages/*/src/**/*.{ts,js,svelte}",
    "./extension/dist/**/*.{html,js,css}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}