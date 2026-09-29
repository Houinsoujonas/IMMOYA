// Application Express IMMOYA (sans démarrage de serveur) : réutilisée à la fois par
// backend/server.js en local et par la fonction serverless api/index.js sur Vercel.

const path = require("path");
const express = require("express");
const cors = require("cors");

// Chemin explicite vers .env (indépendant du dossier depuis lequel "node" est lancé).
// Sur Vercel, le fichier n'existe pas : les variables viennent des réglages du projet.
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const propertiesRoutes = require("./routes/properties.routes");
const contactRoutes = require("./routes/contact.routes");
const adminRoutes = require("./routes/admin.routes");
const unteraService = require("./services/untera.service");

const app = express();
const ROOT_DIR = path.join(__dirname, ".."); // racine du projet, un niveau au-dessus de backend/

// Autorise les requêtes cross-origin (utile en développement si le frontend est servi autrement)
app.use(cors());
// Parse automatiquement les corps de requête JSON (formulaires envoyés en fetch())
app.use(express.json());

// Sert uniquement les dossiers publics du frontend. Jamais la racine entière : elle contient
// backend/ (dont data/requests.json, avec les coordonnées des visiteurs) et la configuration.
["pages", "src", "public"].forEach((dir) => {
  app.use(`/${dir}`, express.static(path.join(ROOT_DIR, dir)));
});

// Redirige la racine vers la page d'accueil
app.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

// Point de contrôle simple pour vérifier que le serveur (et Untera) répondent
app.get("/api/health", async (req, res) => {
  const untera = await unteraService.checkConnection();
  res.json({ status: "ok", untera });
});

// Montage des routes de l'API, toutes préfixées par /api
app.use("/api", propertiesRoutes);
app.use("/api", contactRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
