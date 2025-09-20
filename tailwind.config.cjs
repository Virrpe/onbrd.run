/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./extension/src/**/*.{html,svelte,ts,js}",
    "./extension/src/popup/**/*.{html,svelte,ts,js}",
    "./site/**/*.{html,js,md}",
    './packages/report/**/*.{ts,js,svelte,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Variable","Geist","system-ui","ui-sans-serif","sans-serif"],
        brand: ["Satoshi Variable","Satoshi","Geist Variable","Geist","ui-sans-serif","sans-serif"]
      },
      colors: {
        brand: { 50:"#F0FDFA",100:"#CCFBF1",200:"#99F6E4",300:"#5EEAD4",400:"#2DD4BF",500:"#14B8A6",600:"#0D9488",700:"#0F766E",800:"#115E59",900:"#134E4A" },
        ink:   { 50:"#F9FAFB",100:"#E5E7EB",200:"#D1D5DB",300:"#9CA3AF",400:"#6B7280",500:"#4B5563",600:"#374151",700:"#1F2937",800:"#111827",900:"#0B0F14" }
      },
      borderRadius: { xl:"0.75rem","2xl":"1rem" },
      boxShadow: { soft:"0 8px 30px rgba(2,6,23,.06)" }
    }
  },
  plugins: [],
};