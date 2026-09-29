// Script du dashboard admin : charge les chiffres clés et les derniers biens ajoutés.

// Couleur du badge de statut d'une demande (le texte reste le signal principal, la couleur le renforce)
const REQUEST_STATUS_CLASSES = {
  Nouveau: "bg-accent-green/10 text-accent-green",
  "En cours": "bg-amber-500/10 text-amber-600",
  Traité: "bg-ink/10 text-ink/70",
  Archivé: "bg-ink/5 text-ink/40",
};

// Affiche une barre horizontale par type de bien, proportionnelle au type le plus représenté.
// Uniquement des comptages réels issus du catalogue (aucun historique/pourcentage inventé).
function renderTypeBreakdown(breakdown) {
  const container = document.getElementById("type-breakdown");
  if (breakdown.length === 0) {
    container.innerHTML = `<p class="text-sm text-ink/40">Aucun bien pour le moment.</p>`;
    return;
  }
  const max = Math.max(...breakdown.map((b) => b.count));
  container.innerHTML = breakdown
    .map(
      ({ type, count }) => `
        <div>
          <div class="flex items-center justify-between text-xs text-ink/60 mb-1">
            <span>${type}</span><span>${count}</span>
          </div>
          <div class="h-2 rounded-full bg-ink/5">
            <div class="h-2 rounded-full bg-accent-green" style="width: ${(count / max) * 100}%"></div>
          </div>
        </div>
      `
    )
    .join("");
}

// Affiche les dernières demandes reçues (contact + visite) avec un badge de statut
function renderRecentRequests(requests) {
  const container = document.getElementById("recent-requests");
  if (requests.length === 0) {
    container.innerHTML = `<p class="text-sm text-ink/40">Aucune demande pour le moment.</p>`;
    return;
  }
  container.innerHTML = requests
    .map(
      (r) => `
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-ink truncate">${r.type === "visite" ? "Visite" : "Contact"} — ${r.clientName}</p>
            <p class="text-xs text-ink/40 truncate">${r.propertyTitle || "Message général"}</p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${REQUEST_STATUS_CLASSES[r.status] || "bg-ink/5 text-ink/60"}">${r.status}</span>
        </div>
      `
    )
    .join("");
}

async function loadDashboard() {
  const response = await fetch("/api/admin/dashboard");
  // Si la session n'est pas (encore) valide, admin-guard.js est en train de rediriger
  // vers le login : on arrête simplement ici plutôt que de planter sur une réponse 401.
  if (!response.ok) return;
  const data = await response.json();

  document.getElementById("stat-total").textContent = data.properties.total;
  document.getElementById("stat-disponibles").textContent = data.properties.disponibles;
  document.getElementById("stat-vendus").textContent = data.properties.vendus;
  document.getElementById("stat-loues").textContent = data.properties.loues;
  document.getElementById("stat-demandes").textContent = data.requests.total;
  document.getElementById("stat-visites").textContent = data.requests.visites;

  // Petit indicateur d'état de la connexion Untera, utile pour savoir si le fallback local est actif
  const unteraBadge = document.getElementById("untera-status");
  unteraBadge.textContent = data.untera.reachable
    ? "Untera connecté"
    : "Untera non configuré — données locales utilisées";
  unteraBadge.className = data.untera.reachable
    ? "text-xs px-3 py-1 rounded-card bg-accent-green/10 text-accent-green"
    : "text-xs px-3 py-1 rounded-card bg-ink/5 text-ink/60";

  renderTypeBreakdown(data.typeBreakdown);
  renderRecentRequests(data.recentRequests);

  const recentTable = document.getElementById("recent-properties-body");
  recentTable.innerHTML = data.recentProperties
    .map(
      (property) => `
        <tr class="border-b border-ink/5">
          <td class="py-3 pr-4">${property.title}</td>
          <td class="py-3 pr-4">${property.city}</td>
          <td class="py-3 pr-4">${formatPrice(property.price, property.transaction)}</td>
          <td class="py-3 pr-4">${property.status}</td>
        </tr>
      `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadDashboard);
