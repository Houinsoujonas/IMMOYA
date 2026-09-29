// Composant Footer réutilisable sur toutes les pages publiques d'IMMOYA.
// Dépend de i18n.js (fonction "t"), chargé avant ce script sur chaque page.

// Colonnes de liens du footer, regroupées par thème pour rester faciles à faire évoluer.
function footerColumns() {
  return [
    {
      title: t("footer.explore"),
      links: [
        { label: t("nav.properties"), href: "properties.html" },
        { label: t("nav.search"), href: "search.html" },
        { label: t("nav.favorites"), href: "favorites.html" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.about"), href: "about.html" },
        { label: t("nav.contact"), href: "contact.html" },
      ],
    },
  ];
}

// Construit le HTML d'une colonne de liens (titre + liste de liens)
function buildColumn(column) {
  const linksHtml = column.links
    .map(
      (link) =>
        `<a href="${link.href}" class="block text-sm text-background/70 hover:text-background transition-colors duration-200 py-1">${link.label}</a>`
    )
    .join("");

  return `
    <div>
      <h3 class="font-display text-background text-base mb-3">${column.title}</h3>
      ${linksHtml}
    </div>
  `;
}

// Génère le balisage complet du footer.
function footerMarkup() {
  // Récupère l'année en cours pour la mention de copyright (toujours à jour)
  const currentYear = new Date().getFullYear();

  const columnsHtml = footerColumns().map(buildColumn).join("");

  return `
    <footer class="bg-ink text-background mt-24">
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <!-- Colonne logo + description, prend 2 colonnes sur desktop pour équilibrer la grille -->
        <div class="col-span-2 md:col-span-2">
          <p class="font-display text-xl mb-2">IMMOYA</p>
          <p class="text-sm text-background/70 max-w-xs">${t("footer.tagline")}</p>
        </div>

        ${columnsHtml}
      </div>

      <!-- Ligne de copyright en bas du footer -->
      <div class="border-t border-background/10 py-4 text-center text-xs text-background/50">
        &copy; ${currentYear} IMMOYA. Tous droits réservés.
      </div>
    </footer>
  `;
}

// Fonction publique appelée depuis chaque page : injecte le footer dans #footer.
// Pas de "export" : chargé comme script classique (voir navbar.js pour la raison).
function renderFooter() {
  const container = document.getElementById("footer");
  if (!container) return;

  container.innerHTML = footerMarkup();
}
