/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS v4 configuration
  // Content scanning is now handled by the CSS import
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Theme configuration is now primarily handled in CSS with @theme
  // Keeping minimal config for compatibility
  theme: {
    extend: {},
  },
  // Plugins are still supported in v4
  plugins: [],
  // Enable v4 features
  future: {
    hoverOnlyWhenSupported: true,
  },
}