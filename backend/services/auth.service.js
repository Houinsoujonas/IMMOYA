// Service d'authentification minimal pour l'espace admin.
// Pas de base de données ni de gestion multi-utilisateurs : un seul mot de passe
// admin défini dans .env, stocké haché (bcrypt) et jamais en clair (§10.1 du cahier).
// Une fois connecté, un jeton de session aléatoire est généré et gardé en mémoire
// (il expire quand le serveur redémarre — suffisant pour ce projet de portfolio).

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// "sessions" associe un jeton de session à { expiresAt, csrfToken } ; vidé si le serveur redémarre
const sessions = new Map();
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 heures

// Vérifie le mot de passe fourni par rapport au hash bcrypt défini dans .env
function checkPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  // Si aucun hash n'est configuré, on refuse toute connexion par sécurité
  if (!hash || !password) return false;
  return bcrypt.compareSync(password, hash);
}

// Crée une nouvelle session et retourne son jeton de session ET son jeton CSRF (double-submit
// cookie : le jeton CSRF est renvoyé dans un cookie lisible par le JS et doit être renvoyé
// dans un en-tête à chaque requête qui modifie des données, §12 du cahier).
function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  const csrfToken = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { expiresAt: Date.now() + SESSION_DURATION_MS, csrfToken });
  return { token, csrfToken };
}

// Vérifie qu'un jeton correspond à une session encore valide
function isSessionValid(token) {
  if (!token || !sessions.has(token)) return false;
  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

// Vérifie que le jeton CSRF fourni correspond bien à celui de la session (protection contre
// les requêtes forgées depuis un autre site, qui n'auraient pas accès au cookie non-HttpOnly)
function isCsrfValid(sessionToken, csrfToken) {
  const session = sessions.get(sessionToken);
  return Boolean(session && csrfToken && session.csrfToken === csrfToken);
}

// Invalide une session (déconnexion)
function destroySession(token) {
  sessions.delete(token);
}

module.exports = { checkPassword, createSession, isSessionValid, isCsrfValid, destroySession };
