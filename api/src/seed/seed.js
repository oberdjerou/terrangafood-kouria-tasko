const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Restaurant = require('../models/Restaurant');
const Plat = require('../models/Plat');

// Charger les variables d'environnement uniquement si .env existe (mode local).
// En Docker, les variables sont injectées via docker-compose (pas de fichier .env).
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const restaurants = [
  {
    nom: 'Chez Fatou',
    cuisine: 'Sénégalaise traditionnelle',
    adresse: 'Rue 10, Médina, Dakar',
    telephone: '+221 77 123 45 67',
    description: 'Cuisine familiale sénégalaise authentique. Les meilleurs thiéboudienne et yassa de la Médina.',
    note: 4.5,
    horaires: { ouverture: '08:00', fermeture: '22:00' },
    estOuvert: true
  },
  {
    nom: 'Le Lamantin',
    cuisine: 'Africaine fusion',
    adresse: 'Corniche Ouest, Fann, Dakar',
    telephone: '+221 33 456 78 90',
    description: 'Restaurant gastronomique avec vue sur l\'océan. Fusion de saveurs africaines et européennes.',
    note: 4.2,
    horaires: { ouverture: '11:00', fermeture: '23:00' },
    estOuvert: true
  },
  {
    nom: 'Dibiterie Keur Serigne',
    cuisine: 'Grillades sénégalaises',
    adresse: 'Avenue Cheikh Anta Diop, Dakar',
    telephone: '+221 76 234 56 78',
    description: 'Spécialiste du dibi (viande grillée). Ambiance conviviale et prix abordables.',
    note: 4.0,
    horaires: { ouverture: '10:00', fermeture: '01:00' },
    estOuvert: true
  },
  {
    nom: 'Phare des Mamelles',
    cuisine: 'Fruits de mer',
    adresse: 'Route des Mamelles, Ouakam, Dakar',
    telephone: '+221 33 567 89 01',
    description: 'Poissons et fruits de mer frais du jour. Terrasse panoramique sur les Mamelles.',
    note: 4.7,
    horaires: { ouverture: '12:00', fermeture: '23:00' },
    estOuvert: true
  },
  {
    nom: 'Tangana Café',
    cuisine: 'Café & snacks',
    adresse: 'Rue Parchappe, Plateau, Dakar',
    telephone: '+221 78 345 67 89',
    description: 'Petit-déjeuner sénégalais, sandwiches et café Touba. Idéal pour les étudiants.',
    note: 3.8,
    horaires: { ouverture: '06:30', fermeture: '20:00' },
    estOuvert: true
  }
];

const platsParRestaurant = {
  'Chez Fatou': [
    { nom: 'Thiéboudienne', description: 'Riz au poisson avec légumes, le plat national sénégalais', prix: 2500, categorie: 'plat principal' },
    { nom: 'Yassa Poulet', description: 'Poulet mariné aux oignons et citron, servi avec du riz blanc', prix: 2000, categorie: 'plat principal' },
    { nom: 'Mafé', description: 'Sauce à l\'arachide avec viande de bœuf et riz', prix: 2000, categorie: 'plat principal' },
    { nom: 'Thiéré', description: 'Couscous de mil à la sauce de légumes', prix: 1800, categorie: 'plat principal' },
    { nom: 'Bissap', description: 'Jus d\'hibiscus glacé, sucré à la menthe', prix: 500, categorie: 'boisson' },
    { nom: 'Thiakry', description: 'Dessert à base de mil et yaourt sucré', prix: 800, categorie: 'dessert' }
  ],
  'Le Lamantin': [
    { nom: 'Tartare de Thon Dakarois', description: 'Thon rouge local, avocat, mangue verte et citron vert', prix: 5500, categorie: 'entrée' },
    { nom: 'Filet de Thiof Grillé', description: 'Mérou grillé, purée de patate douce, sauce bissap', prix: 7500, categorie: 'plat principal' },
    { nom: 'Risotto au Lait de Coco', description: 'Risotto crémeux, crevettes de Casamance, épices locales', prix: 6500, categorie: 'plat principal' },
    { nom: 'Fondant au Chocolat', description: 'Fondant chocolat noir, glace vanille de Madagascar', prix: 3500, categorie: 'dessert' },
    { nom: 'Jus de Bouye', description: 'Jus de fruit du baobab, glacé', prix: 1500, categorie: 'boisson' }
  ],
  'Dibiterie Keur Serigne': [
    { nom: 'Dibi Agneau', description: 'Côtelettes d\'agneau grillées au charbon, oignons et moutarde', prix: 3000, categorie: 'plat principal' },
    { nom: 'Dibi Bœuf', description: 'Entrecôte de bœuf grillée, accompagnée de frites maison', prix: 3500, categorie: 'plat principal' },
    { nom: 'Brochettes Mixtes', description: 'Assortiment de brochettes bœuf et agneau', prix: 2500, categorie: 'plat principal' },
    { nom: 'Salade Fataya', description: 'Beignets farcis à la viande, salade verte', prix: 1500, categorie: 'entrée' },
    { nom: 'Ataya', description: 'Thé à la menthe sénégalais, préparé en 3 services', prix: 300, categorie: 'boisson' }
  ],
  'Phare des Mamelles': [
    { nom: 'Crevettes Géantes Grillées', description: 'Crevettes de Casamance, beurre ail-persil, riz parfumé', prix: 8000, categorie: 'plat principal' },
    { nom: 'Thiof à la Saint-Louisienne', description: 'Mérou en sauce tomate épicée, façon Saint-Louis', prix: 6000, categorie: 'plat principal' },
    { nom: 'Salade de Poulpe', description: 'Poulpe tendre, légumes croquants, vinaigrette citron', prix: 4000, categorie: 'entrée' },
    { nom: 'Caldou', description: 'Bouillon de poisson parfumé au citron et au persil', prix: 3500, categorie: 'plat principal' },
    { nom: 'Ginger Beer Maison', description: 'Bière de gingembre artisanale, non alcoolisée', prix: 1000, categorie: 'boisson' }
  ],
  'Tangana Café': [
    { nom: 'Ndambé Baguette', description: 'Baguette garnie de haricots niébé en sauce tomate épicée', prix: 800, categorie: 'plat principal' },
    { nom: 'Omelette Baguette', description: 'Baguette avec omelette, salade et frites', prix: 1000, categorie: 'plat principal' },
    { nom: 'Café Touba', description: 'Café infusé au poivre de Selim, spécialité sénégalaise', prix: 300, categorie: 'boisson' },
    { nom: 'Fataya', description: 'Beignet farci à la viande hachée épicée', prix: 200, categorie: 'entrée' },
    { nom: 'Lakh', description: 'Bouillie de mil au lait caillé et sucre', prix: 500, categorie: 'dessert' }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Nettoyer les collections existantes
    await Restaurant.deleteMany({});
    await Plat.deleteMany({});
    console.log('🗑️  Collections nettoyées');

    // Insérer les restaurants
    const savedRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`🏪 ${savedRestaurants.length} restaurants insérés`);

    // Insérer les plats avec les références aux restaurants
    let totalPlats = 0;
    for (const restaurant of savedRestaurants) {
      const platsData = platsParRestaurant[restaurant.nom];
      if (platsData) {
        const platsAvecRef = platsData.map((plat) => ({
          ...plat,
          restaurant: restaurant._id
        }));
        await Plat.insertMany(platsAvecRef);
        totalPlats += platsAvecRef.length;
      }
    }
    console.log(`🍽️  ${totalPlats} plats insérés`);

    console.log('\n✅ Seed terminé avec succès !');
    console.log('Vous pouvez maintenant lancer le serveur avec : npm run dev');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.message);
    process.exit(1);
  }
}

seed();
