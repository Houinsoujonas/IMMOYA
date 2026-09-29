// Routes publiques liées aux biens immobiliers.

const express = require("express");
const router = express.Router();

const propertiesController = require("../controllers/properties.controller");
const contactController = require("../controllers/contact.controller");
const { rateLimit } = require("../middleware/rateLimit");

const visitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: "Trop de demandes envoyées. Réessayez plus tard.",
});

router.get("/properties", propertiesController.list);
// Routes "external" déclarées AVANT "/properties/:id" : sinon Express les confondrait
// avec un id de bien littéral "external".
router.get("/properties/external", propertiesController.externalList);
router.get("/properties/external/markets", propertiesController.externalMarkets);
router.get("/properties/external/featured", propertiesController.externalFeatured);
router.get("/properties/external/stats", propertiesController.externalStats);
router.get("/properties/:id", propertiesController.getOne);
router.post("/properties/:id/visit", visitLimiter, contactController.submitVisitRequest);

router.get("/search", propertiesController.search);
router.get("/cities", propertiesController.cities);
router.get("/types", propertiesController.types);
router.get("/stats", propertiesController.stats);

module.exports = router;
