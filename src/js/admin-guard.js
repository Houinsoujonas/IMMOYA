// Garde d'accès pour toutes les pages /admin (sauf login.html) : vérifie qu'une session
// admin valide existe côté backend, sinon redirige vers la page de connexion.
// Chargé en tout premier sur chaque page admin protégée.

(async function enforceAdminSession() {
  try {
    const response = await fetch("/api/admin/session");
    const { authenticated } = await response.json();

    if (!authenticated) {
      window.location.href = "login.html";
    }
  } catch (error) {
    // Backend injoignable : on redirige aussi vers le login plutôt que de laisser une page cassée
    window.location.href = "login.html";
  }
})();

// Lit la valeur d'un cookie (utilisé pour récupérer le jeton CSRF, lisible côté JS lui)
function readCookieValue(name) {
  const match = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// Enveloppe "fetch" à utiliser pour toute requête admin qui modifie des données
// (POST/PUT/DELETE) : ajoute automatiquement le jeton CSRF attendu par le backend
// (double-submit cookie, voir backend/middleware/requireAdmin.js).
function adminFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = method !== "GET" && method !== "HEAD";

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(needsCsrf ? { "X-CSRF-Token": readCookieValue("immoya_csrf") || "" } : {}),
    },
  });
}
