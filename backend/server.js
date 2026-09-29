// Point d'entrée du backend IMMOYA en local (npm start) : démarre l'application définie
// dans app.js. Sur Vercel, c'est api/index.js qui l'utilise, sans serveur permanent.

const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`IMMOYA backend démarré sur http://localhost:${PORT}`);
});
