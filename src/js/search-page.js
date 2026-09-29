// Script de la page /recherche : formulaire en tête, puis de quoi donner envie d'explorer
// avec uniquement des données réelles Untera — destinations illustrées par une vraie photo
// d'annonce du pays, et une sélection d'annonces réelles des 4 marchés ciblés.

function renderSkeletons(containerId, count) {
  document.getElementById(containerId).innerHTML = Array.from({ length: count })
    .map(() => `<div class="skeleton aspect-[4/3]"></div>`)
    .join("");
}

function renderError(containerId, message) {
  document.getElementById(containerId).innerHTML = `<p class="col-span-full text-center text-ink/50 py-8">${message}</p>`;
}

async function loadDiscovery() {
  renderSkeletons("search-destinations", 4);
  renderSkeletons("search-listings", 6);

  try {
    const [{ markets }, { items }] = await Promise.all([apiGetExternalStats(), apiGetExternalFeatured()]);

    renderDestinationGrid("search-destinations", markets, items);

    // Une annonce par pays d'abord, pour une sélection variée plutôt que 3 biens du même pays
    const byCountry = markets.map((m) => items.filter((p) => p.country === m.countryName));
    const mixed = [];
    for (let i = 0; mixed.length < 6 && byCountry.some((list) => list[i]); i++) {
      byCountry.forEach((list) => list[i] && mixed.length < 6 && mixed.push(list[i]));
    }
    renderPropertyGrid("search-listings", mixed);
  } catch (error) {
    renderError("search-destinations", "Impossible de charger les destinations pour le moment.");
    renderError("search-listings", "");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSearchBox("search-form-container", "properties.html");
  applyHeroPhoto("search-hero", 1);
  loadDiscovery();
});
