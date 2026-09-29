// Fonctions de formatage partagées entre les pages publiques et l'admin.
// Chargé en script classique, fonctions disponibles globalement.

// Formate un prix avec sa devise. Les biens IMMOYA locaux sont en FCFA (XOF, formaté à la
// main pour un rendu familier) ; les biens Untera arrivent dans leur devise d'origine
// (EUR, USD, GHS...), formatée via Intl pour rester correcte sans le prétendre en FCFA
// (§4.5 du cahier : chaque bien garde sa devise réelle, jamais une conversion inventée).
function formatPrice(price, transaction, currency) {
  if (price === null || price === undefined) return "Prix sur demande";

  let formatted;
  if (!currency || currency === "XOF") {
    formatted = new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  } else {
    try {
      formatted = new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
    } catch (error) {
      // Code devise inconnu d'Intl : on affiche quand même le montant plutôt que de planter
      formatted = new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
    }
  }

  return transaction === "location" ? `${formatted} / mois` : formatted;
}

// Formate une surface en m², avec repli si la donnée est absente (§8 du cahier : fallback)
function formatSurface(surface) {
  return surface ? `${surface} m²` : "Surface non renseignée";
}

// Formate un nombre de chambres/salles de bain, avec repli "—" si absent
function formatCount(value) {
  return value || value === 0 ? String(value) : "—";
}

// Retourne l'URL de la première photo réelle d'un bien, ou "null" si aucune n'est disponible.
// On ne renvoie jamais une fausse photo générique à la place (§4.7 du cahier des charges :
// un visuel de remplacement doit être clairement identifiable comme tel, jamais faire croire
// qu'il représente le bien). L'appelant affiche alors propertyPlaceholderMarkup() à la place.
function getMainImage(property) {
  return property.images && property.images.length > 0 ? property.images[0] : null;
}

// Bloc de remplacement honnête quand un bien n'a pas de photo : une icône, pas une fausse image.
function propertyPlaceholderMarkup(extraClasses = "") {
  return `
    <div class="${extraClasses} bg-accent-green/5 flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="w-1/4 h-1/4 text-accent-green/25">
        <path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>
      </svg>
    </div>
  `;
}

// Traduit le statut technique d'un bien en libellé lisible pour l'utilisateur
function formatStatusLabel(property) {
  if (property.status === "vendu") return "Vendu";
  if (property.status === "loué") return "Loué";
  return property.transaction === "location" ? "À louer" : "À vendre";
}

// Formate une date ISO en date lisible en français ("25 septembre 2026")
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
