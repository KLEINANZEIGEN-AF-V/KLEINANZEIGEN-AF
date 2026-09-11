import Link from "next/link";

export default function Home() {
  return <>
    <nav className="nav"><div className="container navin">
      <Link className="logo" href="/">KLEINANZEIGEN-AF</Link>
      <div className="links">
        <Link href="/shop">Boutique</Link><Link href="/messages">Messages</Link>
        <Link href="/account">Compte</Link><Link className="btn" href="/admin">Administration</Link>
      </div>
    </div></nav>
    <main>
      <section className="hero"><div className="container">
        <h1>Bienvenue sur KLEINANZEIGEN-AF</h1>
        <p>Découvrez nos produits et trouvez facilement ce que vous recherchez.</p>
        <Link className="btn" href="/shop">Découvrir la boutique</Link>
      </div></section>
      <section className="section"><div className="container">
        <h2>Comment ça marche ?</h2>
        <div className="grid">
          <div className="card"><h3>1. Recherchez</h3><p className="muted">Trouvez facilement vos produits.</p></div>
          <div className="card"><h3>2. Commandez</h3><p className="muted">Ajoutez vos articles au panier.</p></div>
          <div className="card"><h3>3. Payez</h3><p className="muted">Payez en ligne avec KKiaPay.</p></div>
          <div className="card"><h3>4. Échangez</h3><p className="muted">Communiquez directement avec le vendeur.</p></div>
        </div>
      </div></section>
    </main>
    <footer className="footer"><div className="container">© 2026 KLEINANZEIGEN-AF — Afrique & Europe</div></footer>
  </>
}
