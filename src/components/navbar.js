// Composant Navbar réutilisable sur toutes les pages publiques d'IMMOYA.
// Généré en JS pur (pas de fetch de fragment HTML) pour fonctionner même
// si la page est ouverte directement en file:// (sans serveur).
//
// L'espace admin n'est jamais annoncé ici : conformément à la séparation stricte
// public/admin (§10.1 du cahier), il n'existe aucun lien visible vers /admin depuis
// le site public. On y accède uniquement en connaissant directement son URL.
//
// Dépend de i18n.js (fonction "t") pour ses libellés, chargé avant ce script sur chaque page.

function navLinks() {
  return [
    { label: t("nav.home"), href: "index.html" },
    { label: t("nav.properties"), href: "properties.html" },
    { label: t("nav.about"), href: "about.html" },
    { label: t("nav.contact"), href: "contact.html" },
  ];
}

// Icônes inline (pas d'emoji) utilisées dans le cluster d'actions et la barre mobile
const SEARCH_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="w-5 h-5"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
const HOME_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>`;
const BUILDING_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4M9 7h.01M15 7h.01M9 11h.01M15 11h.01"/></svg>`;

// Construit le HTML des liens desktop
function buildDesktopLinks() {
  return navLinks()
    .map((link) => `<a href="${link.href}" class="text-sm text-ink/70 hover:text-accent-green transition-colors duration-200">${link.label}</a>`)
    .join("");
}

// Construit le HTML des liens dans le menu mobile déroulant (même liste, mise en page verticale).
function buildMobileLinks() {
  return navLinks()
    .map((link) => `<a href="${link.href}" class="block py-3 border-b border-line text-ink/80">${link.label}</a>`)
    .join("");
}

// Nombre de favoris sauvegardés et libellé explicite correspondant ("Favoris — 2 biens sauvegardés")
function favoritesCount() {
  return typeof getFavoriteIds === "function" ? getFavoriteIds().length : 0;
}

function favoritesLabel(count) {
  if (count === 0) return t("fav.none");
  if (count === 1) return t("fav.one");
  return t("fav.many").replace("{n}", count);
}

// Petit badge numérique affiché sur l'icône favoris quand il y a au moins un favori.
// Masqué aux lecteurs d'écran : le nombre est déjà annoncé par le libellé du lien.
function favoritesBadgeMarkup(count) {
  if (count === 0) return "";
  return `<span aria-hidden="true" class="absolute -top-1.5 -right-1.5 bg-accent-green text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">${count}</span>`;
}

// Met à jour le badge, l'infobulle et le libellé accessible après ajout/retrait d'un favori
function updateFavoritesIndicator() {
  const link = document.getElementById("nav-favorites");
  if (!link) return;
  const count = favoritesCount();
  const label = favoritesLabel(count);
  link.setAttribute("aria-label", label);
  link.querySelector(".nav-tooltip").textContent = label;
  link.querySelector(".nav-fav-badge").innerHTML = favoritesBadgeMarkup(count);
}

// Petit sélecteur de langue FR/EN (§4.5 du cahier : français par défaut, traduction possible)
function languageSwitcherMarkup() {
  const current = getCurrentLang();
  return `
    <div class="flex items-center border border-line rounded-full text-xs overflow-hidden">
      <button type="button" data-lang="fr" class="lang-btn px-2.5 py-1.5 ${current === "fr" ? "bg-accent-green text-white" : "text-ink/50"}">FR</button>
      <button type="button" data-lang="en" class="lang-btn px-2.5 py-1.5 ${current === "en" ? "bg-accent-green text-white" : "text-ink/50"}">EN</button>
    </div>
  `;
}

// Génère le balisage complet de la navbar (logo + liens desktop + cluster d'actions + panneau mobile)
function navbarMarkup() {
  return `
    <nav class="bg-background/95 backdrop-blur-sm border-b border-line sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <a href="index.html" class="text-xl font-bold tracking-tight text-ink">IMM<span class="text-accent-green">O</span>YA</a>

        <div class="hidden md:flex items-center gap-8">
          ${buildDesktopLinks()}
        </div>

        <div class="flex items-center gap-4">
          ${languageSwitcherMarkup()}

          <a href="search.html" aria-label="${t("nav.search")}" class="group relative text-ink/70 hover:text-accent-green transition-colors duration-200">
            ${SEARCH_ICON_SVG}
            <span class="nav-tooltip" aria-hidden="true">${t("nav.search")}</span>
          </a>

          <a id="nav-favorites" href="favorites.html" aria-label="${favoritesLabel(favoritesCount())}" class="group relative text-ink/70 hover:text-accent-green transition-colors duration-200 text-lg">
            <span aria-hidden="true">♡</span>
            <span class="nav-fav-badge">${favoritesBadgeMarkup(favoritesCount())}</span>
            <span class="nav-tooltip" aria-hidden="true">${favoritesLabel(favoritesCount())}</span>
          </a>

          <button
            id="navbar-toggle"
            class="md:hidden text-2xl text-ink"
            aria-label="Ouvrir le menu"
            aria-expanded="false"
          >☰</button>
        </div>
      </div>

      <div id="navbar-mobile-panel" class="hidden md:hidden px-4 pb-4 border-t border-line">
        <a href="search.html" class="flex items-center gap-2 py-3 border-b border-line text-ink/80">${SEARCH_ICON_SVG} ${t("nav.search")}</a>
        <a href="favorites.html" class="flex items-center gap-2 py-3 border-b border-line text-ink/80">♡ ${t("nav.favorites")}</a>
        ${buildMobileLinks()}
      </div>
    </nav>
  `;
}

// Barre de navigation basse fixe, visible uniquement sur mobile (§14 du cahier : navigation mobile prioritaire)
function mobileBottomNavMarkup() {
  const items = [
    { label: t("nav.home"), href: "index.html", icon: HOME_ICON_SVG },
    { label: t("nav.properties"), href: "properties.html", icon: BUILDING_ICON_SVG },
    { label: t("nav.search"), href: "search.html", icon: SEARCH_ICON_SVG },
    { label: t("nav.favorites"), href: "favorites.html", icon: "♡" },
  ];

  return `
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-line flex items-stretch">
      ${items
        .map(
          (item) => `
            <a href="${item.href}" class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-ink/60 hover:text-accent-green">
              <span class="w-5 h-5 flex items-center justify-center text-lg leading-none">${item.icon}</span>
              <span class="text-[10px]">${item.label}</span>
            </a>
          `
        )
        .join("")}
    </nav>
  `;
}

function attachMobileToggle() {
  const toggleButton = document.getElementById("navbar-toggle");
  const mobilePanel = document.getElementById("navbar-mobile-panel");

  if (!toggleButton || !mobilePanel) return;

  toggleButton.addEventListener("click", () => {
    const isHidden = mobilePanel.classList.toggle("hidden");
    toggleButton.setAttribute("aria-expanded", String(!isHidden));
  });
}

// Branche les deux boutons FR/EN sur le changement de langue (recharge la page, voir i18n.js)
function attachLanguageSwitcher(container) {
  container.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  });
}

// Fonction publique appelée depuis chaque page : injecte la navbar + la barre basse mobile.
function renderNavbar() {
  const container = document.getElementById("navbar");
  if (!container) return;

  container.innerHTML = navbarMarkup();
  attachMobileToggle();
  attachLanguageSwitcher(container);

  if (!document.getElementById("mobile-bottom-nav")) {
    document.body.insertAdjacentHTML("beforeend", `<div id="mobile-bottom-nav">${mobileBottomNavMarkup()}</div>`);
    document.body.classList.add("pb-16", "md:pb-0");
  }
}
