/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        livrili: {
          greenDark: "#14532d",
          greenMid: "#166534",
          greenLight: "#bbf7d0",
          greenPale: "#dcfce7",
          orangeDark: "#9a3412",
          orangeMid: "#c2410c",
          orangeLight: "#fed7aa",
          orangePale: "#fff7ed",
        },
      },
    },
  },
  plugins: [],
};

