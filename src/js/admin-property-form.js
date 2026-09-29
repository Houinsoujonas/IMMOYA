// Script du formulaire admin d'ajout/modification d'un bien (§5 du cahier des charges).
// Le même formulaire sert aux deux cas : présence de "?id=" dans l'URL = mode modification.

function getEditIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

// Convertit le texte multi-lignes du champ "Photos" en tableau d'URLs (une par ligne, lignes vides ignorées)
function parseLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Convertit le texte séparé par virgules du champ "Équipements" en tableau de chaînes
function parseCommaList(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// Remplit le formulaire avec les données d'un bien existant (mode modification)
function fillForm(form, property) {
  form.title.value = property.title || "";
  form.type.value = property.type || "";
  form.transaction.value = property.transaction || "";
  form.price.value = property.price || "";
  form.currency.value = property.currency || "EUR";
  form.city.value = property.city || "";
  form.address.value = property.address || "";
  form.surface.value = property.surface || "";
  form.bedrooms.value = property.bedrooms ?? "";
  form.bathrooms.value = property.bathrooms ?? "";
  form.parking.value = property.parking ?? "";
  form.status.value = property.status || "disponible";
  form.description.value = property.description || "";
  form.amenities.value = (property.amenities || []).join(", ");
  form.images.value = (property.images || []).join("\n");
}

// Construit le payload à envoyer à l'API à partir des valeurs du formulaire
function buildPayload(form) {
  const formData = new FormData(form);
  return {
    title: formData.get("title"),
    type: formData.get("type"),
    transaction: formData.get("transaction"),
    price: Number(formData.get("price")),
    currency: formData.get("currency"),
    city: formData.get("city"),
    address: formData.get("address"),
    surface: formData.get("surface") ? Number(formData.get("surface")) : null,
    bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
    bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
    parking: formData.get("parking") ? Number(formData.get("parking")) : null,
    status: formData.get("status"),
    description: formData.get("description"),
    amenities: parseCommaList(formData.get("amenities") || ""),
    images: parseLines(formData.get("images") || ""),
  };
}

async function init() {
  const form = document.getElementById("property-form");
  const feedback = document.getElementById("form-feedback");
  const editId = getEditIdFromUrl();

  if (editId) {
    document.getElementById("form-title").textContent = "Modifier le bien";
    try {
      const { property } = await apiGetProperty(editId);
      fillForm(form, property);
    } catch (error) {
      feedback.textContent = "Impossible de charger ce bien.";
      feedback.className = "text-sm text-red-700 mt-3";
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";

    const payload = buildPayload(form);
    const endpoint = editId ? `/api/admin/properties/${editId}` : "/api/admin/properties";
    const method = editId ? "PUT" : "POST";

    try {
      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Échec de l'enregistrement");

      window.location.href = "properties.html";
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = "text-sm text-red-700 mt-3";
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
