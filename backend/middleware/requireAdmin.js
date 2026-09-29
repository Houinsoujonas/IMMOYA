// Middleware Express qui protège les routes /api/admin/* réservées à l'administrateur.
// Vérifie la session, et pour toute requête qui modifie des données (POST/PUT/DELETE),
// vérifie aussi le jeton CSRF envoyé en en-tête (double-submit cookie, §12 du cahier).

const authService = require("../services/auth.service");

// Extrait la valeur d'un cookie donné à partir de l'en-tête HTTP brut "Cookie"
function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function requireAdmin(req, res, next) {
  const token = readCookie(req, "immoya_session");

  if (!authService.isSessionValid(token)) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // Les méthodes de lecture n'ont pas besoin de jeton CSRF ; seules les mutations en ont besoin
  if (!SAFE_METHODS.has(req.method)) {
    const csrfHeader = req.headers["x-csrf-token"];
    if (!authService.isCsrfValid(token, csrfHeader)) {
      return res.status(403).json({ error: "Jeton de sécurité invalide, rechargez la page" });
    }
  }

  next();
}

module.exports = { requireAdmin, readCookie };
