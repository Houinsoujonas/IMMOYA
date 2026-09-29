// Point d'entrée du backend IMMOYA.
// Sert à la fois le frontend statique (pages/, src/, public/) et l'API REST (/api/*).

const path = require("path");
const express = require("express");
const cors = require("cors");

// Chemin explicite vers .env (indépendant du dossier depuis lequel "node" est lancé)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const propertiesRoutes = require("./routes/properties.routes");
const contactRoutes = require("./routes/contact.routes");
const adminRoutes = require("./routes/admin.routes");
const unteraService = require("./services/untera.service");

const app = express();
const PORT = process.env.PORT || 4000;
const ROOT_DIR = path.join(__dirname, ".."); // racine du projet, un niveau au-dessus de backend/

// Autorise les requêtes cross-origin (utile en développement si le frontend est servi autrement)
app.use(cors());
// Parse automatiquement les corps de requête JSON (formulaires envoyés en fetch())
app.use(express.json());

// Sert tous les fichiers statiques du projet (HTML, CSS compilé, JS, images)
app.use(express.static(ROOT_DIR));

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

app.listen(PORT, () => {
  console.log(`IMMOYA backend démarré sur http://localhost:${PORT}`);
});
