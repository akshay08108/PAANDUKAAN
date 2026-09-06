"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { EmptyState, LoadingState, PaymentBadge, StatusBadge } from "@/components/ui";

const progress = ["Order placed", "Confirmed", "Preparing", "Ready for pickup", "Collected"];

function OrdersContent() {
  const { user, authReady, orders } = useApp();
  const placed = useSearchParams().get("placed");
  if (authReady && !user) return <EmptyState icon="user" title="Sign in to view orders" href="/login?next=/orders" action="Sign in"/>;
  if (!orders.length) return <EmptyState icon="calendar" title="No pickup orders yet" body="Your scheduled orders will appear here." href="/shop" action="Browse items"/>;
  return <>{placed ? <div className="success-banner"><Icon name="check"/><div><b>Pickup order placed</b><span>The seller has your request. Watch this page for confirmation.</span></div></div> : null}<div className="order-list">{orders.map((order) => {
    const current = progress.indexOf(order.stage);
    const stopped = order.stage === "Cancelled" || order.stage === "Rejected";
    return <article key={order.id} className="order-card"><header><div><span>ORDER #{order.id.slice(0, 8).toUpperCase()}</span><h2>{order.storeName}</h2></div><div className="badge-row"><StatusBadge stage={order.stage}/><PaymentBadge status={order.paymentStatus}/></div></header><div className="order-meta"><span><Icon name="calendar"/>{new Date(`${order.pickupDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {order.pickupTime}</span><span><Icon name="shop"/>Pickup only</span><span><Icon name="wallet"/>{order.paymentMethod === "upi" ? "Direct seller UPI" : "Pay at pickup"}</span></div>{!stopped ? <div className="order-progress" aria-label={"Order status: " + order.stage}>{progress.map((stage, index) => <span className={index <= current ? "done" : ""} key={stage}><i>{index < current ? <Icon name="check"/> : index + 1}</i><small>{stage}</small></span>)}</div> : <p className="order-stopped"><Icon name="alert"/>This order was {order.stage.toLowerCase()}. Contact the shop if you need help.</p>}<div className="order-items">{order.items?.map((line) => <span key={line.product.id}>{line.quantity} × {line.product.name}<b>₹{(line.product.price * line.quantity).toLocaleString("en-IN")}</b></span>)}</div><footer><span>{order.items?.reduce((sum, line) => sum + line.quantity, 0) ?? 0} items</span><strong>Total ₹{Number(order.total).toLocaleString("en-IN")}</strong></footer></article>;
  })}</div></>;
}

export default function OrdersPage() {
  return <div className="page container"><header className="page-heading"><span className="eyebrow">MY ORDERS</span><h1>Your pickup timeline</h1><p>Track preparation and know exactly when your order is ready.</p></header><Suspense fallback={<LoadingState label="Loading orders…"/>}><OrdersContent/></Suspense></div>;
}
