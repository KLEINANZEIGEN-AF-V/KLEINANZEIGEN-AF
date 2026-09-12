"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <h1>Boutique</h1>
          <p>Chargement des produits...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <h1>Boutique</h1>

        <p className="muted">
          Découvrez nos produits disponibles.
        </p>

        {error && (
          <div className="card">
            <p>Erreur : {error}</p>
          </div>
        )}

        {!error && products.length === 0 && (
          <div className="card">
            <h2>Aucun produit disponible pour le moment.</h2>
            <p className="muted">
              Les produits ajoutés par l'administration apparaîtront ici.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{ padding: "20px" }}
              >
                <h2>{product.name}</h2>

                <p className="muted">
                  {product.description}
                </p>

                <h3>
                  {Number(product.price || 0).toLocaleString("fr-FR")} FCFA
                </h3>

                <p>
                  Stock : {product.stock ?? 0}
                </p>

                <button
                  onClick={() => {
                    const cart =
                      JSON.parse(localStorage.getItem("cart") || "[]");

                    cart.push(product);

                    localStorage.setItem(
                      "cart",
                      JSON.stringify(cart)
                    );

                    alert("Produit ajouté au panier !");
                  }}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
      }
