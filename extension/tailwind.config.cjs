/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/popup/**/*.{html,svelte,ts,js}',
    './src/**/*.{svelte,ts,js}',
    './src/popup/popup.html',
  ],
  theme: { extend: {} },
  plugins: [],
};