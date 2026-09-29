// Point d'entrée JS commun à toutes les pages publiques.
// navbar.js et footer.js sont chargés en scripts classiques AVANT ce fichier (voir <script> dans index.html),
// leurs fonctions renderNavbar()/renderFooter() sont donc déjà disponibles ici.

// "DOMContentLoaded" : on attend que le HTML soit entièrement chargé avant de manipuler le DOM
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
});
