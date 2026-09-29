// Routes de l'espace admin. Toutes les routes sauf /login passent par "requireAdmin".

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/requireAdmin");
const { rateLimit } = require("../middleware/rateLimit");

// Limite les tentatives de connexion (§10.1 du cahier : protection anti-brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
});

router.post("/login", loginLimiter, adminController.login);
router.post("/logout", adminController.logout);
router.get("/session", adminController.checkSession);

// Tout ce qui suit nécessite une session admin valide
router.use(requireAdmin);

router.get("/dashboard", adminController.dashboard);
router.get("/settings", adminController.settings);

router.get("/properties", adminController.listProperties);
router.post("/properties", adminController.createProperty);
router.put("/properties/:id", adminController.updateProperty);
router.delete("/properties/:id", adminController.deleteProperty);

router.get("/requests", adminController.listRequests);
router.put("/requests/:id", adminController.updateRequest);

module.exports = router;
