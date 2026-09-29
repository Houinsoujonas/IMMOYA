// Script de la page /favoris : lit les ids stockés dans localStorage (favorites.js)
// et récupère les biens correspondants auprès du backend.

async function loadFavoriteProperties() {
  const container = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");
  const clearButton = document.getElementById("clear-favorites");
  const ids = getFavoriteIds();

  if (ids.length === 0) {
    container.classList.add("hidden");
    emptyState.classList.remove("hidden");
    clearButton.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  emptyState.classList.add("hidden");
  clearButton.classList.remove("hidden");
  container.innerHTML = Array.from({ length: Math.min(ids.length, 3) })
    .map(() => `<div class="skeleton aspect-[4/3]"></div>`)
    .join("");

  // Récupère chaque bien en parallèle ; un id de bien supprimé entre-temps est simplement ignoré
  const results = await Promise.allSettled(ids.map((id) => apiGetProperty(id)));
  const properties = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value.property);

  if (properties.length === 0) {
    container.classList.add("hidden");
    emptyState.classList.remove("hidden");
    clearButton.classList.add("hidden");
    return;
  }

  renderPropertyGrid(container, properties);
}

document.addEventListener("DOMContentLoaded", () => {
  loadFavoriteProperties();

  document.getElementById("clear-favorites").addEventListener("click", () => {
    // Confirmation avant une action destructive, même si elle ne touche que le localStorage
    if (!window.confirm("Retirer tous vos biens favoris ?")) return;
    clearFavorites();
    loadFavoriteProperties();
  });
});
