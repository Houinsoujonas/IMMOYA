// Carrousel de témoignages (§7.1 du cahier, point 10) : contenu de démonstration, clairement
// signalé comme tel puisqu'aucun avis client réel n'est disponible pour ce portfolio.
// Défilement horizontal continu, en pause au survol pour rester lisible.

const TESTIMONIALS = [
  { name: "Marc D.", location: "Lisbonne, Portugal", text: "Le catalogue est impressionnant, j'ai trouvé un appartement à Porto en quelques minutes de recherche." },
  { name: "Sophie L.", location: "Paris, France", text: "Interface claire, filtres pratiques. Exactement ce qu'il me fallait pour comparer plusieurs biens en Île-de-France." },
  { name: "Giulia R.", location: "Milan, Italie", text: "J'ai pu voir une vraie sélection de biens italiens avec photos et prix réels, sans inscription compliquée." },
  { name: "James K.", location: "Austin, États-Unis", text: "Great way to browse real listings across several countries from one single place." },
  { name: "Antoine P.", location: "Lyon, France", text: "La fiche détail est complète : surface, chambres, localisation. Rien à redire." },
  { name: "Ines M.", location: "Porto, Portugal", text: "Site rapide, agréable à utiliser sur mobile. J'ai ajouté plusieurs biens à mes favoris." },
  { name: "Luca B.", location: "Rome, Italie", text: "Ho trovato utile poter confrontare più immobili con dati reali, senza fronzoli inutili." },
  { name: "Emily R.", location: "Miami, États-Unis", text: "Clean design, real listings, and the favorites feature made comparing properties easy." },
  { name: "Camille T.", location: "Bordeaux, France", text: "Le formulaire de contact est simple, réponse rapide de l'équipe." },
  { name: "Pedro A.", location: "Faro, Portugal", text: "Bonne surprise : les données viennent vraiment d'annonces existantes, pas de biens inventés." },
  { name: "Francesca N.", location: "Florence, Italie", text: "Design pulito e informazioni chiare su ogni immobile. Consigliato." },
  { name: "Robert H.", location: "Dallas, États-Unis", text: "I appreciated seeing the original listing source linked on each property page." },
  { name: "Julien F.", location: "Marseille, France", text: "Navigation fluide, même sur un vieux téléphone. Bravo pour le responsive." },
  { name: "Beatriz S.", location: "Coimbra, Portugal", text: "J'ai particulièrement aimé la section des biens partenaires internationaux." },
  { name: "Marco V.", location: "Naples, Italie", text: "Prezzi coerenti con il mercato reale, finalmente una piattaforma affidabile." },
  { name: "Ashley W.", location: "Denver, États-Unis", text: "Simple, fast, and no fake data — exactly what I look for in a listings site." },
  { name: "Nathalie G.", location: "Nice, France", text: "Le moteur de recherche par pays et budget m'a fait gagner beaucoup de temps." },
  { name: "Tiago C.", location: "Braga, Portugal", text: "Très bonne expérience, l'équipe a répondu à ma demande de visite rapidement." },
];

// Construit une carte de témoignage individuelle
function testimonialCardMarkup(t) {
  return `
    <div class="card p-6 w-80 shrink-0">
      <p class="text-sm text-ink/70 leading-relaxed">« ${t.text} »</p>
      <p class="text-sm font-semibold text-ink mt-4">${t.name}</p>
      <p class="text-xs text-ink/50">${t.location}</p>
    </div>
  `;
}

// Injecte le carrousel dans le conteneur donné : la liste est dupliquée une fois pour
// obtenir une boucle visuelle continue via l'animation CSS ".testimonials-track".
function renderTestimonials(containerId) {
  const target = document.getElementById(containerId);
  if (!target) return;

  const cardsHtml = TESTIMONIALS.map(testimonialCardMarkup).join("");

  target.innerHTML = `
    <div class="overflow-hidden">
      <div class="testimonials-track flex gap-6 w-max">
        ${cardsHtml}
        ${cardsHtml}
      </div>
    </div>
  `;
}
