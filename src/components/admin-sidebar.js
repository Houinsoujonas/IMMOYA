// Barre latérale de navigation de l'espace admin (§10.2 du cahier des charges).
// Totalement séparée du header public : pas de logo cliquable vers le site public,
// pas de liens vers les pages visiteurs.

// Petites icônes inline (pas d'emoji), une par élément de navigation
const ADMIN_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></svg>`,
  properties: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>`,
  requests: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
  visits: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
};

function adminSidebarMarkup(activePage) {
  const links = [
    { key: "dashboard", label: "Tableau de bord", href: "index.html" },
    { key: "properties", label: "Biens", href: "properties.html" },
    { key: "requests", label: "Demandes", href: "requests.html?type=contact" },
    { key: "visits", label: "Visites", href: "requests.html?type=visite" },
    { key: "settings", label: "Paramètres", href: "settings.html" },
  ];

  const linksHtml = links
    .map(
      (link) => `
        <a
          href="${link.href}"
          class="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-colors duration-200 ${
            activePage === link.key ? "bg-accent-green text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
          }"
        >${ADMIN_ICONS[link.key]}${link.label}</a>
      `
    )
    .join("");

  return `
    <aside class="bg-accent-navy text-white w-full md:w-64 md:min-h-screen md:sticky md:top-0 p-5 flex md:flex-col justify-between">
      <div class="w-full">
        <p class="text-lg font-bold tracking-tight px-2 py-4">IMM<span class="text-accent-green">O</span>YA <span class="text-white/40 text-xs font-normal align-middle">ADMIN</span></p>
        <nav class="space-y-1 mt-4">${linksHtml}</nav>
      </div>
      <button id="admin-logout" class="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-200">
        ${ADMIN_ICONS.logout} Déconnexion
      </button>
    </aside>
  `;
}

function renderAdminSidebar(containerId, activePage) {
  const target = document.getElementById(containerId);
  if (!target) return;

  target.outerHTML = adminSidebarMarkup(activePage);

  document.getElementById("admin-logout").addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "login.html";
  });
}
