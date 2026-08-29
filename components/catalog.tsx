"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";

export function Catalog({ compact = false, initialTerm = "" }: { compact?: boolean; initialTerm?: string }) {
  const { products, catalogReady, addToCart } = useApp();
  const [term, setTerm] = useState(initialTerm);
  const deferredTerm = useDeferredValue(term.trim().toLowerCase());
  const visible = products.filter((product) => !deferredTerm || `${product.name} ${product.category} ${product.storeName}`.toLowerCase().includes(deferredTerm));
  const [message, setMessage] = useState("");

  if (!catalogReady) return <div className="catalog-loading" aria-live="polite">Loading fresh items…</div>;
  if (!products.length) return <EmptyCatalog/>;

  return <section className={compact ? "catalog compact" : "catalog"}>
    {compact ? null : <div className="catalog-tools"><label><Icon name="search"/><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search paan items or shops"/></label><span>{visible.length} fresh item{visible.length === 1 ? "" : "s"}</span></div>}
    {message ? <p className="inline-message" role="status">{message}</p> : null}
    <div className="product-grid">{visible.map((product) => <article className="product-card" key={product.id}>
      <div className="product-image">{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"/> : <Icon name="leaf"/>}</div>
      <div className="product-body"><span>{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><small><Icon name="shop"/>{product.storeName} · {product.preparationMinutes ?? 15} min prep</small><div><strong>₹{product.price.toLocaleString("en-IN")}</strong><button onClick={() => { const error = addToCart(product); setMessage(error ?? `${product.name} added to cart.`); }}>Add to cart</button></div></div>
    </article>)}</div>
  </section>;
}

export function EmptyCatalog() {
  return <section className="empty-catalog"><span><Icon name="shop"/></span><h2>Products will appear here</h2><p>Fresh items from trusted local shops will be listed once approved sellers publish their products.</p><Link className="button button-outline" href="/sell"><Icon name="shop"/>Become a seller</Link></section>;
}
