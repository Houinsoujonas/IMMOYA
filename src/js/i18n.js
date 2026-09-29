// Système de traduction minimal (FR/EN), sans dépendance externe. Traduit l'interface du
// site (navigation, pied de page, page d'accueil) ; ne traduit jamais le contenu des
// annonces elles-mêmes (titres/descriptions Untera), qui reste dans sa langue d'origine
// pour ne pas fabriquer une traduction automatique non vérifiée.

const LANG_STORAGE_KEY = "immoya:lang";

const TRANSLATIONS = {
  fr: {
    "nav.home": "Accueil",
    "nav.properties": "Biens",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.search": "Rechercher",
    "nav.favorites": "Favoris",
    "hero.eyebrow": "— L'immobilier, autrement",
    "hero.title": "Trouvez le bien qui vous ressemble",
    "hero.subtitle": "Des biens réels au Portugal, en France, en Italie et aux États-Unis, réunis sur une seule plateforme pour comparer et sauvegarder facilement.",
    "trust.choice": "Large choix de biens réels",
    "trust.search": "Recherche rapide et intuitive",
    "trust.support": "Accompagnement personnalisé",
    "trust.secure": "Sources vérifiées",
    "section.featured": "Biens populaires",
    "section.recent": "Biens récemment ajoutés",
    "section.types": "Types de biens",
    "section.destinations": "Destinations",
    "section.why": "Pourquoi IMMOYA",
    "section.testimonials": "Ce qu'en disent nos visiteurs",
    "action.seeAll": "Voir tout →",
    "types.seeAll": "Tous les biens",
    "why.real.title": "Données réelles",
    "why.real.text": "Chaque annonce provient d'une source réelle (Untera), avec un lien vers l'annonce d'origine.",
    "why.support.title": "Accompagnement dédié",
    "why.support.text": "Un interlocuteur unique pour organiser vos visites et répondre à vos questions.",
    "why.free.title": "Sans engagement",
    "why.free.text": "Consultez, comparez et sauvegardez vos biens favoris sans créer de compte.",
    "testimonials.demo": "Avis de démonstration",
    "cta.title": "Prêt à trouver votre prochain bien ?",
    "cta.button": "Parcourir le catalogue",
    "footer.tagline": "Plateforme immobilière pour trouver le bien qui vous correspond, au Portugal, en France, en Italie et aux États-Unis.",
    "footer.explore": "Explorer",
    "footer.company": "IMMOYA",
    "search.country": "Pays",
    "search.allCountries": "Tous les pays",
    "search.type": "Type de bien",
    "search.allTypes": "Tous les types",
    "search.maxBudget": "Budget max",
    "search.submit": "Rechercher",
    "search.budgetPlaceholder": "Ex. 300 000",
    "hero.photoCredit": "Photo : annonce réelle —",
    "search.currency": "Devise du budget",
    "fav.none": "Favoris — aucun bien sauvegardé",
    "fav.one": "Favoris — 1 bien sauvegardé",
    "fav.many": "Favoris — {n} biens sauvegardés",
    "searchPage.title": "Recherche immobilière",
    "searchPage.subtitle": "Portugal, France, Italie, États-Unis : combinez pays, type et budget.",
    "searchPage.destinations": "Explorer par destination",
    "searchPage.listings": "Annonces à découvrir",
    "searchPage.listingsCount": "annonces",
  },
  en: {
    "nav.home": "Home",
    "nav.properties": "Properties",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.search": "Search",
    "nav.favorites": "Favorites",
    "hero.eyebrow": "— Real estate, differently",
    "hero.title": "Find the property that fits you",
    "hero.subtitle": "Real listings in Portugal, France, Italy and the United States, brought together on one platform to compare and save easily.",
    "trust.choice": "Wide range of real listings",
    "trust.search": "Fast, intuitive search",
    "trust.support": "Personalized support",
    "trust.secure": "Verified sources",
    "section.featured": "Featured properties",
    "section.recent": "Recently added",
    "section.types": "Property types",
    "section.destinations": "Destinations",
    "section.why": "Why IMMOYA",
    "section.testimonials": "What our visitors say",
    "action.seeAll": "See all →",
    "types.seeAll": "All properties",
    "why.real.title": "Real data",
    "why.real.text": "Every listing comes from a real source (Untera), with a link back to the original listing.",
    "why.support.title": "Dedicated support",
    "why.support.text": "A single point of contact to organize visits and answer your questions.",
    "why.free.title": "No commitment",
    "why.free.text": "Browse, compare and save your favorite properties without creating an account.",
    "testimonials.demo": "Demo reviews",
    "cta.title": "Ready to find your next property?",
    "cta.button": "Browse the catalog",
    "footer.tagline": "Real estate platform to find the property that fits you, in Portugal, France, Italy and the United States.",
    "footer.explore": "Explore",
    "footer.company": "IMMOYA",
    "search.country": "Country",
    "search.allCountries": "All countries",
    "search.type": "Property type",
    "search.allTypes": "All types",
    "search.maxBudget": "Max budget",
    "search.submit": "Search",
    "search.budgetPlaceholder": "e.g. 300,000",
    "hero.photoCredit": "Photo: real listing —",
    "search.currency": "Budget currency",
    "fav.none": "Favorites — no saved properties",
    "fav.one": "Favorites — 1 saved property",
    "fav.many": "Favorites — {n} saved properties",
    "searchPage.title": "Property search",
    "searchPage.subtitle": "Portugal, France, Italy, United States: combine country, type and budget.",
    "searchPage.destinations": "Explore by destination",
    "searchPage.listings": "Listings to discover",
    "searchPage.listingsCount": "listings",
  },
};

// Retourne la langue actuellement choisie (persistée), "fr" par défaut
function getCurrentLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) || "fr";
  } catch (error) {
    return "fr";
  }
}

// Traduit une clé pour la langue courante, avec repli sur le français puis sur la clé elle-même
function t(key) {
  const lang = getCurrentLang();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.fr[key] || key;
}

// Applique les traductions à tous les éléments [data-i18n] présents dans le document
function applyDataI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.documentElement.lang = getCurrentLang();
}

// Change la langue courante et recharge la page pour ré-appliquer proprement les
// traductions partout (navbar/footer injectés en JS compris)
function setLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (error) {
    // localStorage indisponible : le changement restera actif seulement pour cette page
  }
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", applyDataI18n);
