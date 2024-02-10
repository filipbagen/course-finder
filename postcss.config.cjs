// postcss.config.cjs
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss,
    // Add other PostCSS plugins here as needed, e.g., autoprefixer
    require('autoprefixer'),
  ],
};
