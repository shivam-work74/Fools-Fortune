/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 this tells Tailwind to scan all your React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
