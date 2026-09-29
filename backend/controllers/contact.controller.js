// Contrôleur : traite les formulaires publics "Contact" et "Demander une visite".

const requestsService = require("../services/requests.service");
const propertiesService = require("../services/properties.service");
const unteraService = require("../services/untera.service");

// Vérifie que les champs obligatoires d'une demande sont bien présents et non vides
function validateRequestBody(body) {
  const requiredFields = ["clientName", "clientEmail", "message"];
  return requiredFields.every((field) => typeof body[field] === "string" && body[field].trim() !== "");
}

// Piège à robots (§7.7 du cahier) : un champ "website" invisible pour un humain mais que
// les robots de spam remplissent presque toujours. On répond succès sans rien enregistrer,
// pour ne pas leur révéler que leur soumission a été filtrée.
function isHoneypotTriggered(body) {
  return typeof body.website === "string" && body.website.trim() !== "";
}

// POST /api/contact — formulaire générique de la page /contact (sujet libre, sans bien précis)
function submitContact(req, res) {
  if (isHoneypotTriggered(req.body)) {
    return res.status(201).json({ id: "ignored", status: "Nouveau" });
  }

  if (!validateRequestBody(req.body)) {
    return res.status(400).json({ error: "Nom, email et message sont obligatoires" });
  }

  const newRequest = requestsService.create({
    propertyId: null,
    propertyTitle: req.body.subject || "Message général",
    type: "contact",
    clientName: req.body.clientName,
    clientEmail: req.body.clientEmail,
    clientPhone: req.body.clientPhone || "",
    message: req.body.message,
  });

  res.status(201).json(newRequest);
}

// POST /api/properties/:id/visit — demande de visite depuis la fiche d'un bien.
// L'id peut désigner un bien IMMOYA local ou un bien externe Untera (préfixe "untera:") :
// dans les deux cas on vérifie que le bien existe réellement avant d'enregistrer la demande.
async function submitVisitRequest(req, res) {
  if (isHoneypotTriggered(req.body)) {
    return res.status(201).json({ id: "ignored", status: "Nouveau" });
  }

  const { id } = req.params;
  const property = id.startsWith("untera:")
    ? await unteraService.getListingById(id.slice("untera:".length))
    : propertiesService.getById(id);

  if (!property) {
    return res.status(404).json({ error: "Bien introuvable" });
  }

  if (!validateRequestBody(req.body)) {
    return res.status(400).json({ error: "Nom, email et message sont obligatoires" });
  }

  const newRequest = requestsService.create({
    propertyId: id,
    propertySource: property.source || "immoya",
    propertyTitle: property.title,
    // "type" vaut "visite" par défaut, mais le formulaire "Contacter" de la fiche bien
    // envoie explicitement type: "contact" pour distinguer les deux dans l'admin
    type: req.body.type === "contact" ? "contact" : "visite",
    clientName: req.body.clientName,
    clientEmail: req.body.clientEmail,
    clientPhone: req.body.clientPhone || "",
    message: req.body.message,
  });

  res.status(201).json(newRequest);
}

module.exports = { submitContact, submitVisitRequest };
