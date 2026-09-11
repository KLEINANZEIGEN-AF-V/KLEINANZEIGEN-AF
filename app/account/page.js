export default function Account() {
  return (
    <main className="section">
      <div className="container">
        <h1>Compte client</h1>

        <p className="muted">
          Inscription, connexion, profil, commandes et messages.
        </p>

        <div className="grid">
          <div className="card">
            <h3>Connexion</h3>

            <form className="form">
              <input
                type="email"
                placeholder="E-mail"
              />

              <input
                type="password"
                placeholder="Mot de passe"
              />

              <button className="btn" type="submit">
                Se connecter
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Créer un compte</h3>

            <form className="form">
              <input
                placeholder="Nom complet"
              />

              <input
                type="email"
                placeholder="E-mail"
              />

              <input
                placeholder="Téléphone"
              />

              <input
                type="password"
                placeholder="Mot de passe"
              />

              <button className="btn" type="submit">
                Créer mon compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
                  }
