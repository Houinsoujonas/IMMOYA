// Fonction serverless Vercel : toutes les requêtes /api/* sont redirigées ici (voir
// vercel.json) et traitées par la même application Express qu'en local.

module.exports = require("../backend/app");
