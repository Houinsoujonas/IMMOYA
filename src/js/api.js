// Petit client HTTP pour dialoguer avec notre backend Node (jamais directement avec Untera).
// Chargé en script classique (pas de "export"), les fonctions sont donc globales.

// Construit une query string à partir d'un objet de filtres, en ignorant les valeurs vides
function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// Récupère la liste des biens, avec filtres optionnels (transaction, type, ville, prix, etc.)
async function apiGetProperties(filters = {}) {
  const response = await fetch(`/api/properties${buildQueryString(filters)}`);
  if (!response.ok) throw new Error("Impossible de charger les biens");
  return response.json();
}

// Récupère un bien précis par son id, avec ses biens similaires
async function apiGetProperty(id) {
  const response = await fetch(`/api/properties/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("Bien introuvable");
  return response.json();
}

// Récupère la liste des villes disponibles (pour peupler les filtres)
async function apiGetCities() {
  const response = await fetch("/api/cities");
  if (!response.ok) throw new Error("Impossible de charger les villes");
  return response.json();
}

// Récupère la liste des types de biens disponibles
async function apiGetTypes() {
  const response = await fetch("/api/types");
  if (!response.ok) throw new Error("Impossible de charger les types");
  return response.json();
}

// Récupère les biens externes réels via Untera (lecture seule, §9 du cahier)
async function apiGetExternalProperties(filters = {}) {
  const response = await fetch(`/api/properties/external${buildQueryString(filters)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Impossible de charger le catalogue international");
  }
  return response.json();
}

// Sélection réelle multi-pays pour la page d'accueil ("Biens populaires" / "Biens récents").
// Mémorisée pour la page : le bandeau photo et les grilles partagent un seul appel.
let featuredPromise = null;
function apiGetExternalFeatured() {
  if (!featuredPromise) {
    featuredPromise = fetch("/api/properties/external/featured").then((response) => {
      if (!response.ok) throw new Error("Impossible de charger les biens mis en avant");
      return response.json();
    });
    featuredPromise.catch(() => (featuredPromise = null)); // un échec pourra être retenté
  }
  return featuredPromise;
}

// Illustre un bandeau [data-hero] avec la photo d'une annonce réelle (bien bâti de préférence),
// et crédite l'annonce d'origine. Sans photo disponible, le fond sombre du bandeau reste seul.
// "pick" choisit une annonce différente selon la page, pour ne pas répéter la même photo partout.
async function applyHeroPhoto(section, pick = 0) {
  const target = typeof section === "string" ? document.getElementById(section) : section;
  if (!target) return;

  try {
    const { items } = await apiGetExternalFeatured();
    const withPhoto = items.filter((p) => p.images.length);
    const built = withPhoto.filter((p) => p.type !== "Terrain");
    const pool = built.length ? built : withPhoto;
    const listing = pool[pick % Math.max(pool.length, 1)];
    if (!listing) return;

    const img = target.querySelector("[data-hero-photo]");
    img.addEventListener("load", () => img.classList.remove("opacity-0"), { once: true });
    img.src = listing.images[0];

    const credit = target.querySelector("[data-hero-credit]");
    if (credit) {
      credit.href = `property.html?id=${encodeURIComponent(listing.id)}`;
      credit.textContent = `${listing.city}${listing.country ? ", " + listing.country : ""}`;
      credit.parentElement.classList.remove("hidden");
    }
  } catch (error) {
    // Pas de photo : le bandeau garde son fond uni, sans image de substitution inventée
  }
}

// Chiffres réels agrégés sur les marchés ciblés (section "Quelques chiffres" de l'accueil)
async function apiGetExternalStats() {
  const response = await fetch("/api/properties/external/stats");
  if (!response.ok) throw new Error("Impossible de charger les statistiques");
  return response.json();
}

// Récupère les chiffres clés publics (section "Quelques chiffres" de la homepage)
async function apiGetStats() {
  const response = await fetch("/api/stats");
  if (!response.ok) throw new Error("Impossible de charger les statistiques");
  return response.json();
}

// Envoie le formulaire de contact général (page /contact)
async function apiSubmitContact(payload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Échec de l'envoi du message");
  }
  return response.json();
}

// Envoie une demande de visite pour un bien précis (page détail)
async function apiSubmitVisit(propertyId, payload) {
  const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Échec de l'envoi de la demande");
  }
  return response.json();
}
