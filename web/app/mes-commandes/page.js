import Link from 'next/link';
import StatutBadge from '../../components/StatutBadge';
import { getCommandes } from '../../lib/api';

export default async function MesCommandesPage() {
  let commandes = [];
  let error = null;

  try {
    commandes = await getCommandes();
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="mes-commandes-page">
        <Link href="/" className="back-link">← Retour aux restaurants</Link>
        <h1>Mes commandes</h1>
        <div className="error">
          <p>⚠️ {error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px', color: '#6B7280' }}>
            Vérifiez que l&apos;API est lancée sur le port 3001.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mes-commandes-page">
      <Link href="/" className="back-link">← Retour aux restaurants</Link>
      <h1>Mes commandes ({commandes.length})</h1>

      {commandes.length === 0 ? (
        <div className="mes-commandes-empty">
          <p>Aucune commande pour le moment.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Parcourez les <Link href="/">restaurants</Link> pour passer votre première commande.
          </p>
        </div>
      ) : (
        <div className="commandes-list">
          {commandes.map((commande) => (
            <article key={commande._id} className="commande-card">
              <header className="commande-card-header">
                <div>
                  <h3>{commande.restaurant?.nom || 'Restaurant inconnu'}</h3>
                  <p className="commande-card-date">
                    {new Date(commande.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <StatutBadge statut={commande.statut} />
              </header>

              <div className="commande-card-body">
                <div><strong>Client :</strong> {commande.client}</div>
                <div><strong>Téléphone :</strong> {commande.telephone}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Livraison :</strong> {commande.adresseLivraison}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Plats :</strong> {commande.plats?.length || 0}{' '}
                  ({(commande.plats || []).map((p) => p.nom).filter(Boolean).join(', ') || '—'})
                </div>
              </div>

              {commande.commentaire && (
                <p className="commande-card-commentaire">💬 {commande.commentaire}</p>
              )}

              <footer className="commande-card-footer">
                <span className="commande-card-montant">
                  {commande.montantTotal.toLocaleString('fr-SN')} FCFA
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  #{commande._id.slice(-6)}
                </span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
