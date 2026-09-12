"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

export default function Account() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user || null);

    if (user) {
      loadProfile(user.id);
    }
  };

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Connexion réussie !");
      setPassword("");
    }

    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    if (user && session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          role: "customer",
        });

      if (profileError) {
        setMessage(
          "Compte créé, mais erreur lors de la création du profil : " +
            profileError.message
        );
      } else {
        setMessage("Compte créé avec succès !");
        setUser(user);
        loadProfile(user.id);
      }
    } else {
      setMessage(
        "Compte créé. Vérifie ton e-mail pour confirmer ton inscription, puis connecte-toi."
      );
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setMessage("Vous êtes déconnecté.");
  };

  if (user) {
    return (
      <main className="section">
        <div className="container">
          <h1>Mon compte</h1>

          <div className="card">
            <h2>Bienvenue 👋</h2>

            <p>
              <strong>E-mail :</strong> {user.email}
            </p>

            {profile && (
              <>
                <p>
                  <strong>Nom :</strong>{" "}
                  {profile.full_name || "Non renseigné"}
                </p>

                <p>
                  <strong>Téléphone :</strong>{" "}
                  {profile.phone || "Non renseigné"}
                </p>
              </>
            )}

            {message && <p>{message}</p>}

            <button
              className="btn"
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <h1>Compte client</h1>

        <p className="muted">
          Inscription et connexion à votre compte.
        </p>

        <div className="grid">
          <div className="card">
            <h3>Connexion</h3>

            <form className="form" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                className="btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Créer un compte</h3>

            <form className="form" onSubmit={handleSignup}>
              <input
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                placeholder="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                className="btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>
          </div>
        </div>

        {message && (
          <p style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
