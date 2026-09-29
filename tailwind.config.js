// Configuration Tailwind CSS pour IMMOYA.
// Toutes les couleurs et polices du branding sont centralisées ici (§6.1 du cahier) :
// il suffit de modifier ces valeurs pour changer l'identité visuelle de tout le site.
// Palette alignée sur la maquette fournie (vert profond + slate, boutons pilule, cartes arrondies).
module.exports = {
  content: [
    "./pages/**/*.html",
    "./src/js/**/*.js",
    "./src/components/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // Fond général du site (blanc cassé légèrement froid, conforme à la maquette)
        background: "#F8FAFC",
        // Couleur de texte principale (slate foncé, plus doux qu'un noir pur)
        ink: "#1F2937",
        // Accent principal : vert profond (boutons, liens actifs, badges "à vendre")
        "accent-green": "#0F766E",
        // Accent secondaire : slate foncé (fond de la sidebar admin, variantes)
        "accent-navy": "#1F2937",
        // Bordures et séparateurs discrets
        line: "#E5E7EB",
      },
      fontFamily: {
        // Une seule famille pour tout le site (interface ET titres) : plus simple, plus premium
        // sur ce type de plateforme que de mélanger deux polices (voir maquette fournie).
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        // Radius des cartes (photos, blocs) : conforme à la maquette (coins bien marqués)
        card: "1rem",
      },
      boxShadow: {
        // Ombre très légère pour les cartes (effet discret, pas de glassmorphism)
        soft: "0 2px 12px rgba(31, 41, 55, 0.06)",
      },
    },
  },
  plugins: [],
};
