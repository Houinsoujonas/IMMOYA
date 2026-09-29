// Route publique du formulaire de contact général (page /contact).

const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contact.controller");
const { rateLimit } = require("../middleware/rateLimit");

// Limite l'envoi du formulaire public (§7.7 du cahier : protection anti-spam proportionnée)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: "Trop de messages envoyés. Réessayez plus tard.",
});

router.post("/contact", contactLimiter, contactController.submitContact);

module.exports = router;
