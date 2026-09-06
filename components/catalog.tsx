"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";
import { EmptyState, LoadingState, ProductMedia } from "./ui";
import type { Product, StoreProfile } from "@/lib/types";

const categories = ["All", "Meetha Paan", "Sada Paan", "Flavoured Paan", "Special Paan", "Custom Paan"];

function ProductCard({ product, store, onAdd }: { product: Product; store?: StoreProfile; onAdd: () => void }) {
  return <article className="product-card">
    <ProductMedia src={product.imageUrl} alt={product.name}/>
    <div className="product-body">
      <span className="eyebrow">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p>
      <small><Icon name="shop"/>{product.storeName}{store?.area ? " · " + store.area : ""}</small>
      <div className="product-meta"><span><Icon name="clock"/>{product.preparationMinutes ?? 15} min</span><span>{product.stock} available</span></div>
      <div className="product-action"><strong>₹{product.price.toLocaleString("en-IN")}</strong><button type="button" onClick={onAdd}>Add to cart</button></div>
    </div>
  </article>;
}

export function Catalog({ compact = false, initialTerm = "", initialStore = "" }: { compact?: boolean; initialTerm?: string; initialStore?: string }) {
  const { products, stores, catalogReady, addToCart } = useApp();
  const [term, setTerm] = useState(initialTerm);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("relevance");
  const [openOnly, setOpenOnly] = useState(false);
  const [message, setMessage] = useState("");
  const deferredTerm = useDeferredValue(term.trim().toLowerCase());
  const storesById = useMemo(() => new Map(stores.map((store) => [store.id, store])), [stores]);
  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const store = storesById.get(product.storeId);
      const haystack = [product.name, product.category, product.storeName, store?.area, store?.city].filter(Boolean).join(" ").toLowerCase();
      return (!deferredTerm || haystack.includes(deferredTerm)) && (category === "All" || product.category === category) && (!initialStore || product.storeId === initialStore) && (!openOnly || store?.isOpen !== false);
    });
    if (sort === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "prep") return [...filtered].sort((a, b) => (a.preparationMinutes ?? 15) - (b.preparationMinutes ?? 15));
    return filtered;
  }, [products, storesById, deferredTerm, category, initialStore, openOnly, sort]);
  const rendered = compact ? visible.slice(0, 4) : visible;

  if (!catalogReady) return <LoadingState label="Loading fresh items…"/>;
  if (!products.length) return <EmptyCatalog/>;

  return <section className={compact ? "catalog compact" : "catalog"}>
    {!compact ? <><div className="catalog-tools">
      <label className="search-field"><Icon name="search"/><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search paan, shop or area" aria-label="Search products"/></label>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="relevance">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="prep">Fastest preparation</option></select>
      <label className="switch-label"><input type="checkbox" checked={openOnly} onChange={(event) => setOpenOnly(event.target.checked)}/>Open shops only</label>
    </div><div className="category-chips" aria-label="Product categories">{categories.map((item) => <button type="button" className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="results-line"><span>{visible.length} item{visible.length === 1 ? "" : "s"}</span>{initialStore ? <Link href="/shop">View all shops</Link> : null}</div></> : null}
    {message ? <p className={message.includes("different shop") ? "inline-message error" : "inline-message"} role="status">{message}</p> : null}
    {rendered.length ? <div className="product-grid">{rendered.map((product) => <ProductCard key={product.id} product={product} store={storesById.get(product.storeId)} onAdd={() => { const error = addToCart(product); setMessage(error ?? product.name + " added to cart."); }}/>)}</div> : <EmptyState icon="search" title="No matching paan found" body="Try another product, shop, area, or category."/>}
  </section>;
}

export function EmptyCatalog() {
  return <EmptyState icon="shop" title="Products will appear here" body="Fresh items from local shops will be listed as soon as sellers publish them." action={<Link className="button button-outline" href="/sell"><Icon name="shop"/>Sell on MeraPaan</Link>}/>;
}
