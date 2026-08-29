"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";

function OrdersContent() {
  const { user, authReady, orders } = useApp();
  const placed = useSearchParams().get("placed");
  if (authReady && !user) return <section className="simple-empty"><Icon name="user"/><h1>Sign in to view orders</h1><Link className="button button-accent" href="/login?next=/orders">Sign in</Link></section>;
  if (!orders.length) return <section className="simple-empty"><Icon name="calendar"/><h1>No pickup orders yet</h1><p>Your scheduled orders will appear here.</p><Link className="button button-accent" href="/shop">Browse items</Link></section>;
  return <>{placed ? <div className="success-banner"><Icon name="check"/><div><b>Pickup order placed</b><span>The shop can now prepare for your selected time.</span></div></div> : null}<div className="order-list">{orders.map((order) => <article key={order.id}><header><div><span>{order.id.slice(0, 8).toUpperCase()}</span><h2>{order.storeName}</h2></div><b>{order.stage}</b></header><div className="order-meta"><span><Icon name="calendar"/>{new Date(`${order.pickupDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {order.pickupTime}</span><span><Icon name="shop"/>Pickup only</span></div><footer><span>{order.items?.reduce((sum, line) => sum + line.quantity, 0) ?? 0} items</span><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></footer></article>)}</div></>;
}

export default function OrdersPage() {
  return <div className="page container"><header className="page-heading"><h1>My pickup orders</h1><p>Track preparation and know when your order is ready to collect.</p></header><Suspense fallback={<div className="catalog-loading">Loading orders…</div>}><OrdersContent/></Suspense></div>;
}
