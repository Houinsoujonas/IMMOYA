// Prépare le dossier dist/ publié par Vercel : uniquement les fichiers du frontend
// (pages, JS, CSS compilé, images), jamais backend/ ni la configuration du projet.
// Les chemins relatifs des pages (../src/...) restent valides car l'arborescence est conservée.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const COPIES = ["pages", "src/js", "src/components", "src/css/styles.css", "public"];

fs.rmSync(DIST, { recursive: true, force: true });

COPIES.forEach((relative) => {
  const from = path.join(ROOT, relative);
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, path.join(DIST, relative), { recursive: true });
});

console.log("dist/ prêt :", COPIES.join(", "));
