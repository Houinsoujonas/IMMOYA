// Carte de bien réutilisable (§6.3 du cahier des charges) : image, badge transaction,
// bouton favori, titre, ville, caractéristiques clés (avec icônes), prix.
// Dépend de format.js (formatPrice, formatSurface, formatCount, getMainImage, formatStatusLabel)
// et de favorites.js (isFavorite, toggleFavorite), tous deux chargés avant ce script.

// Petites icônes inline (pas d'emoji) pour les caractéristiques de la carte
const ICON_BED = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18v2M21 18v2M3 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/></svg>`;
const ICON_BATH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M7 12V6a2 2 0 0 1 3.5-1.3M4 19v1M20 19v1"/></svg>`;
const ICON_AREA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-3.5 h-3.5"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;

// Construit le HTML d'une carte pour un bien donné. "property.html?id=..." simule la route
// dynamique /biens/:id, ce site n'ayant pas de bundler pour du vrai routing côté client.
function propertyCardMarkup(property) {
  const favored = isFavorite(property.id);
  const statusLabel = formatStatusLabel(property);
  // Le badge reste vert tant que le bien est disponible (quelle que soit la transaction),
  // et passe en slate foncé une fois vendu/loué : la couleur renforce le libellé texte,
  // elle n'est jamais le seul signal (§6.2 du cahier).
  const badgeClasses = property.status === "disponible" ? "bg-accent-green text-white" : "bg-ink/80 text-white";

  const mainImage = getMainImage(property);
  const isExternal = property.source === "untera";

  return `
    <a href="property.html?id=${encodeURIComponent(property.id)}" class="card group block overflow-hidden reveal" data-property-id="${property.id}">
      <div class="relative aspect-[4/3] overflow-hidden">
        ${
          mainImage
            ? `<img src="${mainImage}" alt="${property.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />`
            : propertyPlaceholderMarkup("w-full h-full")
        }
        <span class="absolute top-3 left-3 text-xs font-medium px-3 py-1.5 rounded-full ${badgeClasses}">${statusLabel}</span>
        ${isExternal ? `<span class="absolute bottom-3 left-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/90 text-ink/60">via Untera</span>` : ""}
        <button
          type="button"
          class="favorite-toggle absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center text-base ${favored ? "text-accent-green" : "text-ink/60"}"
          data-property-id="${property.id}"
          aria-label="${favored ? "Retirer des favoris" : "Ajouter aux favoris"}"
          aria-pressed="${favored}"
        >${favored ? "♥" : "♡"}</button>
      </div>

      <div class="p-4">
        <h3 class="text-base font-semibold text-ink truncate">${property.title}</h3>
        <p class="flex items-center gap-1 text-sm text-ink/50 mt-1">${ICON_PIN} ${property.city}${property.country ? ", " + property.country : ""}</p>

        <div class="flex items-center gap-3 text-xs text-ink/60 mt-3">
          <span class="flex items-center gap-1">${ICON_AREA} ${formatSurface(property.surface)}</span>
          <span class="flex items-center gap-1">${ICON_BED} ${formatCount(property.bedrooms)}</span>
          <span class="flex items-center gap-1">${ICON_BATH} ${formatCount(property.bathrooms)}</span>
        </div>

        <p class="mt-3 text-lg font-bold text-accent-green">${formatPrice(property.price, property.transaction, property.currency)}</p>
      </div>
    </a>
  `;
}

// Carte destination (pays) illustrée par la photo d'une annonce réelle du pays, ou fond uni
function destinationCardMarkup(market, image) {
  const count = new Intl.NumberFormat(getCurrentLang() === "en" ? "en-US" : "fr-FR").format(market.listingCount);
  const background = image
    ? `<img src="${image}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />`
    : `<div class="absolute inset-0 bg-accent-navy"></div>`;

  return `
    <a href="properties.html?country=${market.country}" class="group reveal relative block aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-card">
      ${background}
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p class="text-lg font-semibold">${market.countryName}</p>
        <p class="text-xs text-white/80">${count} ${t("searchPage.listingsCount")}</p>
      </div>
    </a>
  `;
}

// Affiche les destinations ; "listings" = annonces réelles déjà chargées, où l'on choisit pour
// chaque pays une photo de bien bâti de préférence (une vue aérienne de terrain illustre mal un pays)
function renderDestinationGrid(containerId, markets, listings) {
  const target = document.getElementById(containerId);
  if (!target) return;

  const imageFor = (countryName) => {
    const withPhoto = listings.filter((p) => p.country === countryName && p.images.length);
    const best = withPhoto.find((p) => p.type !== "Terrain") || withPhoto[0];
    return best ? best.images[0] : null;
  };

  target.innerHTML = markets.map((m) => destinationCardMarkup(m, imageFor(m.countryName))).join("");
  if (typeof observeReveal === "function") observeReveal(target);
}

// Affiche une grille de cartes dans le conteneur donné (élément DOM ou id de conteneur)
function renderPropertyGrid(container, properties) {
  const target = typeof container === "string" ? document.getElementById(container) : container;
  if (!target) return;

  if (properties.length === 0) {
    target.innerHTML = `
      <div class="col-span-full text-center py-12 text-ink/50">
        Aucun bien ne correspond à votre recherche pour le moment.
      </div>
    `;
    return;
  }

  target.innerHTML = properties.map(propertyCardMarkup).join("");
  attachFavoriteToggles(target);

  // Les cartes portent la classe "reveal" (opacity:0 tant que non observées) : comme elles
  // viennent d'être injectées après le chargement initial de la page, il faut les faire
  // observer explicitement ici, sinon elles resteraient invisibles indéfiniment.
  if (typeof observeReveal === "function") observeReveal(target);
}

// Branche le clic sur chaque cœur de favori d'un conteneur donné (sans déclencher le lien de la carte)
function attachFavoriteToggles(container) {
  container.querySelectorAll(".favorite-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      // Empêche le clic sur le cœur de suivre le lien de la carte vers la page détail
      event.preventDefault();
      event.stopPropagation();

      const propertyId = button.dataset.propertyId;
      const nowFavored = toggleFavorite(propertyId);
      button.textContent = nowFavored ? "♥" : "♡";
      button.classList.toggle("text-accent-green", nowFavored);
      button.classList.toggle("text-ink/60", !nowFavored);
      button.setAttribute("aria-pressed", String(nowFavored));
      button.setAttribute("aria-label", nowFavored ? "Retirer des favoris" : "Ajouter aux favoris");
    });
  });
}
