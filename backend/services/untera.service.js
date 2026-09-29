// Service qui contacte réellement l'API externe Untera (agrégateur international
// d'annonces immobilières — voir https://untera.io). La clé API ne quitte jamais ce
// fichier backend : le frontend ne la voit jamais.
//
// Endpoints confirmés par test direct :
//   GET  {base}/listings/search?country=XX&maxPrice=N&pageSize=N   (en-tête X-API-Key)
//   GET  {base}/listings/:id
//   GET  {base}/market/scores  (score d'investissement par pays, sert aussi de table pays→nom)
//
// Untera couvre le monde entier mais très peu l'Afrique de l'Ouest (0 résultat testé
// pour le Bénin) : ses annonces sont donc présentées comme un catalogue international
// à part ("Opportunités internationales"), distinct du catalogue local IMMOYA en FCFA.

const UNTERA_BASE_URL = process.env.UNTERA_BASE_URL || "";
const UNTERA_API_KEY = process.env.UNTERA_API_KEY || "";

// Marchés sur lesquels IMMOYA se concentre (vérifiés réels et actifs sur Untera par appel direct).
// Codes ISO 3166-1 alpha-2 : Portugal, France, Italie, États-Unis.
const TARGET_COUNTRIES = ["PT", "FR", "IT", "US"];

// Indique si une tentative de connexion à Untera est même possible (URL configurée)
function isConfigured() {
  return Boolean(UNTERA_BASE_URL && UNTERA_API_KEY);
}

// --- Petit cache mémoire court (§9.1 du cahier : "cache serveur court recommandé") ---
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // clé de requête -> { expiresAt, data }

function getCached(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Effectue un GET authentifié vers l'API Untera. Retourne "null" en cas d'échec
// (URL absente, réseau, réponse invalide) : c'est à l'appelant de gérer le repli.
async function unteraGet(path, attempt = 1) {
  if (!isConfigured()) return null;

  try {
    const response = await fetch(`${UNTERA_BASE_URL}${path}`, {
      headers: { "X-API-Key": UNTERA_API_KEY },
    });

    if (!response.ok) {
      console.warn(`[untera] réponse HTTP ${response.status} pour ${path}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Coupure réseau passagère ("fetch failed") : une seule nouvelle tentative après une courte pause
    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return unteraGet(path, 2);
    }
    console.warn(`[untera] appel API échoué pour ${path} :`, error.message);
    return null;
  }
}

// Noms de pays en français pour les codes ISO couramment rencontrés (traduction standard,
// pas une donnée d'annonce inventée) : Untera renvoie "countryName" en anglais uniquement.
const FRENCH_COUNTRY_NAMES = {
  PT: "Portugal",
  FR: "France",
  IT: "Italie",
  US: "États-Unis",
  ES: "Espagne",
  DE: "Allemagne",
  GB: "Royaume-Uni",
  BR: "Brésil",
  CO: "Colombie",
  CR: "Costa Rica",
  PA: "Panama",
  PY: "Paraguay",
  TR: "Turquie",
  GH: "Ghana",
  NG: "Nigeria",
};

// Table pays (code ISO -> nom lisible en français), construite à partir de /market/scores
// et mise en cache. Sert uniquement à un affichage honnête ("Portugal" plutôt que "PT") ;
// un code inconnu s'affiche avec le nom anglais fourni par Untera plutôt que d'inventer une traduction.
async function getCountryNames() {
  const cached = getCached("country-names");
  if (cached) return cached;

  const data = await unteraGet("/market/scores");
  const names = {};
  if (data && Array.isArray(data.results)) {
    data.results.forEach((entry) => {
      if (entry.country) names[entry.country] = FRENCH_COUNTRY_NAMES[entry.country] || entry.countryName || entry.country;
    });
    setCached("country-names", names); // un échec n'est jamais mis en cache : il sera retenté
  }
  return names;
}

// Transforme une image renvoyée par Untera (parfois relative, parfois déjà absolue)
// en URL absolue et affichable directement par le navigateur.
function resolveImageUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `https://api.untera.io${path}`;
}

// Traduit le "transaction" brut d'Untera vers les valeurs internes du site (vente/location)
function normalizeTransaction(raw) {
  return raw === "rent" ? "location" : "vente";
}

// Traduit le "property_subtype" (ou à défaut "type") d'Untera vers un libellé de type lisible.
// Un sous-type inconnu est affiché tel quel (capitalisé) plutôt que masqué ou inventé.
function normalizeType(raw) {
  const known = {
    house: "Maison",
    apartment: "Appartement",
    villa: "Villa",
    studio: "Studio",
    land: "Terrain",
    office: "Bureau",
    commercial: "Commerce",
    warehouse: "Entrepôt",
    residential: "Résidentiel",
  };
  if (!raw) return "Bien";
  return known[raw] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

// Convertit une annonce brute Untera vers le modèle normalisé commun du site (§9.4 du cahier) :
// mêmes champs que les biens IMMOYA locaux, avec "source: untera" pour les distinguer et les
// afficher en lecture seule (pas de modification/suppression possible depuis l'admin).
function normalizeListing(raw, countryNames) {
  return {
    id: `untera:${raw.id}`,
    source: "untera",
    sourceLabel: raw.source || "Untera",
    externalUrl: raw.url || null,
    title: raw.title || "Bien sans titre",
    description: raw.description || null,
    transaction: normalizeTransaction(raw.transaction),
    type: normalizeType(raw.property_subtype || raw.type),
    status: "disponible", // Untera ne fournit pas de statut : une annonce listée est considérée active
    price: raw.original_price ?? raw.price_usd ?? null,
    currency: raw.original_currency || (raw.price_usd != null ? "USD" : null),
    city: raw.address ? raw.address.split(",")[0].trim() : raw.country || "Localisation non renseignée",
    country: raw.country ? countryNames[raw.country] || raw.country : null,
    address: raw.address || null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    surface: raw.sqm ?? null,
    bedrooms: raw.bedrooms ?? null,
    bathrooms: raw.bathrooms ?? null,
    parking: null, // non fourni par Untera : jamais inventé, reste absent
    amenities: [],
    images: Array.isArray(raw.images) ? raw.images.map(resolveImageUrl).filter(Boolean) : [],
    featured: false,
    createdAt: null,
  };
}

// Taux EUR -> USD déduit des annonces Untera elles-mêmes (price_usd / original_price d'une
// annonce en EUR) : aucun taux inventé ni service de change tiers. Mis en cache 5 minutes.
async function getEurToUsdRate() {
  const cached = getCached("eur-usd-rate");
  if (cached) return cached;

  // Les premières annonces sans filtre n'ont parfois pas de prix d'origine : on échantillonne
  // donc des annonces filtrées par budget, qui portent bien leur prix en EUR et en USD.
  const data = await unteraGet("/listings/search?country=FR&maxPrice=1000000&pageSize=20");
  const ratios = (data?.results || [])
    .filter((l) => l.original_currency === "EUR" && l.original_price > 0 && l.price_usd > 0)
    .map((l) => l.price_usd / l.original_price)
    .sort((a, b) => a - b);
  if (ratios.length === 0) return null;

  const rate = ratios[Math.floor(ratios.length / 2)]; // médiane, robuste à une annonce aberrante
  setCached("eur-usd-rate", rate);
  return rate;
}

// Recherche des annonces Untera pour un pays donné (code ISO) et un budget max optionnel.
// Le filtre "maxPrice" d'Untera s'applique en USD (vérifié par test direct) : un budget saisi
// en EUR est donc converti avant l'appel. Retourne { items, attribution } ou "null" si indisponible.
async function searchListings({ country, maxPrice, currency = "USD", pageSize = 12 } = {}) {
  if (!isConfigured()) return null;

  let maxPriceUsd = maxPrice ? Number(maxPrice) : null;
  if (maxPriceUsd && currency === "EUR") {
    const rate = await getEurToUsdRate();
    if (rate) maxPriceUsd = Math.round(maxPriceUsd * rate);
  }

  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (maxPriceUsd) params.set("maxPrice", maxPriceUsd);
  if (pageSize) params.set("pageSize", pageSize);

  const cacheKey = `search:${params.toString()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const [data, countryNames] = await Promise.all([
    unteraGet(`/listings/search?${params.toString()}`),
    getCountryNames(),
  ]);
  if (!data) return null;

  const result = {
    items: (data.results || []).map((raw) => normalizeListing(raw, countryNames)),
    attribution: data.attribution || { text: "Powered by Untera", url: "https://untera.io" },
  };
  setCached(cacheKey, result);
  return result;
}

// Récupère une annonce Untera précise par son id (utilisé par la fiche détail et les favoris,
// puisqu'un visiteur peut sauvegarder un bien Untera comme un bien IMMOYA local).
async function getListingById(id) {
  if (!isConfigured()) return null;

  const [data, countryNames] = await Promise.all([unteraGet(`/listings/${encodeURIComponent(id)}`), getCountryNames()]);
  if (!data || !data.listing) return null;

  return normalizeListing(data.listing, countryNames);
}

// Vérifie l'état de la connexion Untera (utilisé par /api/health et le dashboard admin)
async function checkConnection() {
  if (!isConfigured()) return { configured: false, reachable: false };
  const data = await unteraGet("/listings/search?pageSize=1");
  return { configured: true, reachable: data !== null };
}

// Les principaux marchés couverts par Untera (score d'investissement), pour peupler
// un sélecteur de pays honnête plutôt que de deviner une liste de pays au hasard.
async function getTopMarkets(limit = 12) {
  const cached = getCached("top-markets");
  if (cached) return cached.slice(0, limit);

  const data = await unteraGet("/market/scores");
  const markets = data && Array.isArray(data.results) ? data.results : [];
  if (markets.length) setCached("top-markets", markets);
  return markets.slice(0, limit);
}

// Biens mis en avant pour la page d'accueil : quelques annonces réelles piochées dans
// chacun des marchés ciblés, mélangées, jamais de contenu inventé pour "remplir" la page.
async function getFeaturedListings(perCountry = 3) {
  const results = await Promise.all(
    TARGET_COUNTRIES.map((country) => searchListings({ country, pageSize: perCountry }))
  );
  return results.filter(Boolean).flatMap((r) => r.items);
}

// Statistiques réelles agrégées sur les marchés ciblés (§7.1 du cahier : des chiffres
// uniquement s'ils sont réels), tirées de /market/scores.
async function getTargetMarketStats() {
  const cached = getCached("target-market-stats");
  if (cached) return cached;

  const data = await unteraGet("/market/scores");
  const all = data && Array.isArray(data.results) ? data.results : [];
  const markets = TARGET_COUNTRIES.map((code) => {
    const market = all.find((m) => m.country === code);
    return market ? { ...market, countryName: FRENCH_COUNTRY_NAMES[code] || market.countryName } : null;
  }).filter(Boolean);

  const stats = {
    markets,
    totalListings: markets.reduce((sum, m) => sum + (m.listingCount || 0), 0),
    countryCount: markets.length,
  };
  if (markets.length) setCached("target-market-stats", stats);
  return stats;
}

module.exports = {
  isConfigured,
  searchListings,
  getListingById,
  checkConnection,
  getCountryNames,
  getTopMarkets,
  getFeaturedListings,
  getTargetMarketStats,
  TARGET_COUNTRIES,
};
