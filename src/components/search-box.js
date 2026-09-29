// Moteur de recherche rapide (§7.1 du cahier : pays, type, budget). Le pays et le budget
// max sont les seuls critères réellement supportés par l'API Untera ; le type est appliqué
// côté client sur les résultats reçus (Untera ne propose pas de filtre serveur par type).

// Devise officielle de chaque marché ciblé (norme ISO 4217) : sert à proposer par défaut la
// devise du pays choisi pour le budget, que le visiteur peut toujours changer.
const COUNTRY_CURRENCY = { PT: "EUR", FR: "EUR", IT: "EUR", US: "USD" };

// Loupe SVG du bouton de recherche (plus reconnaissable qu'un symbole typographique)
const SEARCH_BUTTON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="w-4 h-4" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

// Devise par défaut pour un pays donné (EUR si aucun pays : 3 des 4 marchés sont en euro)
function defaultCurrencyFor(country) {
  return COUNTRY_CURRENCY[country] || "EUR";
}

// Construit le HTML du formulaire de recherche rapide. "markets" = pays réels ciblés
// (code + nom), obtenus via /api/properties/external/stats — jamais une liste inventée.
function searchBoxMarkup(markets) {
  const countryOptions = markets
    .map((m) => `<option value="${m.country}">${m.countryName}</option>`)
    .join("");

  return `
    <form id="quick-search-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.4fr_auto] gap-3 items-end">
      <div>
        <label for="qs-country" class="block text-xs text-ink/50 mb-1">${t("search.country")}</label>
        <select id="qs-country" name="country" class="w-full border border-line rounded-full px-4 py-3 bg-white text-sm">
          <option value="">${t("search.allCountries")}</option>
          ${countryOptions}
        </select>
      </div>
      <div>
        <label for="qs-type" class="block text-xs text-ink/50 mb-1">${t("search.type")}</label>
        <select id="qs-type" name="type" class="w-full border border-line rounded-full px-4 py-3 bg-white text-sm">
          <option value="">${t("search.allTypes")}</option>
          <option value="Maison">Maison</option>
          <option value="Appartement">Appartement</option>
          <option value="Villa">Villa</option>
          <option value="Résidentiel">Résidentiel</option>
          <option value="Terrain">Terrain</option>
          <option value="Bureau">Bureau</option>
          <option value="Commerce">Commerce</option>
        </select>
      </div>
      <div>
        <label for="qs-budget" class="block text-xs text-ink/50 mb-1">${t("search.maxBudget")}</label>
        <div class="flex border border-line rounded-full bg-white overflow-hidden focus-within:ring-2 focus-within:ring-accent-green/30">
          <input id="qs-budget" type="number" min="0" step="1000" name="maxPrice" placeholder="${t("search.budgetPlaceholder")}" class="flex-1 min-w-0 px-4 py-3 text-sm outline-none" />
          <select name="currency" aria-label="${t("search.currency")}" class="border-l border-line bg-background/60 px-3 text-sm font-medium text-ink/70 outline-none">
            <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-primary text-sm whitespace-nowrap w-full lg:w-auto inline-flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1">
        ${SEARCH_BUTTON_ICON}<span>${t("search.submit")}</span>
      </button>
    </form>
  `;
}

// Injecte le formulaire dans le conteneur donné et branche la redirection vers "targetPage"
async function renderSearchBox(container, targetPage = "properties.html") {
  const target = typeof container === "string" ? document.getElementById(container) : container;
  if (!target) return;

  let markets = [];
  try {
    const stats = await apiGetExternalStats();
    markets = stats.markets || [];
  } catch (error) {
    // Si les marchés ne chargent pas, le formulaire reste utilisable sans le sélecteur pays rempli
  }

  target.innerHTML = searchBoxMarkup(markets);

  const form = target.querySelector("#quick-search-form");

  // La devise du budget suit le pays choisi (EUR pour PT/FR/IT, USD pour les États-Unis)
  form.country.addEventListener("change", () => {
    form.currency.value = defaultCurrencyFor(form.country.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      if (value) params.set(key, value);
    });
    // La devise n'a de sens qu'accompagnée d'un budget
    if (!params.get("maxPrice")) params.delete("currency");

    window.location.href = `${targetPage}?${params.toString()}`;
  });
}
