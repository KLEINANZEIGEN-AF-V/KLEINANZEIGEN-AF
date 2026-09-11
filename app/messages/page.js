export default function Messages() {
  return (
    <main className="section">
      <div className="container">
        <h1>Mes messages</h1>

        <p className="muted">
          Retrouvez ici vos conversations avec l’administration
          de KLEINANZEIGEN-AF.
        </p>

        <div className="card">
          <h2>Aucune conversation</h2>

          <p className="muted">
            Vous n’avez pas encore de conversation.
            Vos échanges seront disponibles ici.
          </p>

          <button className="btn" type="button">
            Nouvelle conversation
          </button>
        </div>
      </div>
    </main>
  );
}
