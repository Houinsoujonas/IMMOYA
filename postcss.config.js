// Configuration PostCSS : indique les plugins qui transforment notre CSS
// avant qu'il ne soit écrit dans src/css/styles.css.
module.exports = {
  plugins: {
    tailwindcss: {}, // applique les classes utilitaires Tailwind
    autoprefixer: {}, // ajoute automatiquement les préfixes navigateurs (-webkit-, -moz-, ...)
  },
};
