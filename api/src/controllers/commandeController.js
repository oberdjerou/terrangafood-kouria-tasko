const Commande = require('../models/Commande');

// Table des transitions de statut autorisées (machine à états)
const TRANSITIONS_AUTORISEES = {
  'en attente': ['confirmée', 'annulée'],
  'confirmée': ['en livraison', 'annulée'],
  'en livraison': ['livrée'],
  'livrée': [],
  'annulée': []
};

// POST /api/commandes — Créer une nouvelle commande
exports.create = async (req, res, next) => {
  try {
    const commande = new Commande(req.body);
    const saved = await commande.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Données invalides', erreurs: messages });
    }
    next(error);
  }
};

// GET /api/commandes — Récupérer toutes les commandes (triées par date décroissante)
exports.getAll = async (req, res, next) => {
  try {
    const commandes = await Commande.find()
      .populate('restaurant', 'nom')
      .populate('plats', 'nom prix')
      .sort({ createdAt: -1 });
    res.json(commandes);
  } catch (error) {
    next(error);
  }
};

// GET /api/commandes/:id — Récupérer une commande par son ID
exports.getById = async (req, res, next) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('restaurant', 'nom')
      .populate('plats', 'nom prix');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json(commande);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/commandes/:id/statut — Mettre à jour le statut (avec contrôle de transition)
exports.updateStatut = async (req, res, next) => {
  try {
    const { statut: nouveauStatut } = req.body;

    if (!nouveauStatut) {
      return res.status(400).json({ message: 'Le nouveau statut est obligatoire' });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const transitionsAutorisees = TRANSITIONS_AUTORISEES[commande.statut];

    if (!transitionsAutorisees || !transitionsAutorisees.includes(nouveauStatut)) {
      return res.status(400).json({
        message: 'Transition de statut interdite',
        statutActuel: commande.statut,
        statutDemande: nouveauStatut,
        transitionsAutorisees: transitionsAutorisees || []
      });
    }

    commande.statut = nouveauStatut;
    const saved = await commande.save();
    res.json(saved);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Données invalides', erreurs: messages });
    }
    next(error);
  }
};

// DELETE /api/commandes/:id — Supprimer une commande
exports.delete = async (req, res, next) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};
