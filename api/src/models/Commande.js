const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: [true, 'Le nom du client est obligatoire'],
      trim: true,
      maxlength: [100, 'Le nom du client ne peut pas dépasser 100 caractères']
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone du client est obligatoire'],
      trim: true
    },
    adresseLivraison: {
      type: String,
      required: [true, 'L\'adresse de livraison est obligatoire'],
      trim: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Le restaurant est obligatoire']
    },
    plats: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Plat'
        }
      ],
      required: [true, 'La liste des plats est obligatoire'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'La commande doit contenir au moins un plat'
      }
    },
    montantTotal: {
      type: Number,
      required: [true, 'Le montant total est obligatoire'],
      min: [0, 'Le montant total ne peut pas être négatif']
    },
    statut: {
      type: String,
      enum: {
        values: ['en attente', 'confirmée', 'en livraison', 'livrée', 'annulée'],
        message: 'Statut invalide : {VALUE}'
      },
      default: 'en attente'
    },
    commentaire: {
      type: String,
      trim: true,
      maxlength: [300, 'Le commentaire ne peut pas dépasser 300 caractères']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Commande', commandeSchema);
