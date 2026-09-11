
"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);

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

  return (
    <main style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
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
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Passer la commande
          </button>
        </>
      )}
    </main>
  );
                }
