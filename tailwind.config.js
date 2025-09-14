module.exports = {
  content: [
    "./extension/src/**/*.{svelte,ts,js}",
    "./packages/*/src/**/*.{ts,js,svelte}",
    "./extension/dist/**/*.{html,js,css}"
  ],
  theme: { extend: {} },
  plugins: []
}