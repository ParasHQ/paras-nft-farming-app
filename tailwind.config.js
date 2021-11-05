module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      parasGrey: "#171D2D",
      blueButton: "#247DFE",
      redButton: "#EB5757",
      greenButton: "#21A79F",
      borderGray: "#272E3E"
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
