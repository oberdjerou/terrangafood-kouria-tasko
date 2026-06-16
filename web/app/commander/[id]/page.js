import Link from 'next/link';
import CommandeForm from '../../../components/CommandeForm';
import { getRestaurant, getPlatsByRestaurant } from '../../../lib/api';

export default async function CommanderPage({ params }) {
  const { id } = params;
  let restaurant = null;
  let plats = [];
  let error = null;

  try {
    restaurant = await getRestaurant(id);
    plats = await getPlatsByRestaurant(id);
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="commander-page">
        <Link href={`/restaurants/${id}`} className="back-link">← Retour au restaurant</Link>
        <div className="error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="commander-page">
        <Link href="/" className="back-link">← Retour aux restaurants</Link>
        <div className="error">
          <p>Restaurant non trouvé.</p>
        </div>
      </div>
    );
  }

  const platsDisponibles = plats.filter((p) => p.disponible !== false);

  return (
    <div className="commander-page">
      <Link href={`/restaurants/${id}`} className="back-link">← Retour au restaurant</Link>

      <div className="commander-header">
        <h1>Commander chez {restaurant.nom}</h1>
        <p>{restaurant.cuisine} · 📍 {restaurant.adresse}</p>
      </div>

      {platsDisponibles.length === 0 ? (
        <div className="loading">
          <p>Aucun plat disponible pour ce restaurant.</p>
        </div>
      ) : (
        <CommandeForm restaurant={restaurant} plats={platsDisponibles} />
      )}
    </div>
  );
}
