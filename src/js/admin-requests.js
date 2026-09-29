// Script de la page admin "Demandes" / "Visites" (§6 du cahier des charges).
// Une seule page gère les deux, filtrée par "type" (contact ou visite).

const STATUS_OPTIONS = ["Nouveau", "En cours", "Traité", "Archivé"];

function getFiltersFromUrl() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

function statusSelectMarkup(request) {
  return `
    <select data-id="${request.id}" class="status-select border border-ink/15 rounded-card px-2 py-1 text-xs bg-white">
      ${STATUS_OPTIONS.map((status) => `<option value="${status}" ${status === request.status ? "selected" : ""}>${status}</option>`).join("")}
    </select>
  `;
}

function rowMarkup(request) {
  return `
    <tr class="border-b border-ink/5 align-top">
      <td class="py-3 pr-4 text-ink/50">#${request.id.replace(/^r/, "")}</td>
      <td class="py-3 pr-4">${request.propertyTitle || "—"}</td>
      <td class="py-3 pr-4">
        <p>${request.clientName}</p>
        <p class="text-xs text-ink/50">${request.clientEmail}</p>
        <p class="text-xs text-ink/50">${request.clientPhone || ""}</p>
      </td>
      <td class="py-3 pr-4 capitalize">${request.type}</td>
      <td class="py-3 pr-4 max-w-xs">${request.message}</td>
      <td class="py-3 pr-4 whitespace-nowrap">${formatDate(request.createdAt)}</td>
      <td class="py-3 pr-4">${statusSelectMarkup(request)}</td>
    </tr>
  `;
}

async function loadRequests(filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/requests?${params.toString()}`);
  // Session pas encore validée (admin-guard.js redirige) : on n'affiche rien plutôt que de planter
  const requests = response.ok ? await response.json() : [];

  const tbody = document.getElementById("requests-body");
  tbody.innerHTML =
    requests.length > 0
      ? requests.map(rowMarkup).join("")
      : `<tr><td colspan="7" class="text-center py-10 text-ink/50">Aucune demande pour ce filtre.</td></tr>`;

  tbody.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      await adminFetch(`/api/admin/requests/${select.dataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: select.value }),
      });
    });
  });
}

function initFilters(initialFilters) {
  const typeSelect = document.getElementById("filter-type");
  const statusSelect = document.getElementById("filter-status");

  typeSelect.value = initialFilters.type || "";
  statusSelect.value = initialFilters.status || "";

  const applyFilters = () => {
    const filters = {};
    if (typeSelect.value) filters.type = typeSelect.value;
    if (statusSelect.value) filters.status = statusSelect.value;
    loadRequests(filters);
  };

  typeSelect.addEventListener("change", applyFilters);
  statusSelect.addEventListener("change", applyFilters);
}

document.addEventListener("DOMContentLoaded", () => {
  const initialFilters = getFiltersFromUrl();
  initFilters(initialFilters);
  loadRequests(initialFilters);
});
