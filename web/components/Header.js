import Link from 'next/link';

// [DF - Kouria Tasko] Barre de navigation partagée — affichée via app/layout.js
// sur toutes les pages du site. Logo cliquable + lien vers la liste des restos.
export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="header-logo">
          🍛 Terranga<span>Food</span>
        </Link>
        <nav className="header-nav">
          <Link href="/">Restaurants</Link>
          <Link href="/mes-commandes">Mes commandes</Link>
          <Link href="/">À propos</Link>
        </nav>
        <span className="header-team" style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.8 }}>
          Équipe Kouria Tasko
        </span>
      </div>
    </header>
  );
}
