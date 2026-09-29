// Contrôleur : toutes les actions réservées à l'espace /admin.

const authService = require("../services/auth.service");
const propertiesService = require("../services/properties.service");
const requestsService = require("../services/requests.service");
const unteraService = require("../services/untera.service");
const { readCookie } = require("../middleware/requireAdmin");

// POST /api/admin/login — vérifie le mot de passe et ouvre une session
function login(req, res) {
  const { password } = req.body;

  if (!authService.checkPassword(password)) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }

  const { token, csrfToken } = authService.createSession();
  // Cookie de session HttpOnly : inaccessible en JavaScript (protection XSS basique).
  res.cookie("immoya_session", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
  });
  // Cookie CSRF volontairement PAS HttpOnly : le JS admin doit pouvoir le lire pour le
  // renvoyer en en-tête à chaque requête qui modifie des données (double-submit cookie).
  res.cookie("immoya_csrf", csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.json({ success: true });
}

// POST /api/admin/logout — ferme la session en cours
function logout(req, res) {
  const token = readCookie(req, "immoya_session");
  authService.destroySession(token);
  res.clearCookie("immoya_session");
  res.clearCookie("immoya_csrf");
  res.json({ success: true });
}

// GET /api/admin/session — utilisé par les pages admin pour savoir si on est bien connecté
function checkSession(req, res) {
  const token = readCookie(req, "immoya_session");
  res.json({ authenticated: authService.isSessionValid(token) });
}

// GET /api/admin/dashboard — chiffres clés affichés sur le dashboard admin
async function dashboard(req, res) {
  const propertyStats = propertiesService.getStats();
  const requestStats = requestsService.getStats();
  const unteraStatus = await unteraService.checkConnection();

  res.json({
    properties: propertyStats,
    requests: requestStats,
    recentProperties: propertiesService.getAll({ sort: "recent" }).slice(0, 5),
    // Répartition réelle par type et dernières demandes reçues : pas de données inventées
    typeBreakdown: propertiesService.getTypeBreakdown(),
    recentRequests: requestsService.getAll().slice(0, 5),
    untera: unteraStatus,
  });
}

// GET /api/admin/properties — liste complète (y compris biens vendus/loués) avec filtres admin
function listProperties(req, res) {
  res.json(propertiesService.getAll(req.query));
}

// POST /api/admin/properties — création d'un bien
function createProperty(req, res) {
  const created = propertiesService.create(req.body);
  res.status(201).json(created);
}

// PUT /api/admin/properties/:id — modification d'un bien existant
function updateProperty(req, res) {
  const updated = propertiesService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Bien introuvable" });
  res.json(updated);
}

// DELETE /api/admin/properties/:id — suppression d'un bien (confirmation gérée côté frontend)
function deleteProperty(req, res) {
  const removed = propertiesService.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: "Bien introuvable" });
  res.json({ success: true });
}

// GET /api/admin/requests — liste des demandes (contact + visite), filtrable par statut/type
function listRequests(req, res) {
  res.json(requestsService.getAll(req.query));
}

// PUT /api/admin/requests/:id — mise à jour du statut d'une demande
function updateRequest(req, res) {
  const updated = requestsService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Demande introuvable" });
  res.json(updated);
}

// GET /api/admin/settings — état de la configuration, jamais les valeurs secrètes elles-mêmes
async function settings(req, res) {
  const untera = await unteraService.checkConnection();
  res.json({
    untera,
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD_HASH),
  });
}

module.exports = {
  login,
  logout,
  checkSession,
  dashboard,
  settings,
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  listRequests,
  updateRequest,
};
