/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c5282',
        },
        accent: {
          DEFAULT: '#c53030',
          light: '#fc8181',
        },
        success: '#276749',
        warning: '#c05621',
      },
    },
  },
}