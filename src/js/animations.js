// Animations discrètes (équivalent vanilla de Framer Motion : Framer Motion est une
// librairie React, incompatible avec ce stack HTML/JS vanilla sans bundler — même effet
// visuel obtenu ici via IntersectionObserver + transitions CSS, sans dépendance externe).

// Un seul observateur partagé pour toute la page (plus efficace que d'en recréer un par appel)
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        // Une fois révélé, plus besoin de continuer à observer cet élément
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// Observe tous les éléments ".reveal" présents dans "root" qui ne le sont pas encore.
// IMPORTANT : à appeler à nouveau après toute insertion dynamique de contenu (cartes de
// biens chargées via fetch, etc.), sinon ces éléments resteraient bloqués à opacity:0 —
// un simple appel unique au chargement de la page ne suffit pas puisque ce contenu
// n'existe pas encore à ce moment-là.
function observeReveal(root = document) {
  root.querySelectorAll(".reveal:not(.reveal-visible)").forEach((element) => {
    revealObserver.observe(element);
  });
}

document.addEventListener("DOMContentLoaded", () => observeReveal(document));
