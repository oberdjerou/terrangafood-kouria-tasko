// Mappe chaque statut de commande vers sa classe CSS dédiée (cf. globals.css)
const STATUT_CLASSES = {
  'en attente': 'badge-statut-attente',
  'confirmée': 'badge-statut-confirmee',
  'en livraison': 'badge-statut-livraison',
  'livrée': 'badge-statut-livree',
  'annulée': 'badge-statut-annulee'
};

export default function StatutBadge({ statut }) {
  const classeStatut = STATUT_CLASSES[statut] || 'badge-statut-attente';
  return <span className={`badge-statut ${classeStatut}`}>{statut}</span>;
}
