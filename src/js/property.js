// Script de la page /biens/:id (simulée ici par property.html?id=...).
// Charge le bien, affiche galerie + caractéristiques + biens similaires, gère les
// formulaires "Contacter" et "Demander une visite".

// Récupère l'id du bien depuis la query string de l'URL courante
function getPropertyIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

// Construit la galerie photo : grande image + vignettes cliquables pour changer l'image principale.
// Si le bien n'a aucune photo réelle, affiche le placeholder honnête plutôt qu'une fausse image.
function renderGallery(property) {
  const images = property.images && property.images.length > 0 ? property.images : [];
  const badgeClasses = property.status === "disponible" ? "bg-accent-green text-white" : "bg-ink/80 text-white";

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = `
    <div class="relative">
      ${
        images.length > 0
          ? `<img id="main-image" src="${images[0]}" alt="${property.title}" class="w-full h-[420px] object-cover rounded-card" />`
          : propertyPlaceholderMarkup("w-full h-[420px] rounded-card")
      }
      <span class="absolute top-4 left-4 text-xs font-medium px-3 py-1.5 rounded-full ${badgeClasses}">${formatStatusLabel(property)}</span>
    </div>
    ${
      images.length > 1
        ? `<div class="flex gap-3 mt-3 overflow-x-auto">
            ${images
              .map(
                (src, index) => `
                  <img
                    src="${src}"
                    data-index="${index}"
                    alt="Photo ${index + 1} de ${property.title}"
                    class="thumbnail w-24 h-20 object-cover rounded-card cursor-pointer border-2 ${index === 0 ? "border-accent-green" : "border-transparent"}"
                  />
                `
              )
              .join("")}
          </div>`
        : ""
    }
  `;

  // Au clic sur une vignette : change la grande image et met en évidence la vignette active
  gallery.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("main-image").src = images[thumb.dataset.index];
      gallery.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("border-accent-green"));
      thumb.classList.add("border-accent-green");
    });
  });
}

// Affiche les informations principales du bien (titre, prix, caractéristiques, description...)
function renderDetails(property) {
  document.title = `${property.title} — IMMOYA`;
  document.getElementById("breadcrumb-title").textContent = property.title;
  document.getElementById("property-title").textContent = property.title;
  document.getElementById("property-location").innerHTML =
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-3.5 h-3.5"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg> ${property.address || property.city}, ${property.country || ""}`;
  document.getElementById("property-price").textContent = formatPrice(property.price, property.transaction, property.currency);
  document.getElementById("property-description").textContent =
    property.description || "Description non renseignée pour ce bien.";

  // Bien externe (Untera) : lien vers l'annonce d'origine + mention de la source (§9.1 du cahier :
  // attribution requise), jamais présenté comme un bien géré par IMMOYA.
  const sourceNotice = document.getElementById("source-notice");
  if (property.source === "untera") {
    sourceNotice.classList.remove("hidden");
    sourceNotice.innerHTML = `
      Bien proposé par <strong>${property.sourceLabel || "un partenaire"}</strong>, via
      <a href="https://untera.io" target="_blank" rel="noopener" class="underline">Untera</a>.
      ${property.externalUrl ? `<a href="${property.externalUrl}" target="_blank" rel="noopener" class="underline ml-1">Voir l'annonce d'origine</a>` : ""}
    `;
  } else {
    sourceNotice.classList.add("hidden");
  }

  // Seuls les champs réellement renseignés sont affichés (pas de donnée inventée, §7.3 du cahier)
  const characteristics = [
    ["Type de bien", property.type],
    ["Surface", formatSurface(property.surface)],
    ["Chambres", formatCount(property.bedrooms)],
    ["Salles de bain", formatCount(property.bathrooms)],
    ["Parking", formatCount(property.parking)],
  ];
  document.getElementById("property-characteristics").innerHTML = characteristics
    .map(([label, value]) => `<li><span class="text-ink/50">${label} :</span> <span class="font-medium text-ink">${value}</span></li>`)
    .join("");

  const amenitiesList = document.getElementById("property-amenities");
  amenitiesList.innerHTML =
    property.amenities && property.amenities.length > 0
      ? property.amenities.map((item) => `<li class="px-3 py-1 bg-ink/5 rounded-full text-sm">${item}</li>`).join("")
      : `<li class="text-sm text-ink/50">Aucun équipement renseigné</li>`;

  // Bouton favori (icône cœur en cercle, même logique que sur les cartes)
  const favoriteButton = document.getElementById("favorite-toggle-detail");
  const syncFavoriteButton = (favored) => {
    favoriteButton.textContent = favored ? "♥" : "♡";
    favoriteButton.classList.toggle("text-accent-green", favored);
    favoriteButton.classList.toggle("border-accent-green", favored);
    favoriteButton.setAttribute("aria-label", favored ? "Retirer des favoris" : "Ajouter aux favoris");
  };
  syncFavoriteButton(isFavorite(property.id));
  favoriteButton.addEventListener("click", () => syncFavoriteButton(toggleFavorite(property.id)));

  // Bouton "partager" : copie le lien de la fiche dans le presse-papiers
  document.getElementById("share-toggle").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papiers.");
    } catch (error) {
      // API presse-papiers indisponible (permissions, contexte non sécurisé...) : on n'interrompt pas la navigation
    }
  });

  // Liens de partage réseaux sociaux : URLs d'intention standard, aucune donnée personnelle transmise
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(property.title);
  document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  document.getElementById("share-x").href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
  document.getElementById("share-linkedin").href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
}

// Affiche jusqu'à 3 biens similaires en bas de page
function renderSimilar(similarProperties) {
  const container = document.getElementById("similar-grid");
  if (similarProperties.length === 0) {
    document.getElementById("similar-section").classList.add("hidden");
    return;
  }
  renderPropertyGrid(container, similarProperties);
}

// Branche le formulaire (partagé entre "Contacter" et "Demander une visite") sur l'API
function initRequestForm(propertyId) {
  const form = document.getElementById("request-form");
  const feedback = document.getElementById("request-feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await apiSubmitVisit(propertyId, payload);
      feedback.textContent = "Votre demande a bien été envoyée. Nous vous recontactons rapidement.";
      feedback.className = "text-sm text-accent-green mt-3";
      form.reset();
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = "text-sm text-red-700 mt-3";
    }
  });

  // Les deux boutons pré-remplissent juste le champ caché "type" avant de faire défiler vers le formulaire
  document.getElementById("btn-contact").addEventListener("click", () => {
    form.querySelector('input[name="type"]').value = "contact";
    document.getElementById("request-form-section").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("btn-visit").addEventListener("click", () => {
    form.querySelector('input[name="type"]').value = "visite";
    document.getElementById("request-form-section").scrollIntoView({ behavior: "smooth" });
  });
}

async function init() {
  const propertyId = getPropertyIdFromUrl();
  const container = document.getElementById("property-detail");

  if (!propertyId) {
    container.innerHTML = `<p class="text-center py-20 text-ink/60">Aucun bien sélectionné.</p>`;
    return;
  }

  try {
    const { property, similar } = await apiGetProperty(propertyId);
    renderGallery(property);
    renderDetails(property);
    renderSimilar(similar);
    initRequestForm(property.id);
  } catch (error) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-ink/60">Ce bien n'existe pas ou n'est plus disponible.</p>
        <a href="properties.html" class="btn-secondary mt-4 inline-block text-sm">Retour au catalogue</a>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", init);
