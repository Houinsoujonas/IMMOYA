// Script de la page admin "Biens" (§5 du cahier : lister, filtrer, modifier, supprimer).

async function fetchAdminProperties(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/properties?${params.toString()}`);
  // Session pas encore validée (admin-guard.js redirige) : on renvoie une liste vide plutôt que de planter
  if (!response.ok) return [];
  return response.json();
}

function rowMarkup(property) {
  return `
    <tr class="border-b border-ink/5">
      <td class="py-3 pr-4">${property.title}</td>
      <td class="py-3 pr-4">${property.type}</td>
      <td class="py-3 pr-4 capitalize">${property.transaction}</td>
      <td class="py-3 pr-4">${property.city}</td>
      <td class="py-3 pr-4">${formatPrice(property.price, property.transaction)}</td>
      <td class="py-3 pr-4">${property.status}</td>
      <td class="py-3 pr-4 whitespace-nowrap">
        <a href="property-form.html?id=${property.id}" class="text-accent-green hover:underline text-sm">Modifier</a>
        <button data-id="${property.id}" class="delete-btn text-red-700 hover:underline text-sm ml-3">Supprimer</button>
      </td>
    </tr>
  `;
}

async function loadProperties(filters = {}) {
  const properties = await fetchAdminProperties(filters);
  const tbody = document.getElementById("properties-body");

  tbody.innerHTML =
    properties.length > 0
      ? properties.map(rowMarkup).join("")
      : `<tr><td colspan="7" class="text-center py-10 text-ink/50">Aucun bien ne correspond à ces filtres.</td></tr>`;

  tbody.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => handleDelete(button.dataset.id, filters));
  });
}

async function handleDelete(id, currentFilters) {
  // Confirmation obligatoire avant toute suppression (§5 du cahier des charges)
  const confirmed = window.confirm("Supprimer définitivement ce bien ? Cette action est irréversible.");
  if (!confirmed) return;

  await adminFetch(`/api/admin/properties/${encodeURIComponent(id)}`, { method: "DELETE" });
  loadProperties(currentFilters);
}

function readFiltersFromForm(form) {
  const formData = new FormData(form);
  const filters = {};
  formData.forEach((value, key) => {
    if (value) filters[key] = value;
  });
  return filters;
}

function initFiltersForm() {
  const form = document.getElementById("admin-filters-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    loadProperties(readFiltersFromForm(form));
  });
  form.addEventListener("reset", () => {
    setTimeout(() => loadProperties({}), 0);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFiltersForm();
  loadProperties();
});
