// Script propre à la page d'accueil : charge les données réelles via l'API Untera
// (§9 du cahier) pour les sections "Biens populaires", "Biens récents", "Destinations"
// et "Quelques chiffres". Aucune donnée fictive n'est utilisée sur cette page.

// Affiche un état de chargement (squelettes) pendant qu'une section attend ses données
function renderSkeletons(containerId, count) {
  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = Array.from({ length: count })
    .map(() => `<div class="skeleton aspect-[4/3]"></div>`)
    .join("");
}

// Affiche un message d'erreur discret si le chargement d'une section échoue
function renderError(containerId, message) {
  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = `<p class="col-span-full text-center text-ink/50 py-8">${message}</p>`;
}

// Charge une sélection réelle de biens (mélange des marchés ciblés) et la répartit entre
// "Biens populaires" et "Biens récemment ajoutés" pour éviter un double appel identique.
async function loadFeaturedAndRecent() {
  renderSkeletons("featured-grid", 3);
  renderSkeletons("recent-grid", 3);

  try {
    const { items } = await apiGetExternalFeatured();
    if (items.length === 0) {
      renderError("featured-grid", "Aucun bien disponible pour le moment sur les marchés ciblés.");
      renderError("recent-grid", "");
      return;
    }

    const half = Math.ceil(items.length / 2);
    renderPropertyGrid("featured-grid", items.slice(0, half));
    renderPropertyGrid("recent-grid", items.slice(half));
  } catch (error) {
    renderError("featured-grid", "Le catalogue international est temporairement indisponible.");
    renderError("recent-grid", "");
  }
}

// Charge les marchés ciblés réels (Portugal, France, Italie, États-Unis) avec leur nombre
// d'annonces réel, pour la section "Destinations" et pour peupler la section "Quelques chiffres"
async function loadMarketsAndStats() {
  const destinationsGrid = document.getElementById("destinations-grid");
  const statsGrid = document.getElementById("stats-grid");

  try {
    const { markets, totalListings } = await apiGetExternalStats();

    if (destinationsGrid) {
      // Les photos viennent de la même sélection réelle que les grilles de biens (appel mémorisé)
      const { items } = await apiGetExternalFeatured().catch(() => ({ items: [] }));
      renderDestinationGrid("destinations-grid", markets, items);
    }

    if (statsGrid) {
      statsGrid.innerHTML = `
        <div><p class="font-display text-4xl text-accent-green">${new Intl.NumberFormat("fr-FR").format(totalListings)}</p><p class="text-sm text-ink/60 mt-1">Biens référencés</p></div>
        <div><p class="font-display text-4xl text-accent-green">${markets.length}</p><p class="text-sm text-ink/60 mt-1">Pays couverts</p></div>
        <div><p class="font-display text-4xl text-accent-green">${markets[3]?.dataConfidence ?? "—"}%</p><p class="text-sm text-ink/60 mt-1">Fiabilité des données (US)</p></div>
        <div><p class="font-display text-4xl text-accent-green">Untera</p><p class="text-sm text-ink/60 mt-1">Source des données</p></div>
      `;
    }
  } catch (error) {
    if (destinationsGrid) renderError("destinations-grid", "Impossible de charger les destinations pour le moment.");
    if (statsGrid) renderError("stats-grid", "");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSearchBox("search-engine-container");
  applyHeroPhoto("hero");
  loadFeaturedAndRecent();
  loadMarketsAndStats();
});
