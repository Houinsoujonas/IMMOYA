// Service de gestion des biens immobiliers.
// Source de données : fichier JSON local (backend/data/properties.json), qui joue
// à la fois le rôle de "cache Untera" et de store géré par l'admin (voir untera.service.js
// pour le détail de ce choix : la doc Untera réelle n'étant pas connue, ce fichier est
// la source de vérité actuelle de l'application).

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "properties.json");

// Lit le fichier JSON et le parse en tableau JS
function readAll() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Réécrit le fichier JSON avec le tableau fourni (formaté lisiblement)
function writeAll(properties) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2), "utf-8");
}

// Génère un identifiant unique simple pour un nouveau bien
function generateId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Retourne la liste des biens, avec filtres optionnels appliqués (tous cumulables).
// "filters" vient typiquement des paramètres de query string (?type=Villa&ville=Cotonou...)
function getAll(filters = {}) {
  let properties = readAll();

  if (filters.transaction) {
    properties = properties.filter((p) => p.transaction === filters.transaction);
  }
  if (filters.type) {
    properties = properties.filter((p) => p.type === filters.type);
  }
  if (filters.city) {
    // Comparaison insensible à la casse pour tolérer "cotonou" vs "Cotonou"
    properties = properties.filter((p) => p.city.toLowerCase() === filters.city.toLowerCase());
  }
  if (filters.status) {
    properties = properties.filter((p) => p.status === filters.status);
  }
  if (filters.minPrice) {
    properties = properties.filter((p) => p.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    properties = properties.filter((p) => p.price <= Number(filters.maxPrice));
  }
  if (filters.minSurface) {
    properties = properties.filter((p) => (p.surface || 0) >= Number(filters.minSurface));
  }
  if (filters.bedrooms) {
    properties = properties.filter((p) => (p.bedrooms || 0) >= Number(filters.bedrooms));
  }
  if (filters.bathrooms) {
    properties = properties.filter((p) => (p.bathrooms || 0) >= Number(filters.bathrooms));
  }
  if (filters.q) {
    // Recherche texte libre sur le titre, la ville et la description
    const query = filters.q.toLowerCase();
    properties = properties.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query)
    );
  }

  // Tri (par défaut : plus récents en premier)
  const sort = filters.sort || "recent";
  if (sort === "recent") {
    properties = properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === "price-asc") {
    properties = properties.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    properties = properties.sort((a, b) => b.price - a.price);
  } else if (sort === "surface-desc") {
    properties = properties.sort((a, b) => (b.surface || 0) - (a.surface || 0));
  }

  return properties;
}

// Retourne un bien par son identifiant, ou "undefined" s'il n'existe pas
function getById(id) {
  return readAll().find((p) => p.id === id);
}

// Retourne jusqu'à "limit" biens similaires au bien donné (même type ou même ville)
function getSimilar(property, limit = 3) {
  return readAll()
    .filter(
      (p) => p.id !== property.id && (p.type === property.type || p.city === property.city)
    )
    .slice(0, limit);
}

// Ajoute un nouveau bien (utilisé par l'admin) et le retourne avec son id généré
function create(propertyData) {
  const properties = readAll();
  const newProperty = {
    id: generateId(),
    status: "disponible",
    featured: false,
    images: [],
    amenities: [],
    createdAt: new Date().toISOString(),
    ...propertyData,
  };
  properties.push(newProperty);
  writeAll(properties);
  return newProperty;
}

// Met à jour un bien existant (fusion des champs fournis avec l'existant)
function update(id, changes) {
  const properties = readAll();
  const index = properties.findIndex((p) => p.id === id);
  if (index === -1) return null;

  properties[index] = { ...properties[index], ...changes, id };
  writeAll(properties);
  return properties[index];
}

// Supprime un bien par id, retourne "true" si un bien a bien été supprimé
function remove(id) {
  const properties = readAll();
  const filtered = properties.filter((p) => p.id !== id);
  const removed = filtered.length !== properties.length;
  if (removed) writeAll(filtered);
  return removed;
}

// Liste des villes distinctes présentes dans le catalogue (pour les filtres/autocomplete)
function getCities() {
  const properties = readAll();
  return [...new Set(properties.map((p) => p.city))].sort();
}

// Liste des types de biens distincts présents dans le catalogue
function getTypes() {
  const properties = readAll();
  return [...new Set(properties.map((p) => p.type))].sort();
}

// Statistiques utilisées par le dashboard admin
function getStats() {
  const properties = readAll();
  return {
    total: properties.length,
    disponibles: properties.filter((p) => p.status === "disponible").length,
    vendus: properties.filter((p) => p.status === "vendu").length,
    loues: properties.filter((p) => p.status === "loué").length,
  };
}

// Répartition réelle du catalogue par type de bien, triée du plus nombreux au moins nombreux.
// Utilisée pour le mini-graphique du dashboard admin (données réelles, pas d'historique inventé).
function getTypeBreakdown() {
  const properties = readAll();
  const counts = {};
  properties.forEach((p) => {
    counts[p.type] = (counts[p.type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = {
  getAll,
  getById,
  getSimilar,
  create,
  update,
  remove,
  getCities,
  getTypeBreakdown,
  getTypes,
  getStats,
};
