// Gestion des favoris côté visiteur, sans compte utilisateur : uniquement via localStorage.
// Chargé en script classique, fonctions disponibles globalement.

// Clé versionnée (§7.5 du cahier) : un "v1" explicite permet de changer le format plus
// tard sans entrer en conflit avec d'anciennes données déjà stockées chez le visiteur.
const FAVORITES_KEY = "immoya:favorites:v1";

// Lit la liste des ids favoris depuis localStorage (tableau vide si absent ou invalide)
function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // localStorage indisponible (navigation privée, quota, ...) : on dégrade sans casser la page
    return [];
  }
}

// Écrit la liste des ids favoris dans localStorage
function saveFavoriteIds(ids) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (error) {
    // Échec silencieux : les favoris ne persisteront simplement pas cette fois
  }
  // Rafraîchit le compteur de la navbar s'il est présent sur la page
  if (typeof updateFavoritesIndicator === "function") updateFavoritesIndicator();
}

// Indique si un bien est déjà en favori
function isFavorite(propertyId) {
  return getFavoriteIds().includes(propertyId);
}

// Ajoute ou retire un bien des favoris (bascule), retourne le nouvel état (true = favori)
function toggleFavorite(propertyId) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(propertyId);

  if (index === -1) {
    ids.push(propertyId);
  } else {
    ids.splice(index, 1);
  }

  saveFavoriteIds(ids);
  return index === -1; // true si on vient d'ajouter, false si on vient de retirer
}

// Vide complètement la liste des favoris (bouton "Vider mes favoris")
function clearFavorites() {
  saveFavoriteIds([]);
}
