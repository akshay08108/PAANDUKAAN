"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";

export default function SellPage() {
  const { user, authReady, products, publishProduct } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Paan");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [preparationMinutes, setPreparationMinutes] = useState("15");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const sellerProducts = user ? products.filter((product) => product.storeId === user.id) : [];

  if (authReady && !user) return <div className="page container"><section className="seller-invite"><div><h1>Bring your paan shop online</h1><p>Publish only your real inventory, accept scheduled pickup orders, and prepare each item close to collection time.</p><Link className="button button-accent" href="/login?next=/sell">Create seller account <Icon name="arrow"/></Link></div><span><Icon name="shop"/></span></section></div>;
  if (user && !user.roles.includes("seller")) return <div className="page container"><section className="simple-empty"><Icon name="shop"/><h1>Seller account required</h1><p>Register with the seller role to publish products.</p><button className="button button-outline" disabled>Current account: customer</button></section></div>;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await publishProduct({ name, category, description, price: Number(price), stock: Number(stock), preparationMinutes: Number(preparationMinutes), imageUrl: imageUrl || undefined });
      setName(""); setDescription(""); setPrice(""); setStock(""); setImageUrl(""); setMessage("Product published to the live catalog.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not publish product."); }
    setBusy(false);
  }

  return <div className="page container"><header className="page-heading"><h1>{user?.storeName ?? "Seller studio"}</h1><p>Publish real products and keep preparation times accurate for pickup customers.</p></header><div className="seller-layout"><section className="panel"><div className="panel-title"><b><Icon name="plus"/></b><div><span>REAL INVENTORY ONLY</span><h2>Add a product</h2></div></div><form className="form two-column" onSubmit={submit}><label>Product name<input required value={name} onChange={(event) => setName(event.target.value)}/></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Paan</option><option>Meetha Paan</option><option>Saada Paan</option><option>Mouth Freshener</option><option>Shop Special</option></select></label><label className="wide">Description<textarea required rows={4} value={description} onChange={(event) => setDescription(event.target.value)}/></label><label>Price (₹)<input required min="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)}/></label><label>Available quantity<input required min="1" type="number" value={stock} onChange={(event) => setStock(event.target.value)}/></label><label>Preparation time (minutes)<input required min="1" type="number" value={preparationMinutes} onChange={(event) => setPreparationMinutes(event.target.value)}/></label><label>Image URL (optional)<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…"/></label>{message ? <p className="form-message wide">{message}</p> : null}<button className="button button-accent wide" disabled={busy}>{busy ? "Publishing…" : "Publish product"}<Icon name="arrow"/></button></form></section><aside className="seller-list"><h2>Published products</h2>{sellerProducts.length ? sellerProducts.map((product) => <article key={product.id}><span><Icon name="leaf"/></span><div><b>{product.name}</b><small>{product.stock} available · {product.preparationMinutes} min</small></div><strong>₹{product.price}</strong></article>) : <div className="mini-empty"><Icon name="leaf"/><p>No products published yet.</p></div>}</aside></div></div>;
}
