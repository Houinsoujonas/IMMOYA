// Service de gestion des demandes (contact + visite), stocké dans un fichier JSON local.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "requests.json");

function readAll() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeAll(requests) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

function generateId() {
  // Identifiant lisible façon "#1053", cohérent avec l'exemple du cahier des charges
  const requests = readAll();
  const maxNumber = requests.reduce((max, r) => {
    const n = Number(String(r.id).replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1048);
  return "r" + (maxNumber + 1);
}

// Retourne toutes les demandes, filtrées optionnellement par statut et/ou type
function getAll(filters = {}) {
  let requests = readAll();

  if (filters.status) {
    requests = requests.filter((r) => r.status === filters.status);
  }
  if (filters.type) {
    requests = requests.filter((r) => r.type === filters.type);
  }

  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getById(id) {
  return readAll().find((r) => r.id === id);
}

// Crée une nouvelle demande à partir du formulaire de contact ou "demander une visite"
function create(requestData) {
  const requests = readAll();
  const newRequest = {
    id: generateId(),
    status: "Nouveau",
    createdAt: new Date().toISOString(),
    ...requestData,
  };
  requests.push(newRequest);
  writeAll(requests);
  return newRequest;
}

// Met à jour le statut (ou d'autres champs) d'une demande existante
function update(id, changes) {
  const requests = readAll();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  requests[index] = { ...requests[index], ...changes, id };
  writeAll(requests);
  return requests[index];
}

// Nombre de demandes par statut "Nouveau", utile pour le badge du dashboard
function getStats() {
  const requests = readAll();
  return {
    total: requests.length,
    nouveaux: requests.filter((r) => r.status === "Nouveau").length,
    visites: requests.filter((r) => r.type === "visite").length,
  };
}

module.exports = { getAll, getById, create, update, getStats };
