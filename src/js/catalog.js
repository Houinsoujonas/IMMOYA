// Script de la page /biens (catalogue) : biens réels via Untera, filtrés par pays/budget
// (seuls critères réellement supportés côté serveur par l'API) et par type côté client.
// États loading / erreur / aucun résultat (§15 du cahier).

const PAGE_SIZE = 12;
let currentItems = []; // résultats bruts renvoyés par Untera pour les filtres actifs
let currentSort = "default";

// Lit les filtres actuellement présents dans l'URL (permet de partager un lien de recherche)
function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

// Met à jour l'URL (sans recharger la page) pour refléter les filtres actifs
function updateUrl(filters) {
  const params = new URLSearchParams(filters);
  window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
}

function showLoadingState() {
  document.getElementById("results-grid").innerHTML = Array.from({ length: 6 })
    .map(() => `<div class="skeleton aspect-[4/3]"></div>`)
    .join("");
  document.getElementById("results-count").textContent = "Chargement...";
}

function showErrorState(message, retry) {
  document.getElementById("results-grid").innerHTML = `
    <div class="col-span-full text-center py-16">
      <p class="text-ink/70">${message}</p>
      <button id="retry-button" class="btn-secondary mt-4 text-sm">Réessayer</button>
    </div>
  `;
  document.getElementById("results-count").textContent = "";
  document.getElementById("retry-button").addEventListener("click", retry);
}

// Applique le filtre "type" (côté client) et le tri courant, puis affiche le résultat
function renderFilteredItems(filters) {
  let items = [...currentItems];

  if (filters.type) {
    items = items.filter((item) => item.type === filters.type);
  }

  if (currentSort === "price-asc") {
    items = items.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (currentSort === "price-desc") {
    items = items.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  }

  renderPropertyGrid("results-grid", items);
  document.getElementById("results-count").textContent =
    items.length === 0 ? "Aucun résultat" : `${items.length} bien${items.length > 1 ? "s" : ""} trouvé${items.length > 1 ? "s" : ""}`;
}

// Récupère les biens Untera pour les filtres courants (pays + budget, seuls params serveur réels)
async function fetchAndRender(filters) {
  showLoadingState();
  try {
    const { items, attribution } = await apiGetExternalProperties({
      country: filters.country,
      maxPrice: filters.maxPrice,
      currency: filters.maxPrice ? filters.currency || defaultCurrencyFor(filters.country) : undefined,
      pageSize: PAGE_SIZE,
    });
    currentItems = items;
    renderFilteredItems(filters);

    const attributionEl = document.getElementById("external-attribution");
    if (attributionEl) attributionEl.textContent = attribution ? attribution.text : "";
  } catch (error) {
    showErrorState(error.message || "Une erreur est survenue lors du chargement des biens.", () => fetchAndRender(filters));
  }
}

// Peuple le sélecteur de pays avec les marchés réellement ciblés (jamais une liste inventée)
async function populateCountrySelect(selectedCountry) {
  const select = document.getElementById("filter-country");
  if (!select) return;

  try {
    const { markets } = await apiGetExternalStats();
    markets.forEach((m) => {
      const option = document.createElement("option");
      option.value = m.country;
      option.textContent = m.countryName;
      option.selected = m.country === selectedCountry;
      select.appendChild(option);
    });
  } catch (error) {
    // Si les marchés ne chargent pas, le sélecteur reste réduit à "Tous les pays ciblés"
  }
}

function initFiltersForm(initialFilters) {
  const form = document.getElementById("filters-form");
  document.getElementById("filter-type").value = initialFilters.type || "";
  document.getElementById("filter-max-price").value = initialFilters.maxPrice || "";
  const currencySelect = document.getElementById("filter-currency");
  currencySelect.value = initialFilters.currency || defaultCurrencyFor(initialFilters.country);

  // La devise du budget suit le pays choisi (EUR pour PT/FR/IT, USD pour les États-Unis)
  document.getElementById("filter-country").addEventListener("change", (event) => {
    currencySelect.value = defaultCurrencyFor(event.target.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const filters = {
      country: document.getElementById("filter-country").value,
      type: document.getElementById("filter-type").value,
      maxPrice: document.getElementById("filter-max-price").value,
    };
    if (filters.maxPrice) filters.currency = currencySelect.value;
    updateUrl(filters);
    fetchAndRender(filters);
  });

  document.getElementById("sort-select").addEventListener("change", (event) => {
    currentSort = event.target.value;
    renderFilteredItems({
      country: document.getElementById("filter-country").value,
      type: document.getElementById("filter-type").value,
    });
  });
}

async function init() {
  const initialFilters = getFiltersFromUrl();
  applyHeroPhoto("catalog-hero", 2);

  await populateCountrySelect(initialFilters.country);
  initFiltersForm(initialFilters);
  fetchAndRender(initialFilters);
}

document.addEventListener("DOMContentLoaded", init);
