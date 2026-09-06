"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";
import { EmptyState, LoadingState, ProductMedia } from "./ui";
import type { StoreProfile } from "@/lib/types";

export function StoreDirectory({ limit }: { limit?: number }) {
  const { stores, products, catalogReady } = useApp();
  const listings = useMemo(() => {
    const known = new Map(stores.map((store) => [store.id, store]));
    for (const product of products) if (!known.has(product.storeId)) known.set(product.storeId, { id: product.storeId, ownerId: product.storeId, name: product.storeName, city: "Hyderabad", isOpen: true } as StoreProfile);
    return Array.from(known.values()).map((store) => ({ store, products: products.filter((product) => product.storeId === store.id) })).filter((entry) => entry.products.length > 0 || stores.some((store) => store.id === entry.store.id));
  }, [stores, products]);

  if (!catalogReady) return <LoadingState label="Finding shops near you…"/>;
  if (!listings.length) return <EmptyState icon="shop" title="No shops listed yet" body="Verified Hyderabad paan shops will appear here when they open their MeraPaan storefront."/>;

  return <div className="store-grid">{listings.slice(0, limit).map(({ store, products: storeProducts }) => {
    const fastest = storeProducts.length ? Math.min(...storeProducts.map((product) => product.preparationMinutes ?? 15)) : null;
    return <Link href={"/shop?store=" + encodeURIComponent(store.id)} className="store-card" key={store.id}>
      <ProductMedia src={store.imageUrl || storeProducts.find((product) => product.imageUrl)?.imageUrl} alt={store.name}/>
      <div><span className={store.isOpen === false ? "shop-state closed" : "shop-state"}>{store.isOpen === false ? "Closed" : "Open"}</span><h3>{store.name}</h3><p><Icon name="pin"/>{store.area || store.city || "Hyderabad"}</p><small>{storeProducts.length} item{storeProducts.length === 1 ? "" : "s"}{fastest ? " · from " + fastest + " min" : ""}</small></div>
    </Link>;
  })}</div>;
}
