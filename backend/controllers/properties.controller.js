// Contrôleur : traduit les requêtes HTTP publiques en appels aux services properties et untera.

const propertiesService = require("../services/properties.service");
const unteraService = require("../services/untera.service");

// GET /api/properties — liste filtrée/triée des biens IMMOYA locaux (catalogue éditorial admin)
function list(req, res) {
  const properties = propertiesService.getAll(req.query);
  res.json(properties);
}

// GET /api/properties/:id — détail d'un bien + biens similaires.
// Un id préfixé "untera:" désigne un bien externe (lecture seule) ; sinon c'est un bien IMMOYA local.
async function getOne(req, res) {
  const { id } = req.params;

  if (id.startsWith("untera:")) {
    const externalId = id.slice("untera:".length);
    const property = await unteraService.getListingById(externalId);
    if (!property) {
      return res.status(404).json({ error: "Bien introuvable" });
    }
    return res.json({ property, similar: [] });
  }

  const property = propertiesService.getById(id);
  if (!property) {
    return res.status(404).json({ error: "Bien introuvable" });
  }

  const similar = propertiesService.getSimilar(property, 3);
  res.json({ property, similar });
}

// GET /api/search — alias sémantique de /api/properties pour la page de recherche avancée
function search(req, res) {
  const properties = propertiesService.getAll(req.query);
  res.json(properties);
}

// GET /api/cities — villes disponibles parmi les biens IMMOYA locaux
function cities(req, res) {
  res.json(propertiesService.getCities());
}

// GET /api/types — types de biens disponibles parmi les biens IMMOYA locaux
function types(req, res) {
  res.json(propertiesService.getTypes());
}

// GET /api/stats — chiffres publics du catalogue éditorial IMMOYA (admin), pas Untera
function stats(req, res) {
  const propertyStats = propertiesService.getStats();
  res.json({
    properties: propertyStats.total,
    cities: propertiesService.getCities().length,
    sold: propertyStats.vendus + propertyStats.loues,
  });
}

// GET /api/properties/external — annonces Untera réelles pour un pays donné (§9 du cahier :
// biens externes en lecture seule, jamais mélangés silencieusement aux biens IMMOYA locaux).
async function externalList(req, res) {
  const { country, maxPrice, currency, pageSize } = req.query;
  const result = await unteraService.searchListings({
    country,
    maxPrice,
    currency: currency === "EUR" ? "EUR" : "USD",
    pageSize,
  });

  if (!result) {
    return res.status(503).json({
      error: { code: "UPSTREAM_UNAVAILABLE", message: "Le catalogue international est temporairement indisponible." },
    });
  }

  res.json(result);
}

// GET /api/properties/external/markets — principaux pays couverts par Untera, pour un sélecteur honnête
async function externalMarkets(req, res) {
  const markets = await unteraService.getTopMarkets(12);
  res.json(markets);
}

// GET /api/properties/external/featured — sélection réelle multi-pays pour la page d'accueil
async function externalFeatured(req, res) {
  const items = await unteraService.getFeaturedListings(3);
  res.json({ items });
}

// GET /api/properties/external/stats — chiffres réels agrégés sur les marchés ciblés (accueil)
async function externalStats(req, res) {
  const stats = await unteraService.getTargetMarketStats();
  res.json(stats);
}

module.exports = {
  list,
  getOne,
  search,
  cities,
  types,
  stats,
  externalList,
  externalMarkets,
  externalFeatured,
  externalStats,
};
