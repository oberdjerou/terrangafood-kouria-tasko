'use client';

import { useState } from 'react';
import { creerCommande } from '../lib/api';

export default function CommandeForm({ restaurant, plats }) {
  const [client, setClient] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [platsChoisis, setPlatsChoisis] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calcul du total en temps réel à partir des plats choisis
  const montantTotal = platsChoisis.reduce((total, platId) => {
    const plat = plats.find((p) => p._id === platId);
    return total + (plat ? plat.prix : 0);
  }, 0);

  const togglePlat = (platId) => {
    setPlatsChoisis((prev) =>
      prev.includes(platId) ? prev.filter((id) => id !== platId) : [...prev, platId]
    );
  };

  const reinitialiser = () => {
    setClient('');
    setTelephone('');
    setAdresseLivraison('');
    setCommentaire('');
    setPlatsChoisis([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const nouvelleCommande = {
        client: client.trim(),
        telephone: telephone.trim(),
        adresseLivraison: adresseLivraison.trim(),
        restaurant: restaurant._id,
        plats: platsChoisis,
        montantTotal,
        commentaire: commentaire.trim() || undefined
      };

      const cree = await creerCommande(nouvelleCommande);

      setMessage({
        type: 'success',
        texte: `✅ Commande créée avec succès (#${cree._id.slice(-6)}) — statut : ${cree.statut}.`
      });
      reinitialiser();
    } catch (err) {
      setMessage({
        type: 'error',
        texte: `❌ ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || platsChoisis.length === 0;

  return (
    <form className="commande-form" onSubmit={handleSubmit}>
      <h2>Passer commande chez {restaurant.nom}</h2>

      {message && (
        <div
          className={`commande-message ${
            message.type === 'success' ? 'commande-message-success' : 'commande-message-error'
          }`}
        >
          {message.texte}
        </div>
      )}

      <section className="commande-form-section">
        <h3>Vos coordonnées</h3>

        <div className="commande-form-field">
          <label htmlFor="client">Nom complet *</label>
          <input
            id="client"
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Ex : Aminata Diop"
            required
            maxLength={100}
          />
        </div>

        <div className="commande-form-field">
          <label htmlFor="telephone">Téléphone *</label>
          <input
            id="telephone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+221 77 123 45 67"
            required
          />
        </div>

        <div className="commande-form-field">
          <label htmlFor="adresse">Adresse de livraison *</label>
          <input
            id="adresse"
            type="text"
            value={adresseLivraison}
            onChange={(e) => setAdresseLivraison(e.target.value)}
            placeholder="Villa 12, Sicap Liberté 6, Dakar"
            required
          />
        </div>
      </section>

      <section className="commande-form-section">
        <h3>Sélectionnez vos plats ({platsChoisis.length})</h3>

        <div className="commande-plats-list">
          {plats.map((plat) => {
            const selected = platsChoisis.includes(plat._id);
            return (
              <label
                key={plat._id}
                className={`commande-plat-item ${selected ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => togglePlat(plat._id)}
                />
                <span className="commande-plat-item-nom">{plat.nom}</span>
                <span className="commande-plat-item-prix">
                  {plat.prix.toLocaleString('fr-SN')} FCFA
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="commande-form-section">
        <h3>Commentaire (optionnel)</h3>
        <div className="commande-form-field">
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex : Sans piment, livraison à 19h…"
            maxLength={300}
          />
        </div>
      </section>

      <div className="commande-total">
        <span>Total</span>
        <span className="commande-total-montant">
          {montantTotal.toLocaleString('fr-SN')} FCFA
        </span>
      </div>

      <button type="submit" className="btn-commander" disabled={submitDisabled}>
        {loading
          ? '⏳ Envoi en cours…'
          : platsChoisis.length === 0
          ? 'Sélectionnez au moins un plat'
          : `Commander (${platsChoisis.length} plat${platsChoisis.length > 1 ? 's' : ''})`}
      </button>
    </form>
  );
}
