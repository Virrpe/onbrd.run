/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './extension/src/**/*.{html,svelte,ts,js}',
    './packages/report/**/*.{ts,js,svelte,html}',
  ],
  theme: { extend: {} },
  plugins: [],
};