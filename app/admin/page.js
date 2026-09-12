
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [message, setMessage] = useState("");

  async function addProduct(e) {
    e.preventDefault();
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      currency: "XOF",
      is_published: true,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    setMessage("✅ Produit ajouté avec succès !");
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
  }

  return (
    <main style={{ padding: "30px", maxWidth: "700px", margin: "auto" }}>
      <h1>⚙️ Administration</h1>
      <p>Ajouter un produit à la boutique.</p>

      <form onSubmit={addProduct}>
        <input
          placeholder="Nom du produit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: "12px", margin: "10px 0" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ display: "block", width: "100%", padding: "12px", margin: "10px 0" }}
        />

        <input
          type="number"
          placeholder="Prix en FCFA"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: "12px", margin: "10px 0" }}
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: "12px", margin: "10px 0" }}
        />

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Ajouter le produit
        </button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </main>
  );
  }
