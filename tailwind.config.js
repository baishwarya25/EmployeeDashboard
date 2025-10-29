// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 Tells Tailwind to scan all your React files
  ],
  theme: {
    extend: {
      colors: {
        // Deep Purple used for titles and buttons
        'deep-purple': '#5b21b6', 
        // Light purples for the body gradient (used in body background)
        'body-light': '#f9fafc',
        'body-lighter': '#e0e7ff',
      },
    },
  },
  plugins: [],
}

