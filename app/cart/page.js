"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [kkiapayReady, setKkiapayReady] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);

    setCart(newCart);

    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const payerAvecKkiapay = () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    if (!kkiapayReady || !window.openKkiapayWidget) {
      alert("Le paiement KKiaPay n'est pas encore prêt. Réessayez.");
      return;
    }

    window.openKkiapayWidget({
      amount: total,
      api_key: process.env.NEXT_PUBLIC_KKIAPAY_API_KEY,
      position: "center",
      theme: "#0095ff",
      sandbox: true,
      data: JSON.stringify({
        produits: cart.map((item) => ({
          name: item.name,
          price: item.price,
        })),
      }),
    });
  };

  return (
    <>
      <Script
        src="https://cdn.kkiapay.me/k.js"
        strategy="afterInteractive"
        onLoad={() => setKkiapayReady(true)}
      />

      <main
        style={{
          padding: "30px",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <h1>🛒 Mon panier</h1>

        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "15px",
                  marginBottom: "15px",
                }}
              >
                <h2>{item.name || "Article"}</h2>

                <p>{item.price || 0} FCFA</p>

                <button
                  onClick={() => removeItem(index)}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Supprimer
                </button>
              </div>
            ))}

            <h2>Total : {total} FCFA</h2>

            <button
              onClick={payerAvecKkiapay}
              disabled={!kkiapayReady}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: kkiapayReady ? "pointer" : "not-allowed",
                background: kkiapayReady ? "#0095ff" : "#aaa",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {kkiapayReady
                ? "💳 Passer la commande / Payer"
                : "Chargement du paiement..."}
            </button>
          </>
        )}
      </main>
    </>
  );
                  }
