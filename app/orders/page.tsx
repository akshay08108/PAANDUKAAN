"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { EmptyState, LoadingState, PaymentBadge, StatusBadge } from "@/components/ui";
import type { PickupOrder } from "@/lib/types";

const progress = ["Order placed", "Confirmed", "Preparing", "Ready for pickup", "Collected"];

function OrdersContent() {
  const { user, authReady, orders, alertsEnabled, enableAlerts } = useApp();
  const placed = useSearchParams().get("placed");
  if (authReady && !user) return <EmptyState icon="user" title="Sign in to view orders" href="/login?next=/orders" action="Sign in"/>;
  if (!orders.length) return <EmptyState icon="calendar" title="No pickup orders yet" body="Your scheduled orders will appear here." href="/shop" action="Browse items"/>;
  return <>{placed ? <div className="success-banner"><Icon name="check"/><div><b>Pickup order placed</b><span>The seller has your request. Watch this page for confirmation.</span></div></div> : null}<div className="customer-alert-control"><div><Icon name="volume"/><span><b>Order status sounds</b>Hear an alert when a seller accepts your order.</span></div><button type="button" className={alertsEnabled ? "button button-outline" : "button button-primary"} onClick={enableAlerts}>{alertsEnabled ? "Alerts enabled" : "Enable alerts"}</button></div><div className="order-list">{orders.map((order) => {
    const current = progress.indexOf(order.stage);
    const stopped = order.stage === "Cancelled" || order.stage === "Rejected";
    return <article key={order.id} className="order-card"><header><div><span>ORDER #{order.id.slice(0, 8).toUpperCase()}</span><h2>{order.storeName}</h2></div><div className="badge-row"><StatusBadge stage={order.stage}/><PaymentBadge status={order.paymentStatus}/></div></header><div className="order-meta"><span><Icon name="calendar"/>{new Date(`${order.pickupDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {order.pickupTime}</span><span><Icon name="shop"/>Pickup only</span><span><Icon name="wallet"/>{order.paymentMethod === "upi" ? "Direct seller UPI" : "Pay at pickup"}</span></div>{!stopped ? <div className="order-progress" aria-label={"Order status: " + order.stage}>{progress.map((stage, index) => <span className={index <= current ? "done" : ""} key={stage}><i>{index < current ? <Icon name="check"/> : index + 1}</i><small>{stage}</small></span>)}</div> : <p className="order-stopped"><Icon name="alert"/>This order was {order.stage.toLowerCase()}. Contact the shop if you need help.</p>}<div className="order-items">{order.items?.map((line) => <span key={line.product.id}>{line.quantity} × {line.product.name}<b>₹{(line.product.price * line.quantity).toLocaleString("en-IN")}</b></span>)}</div><footer><span>{order.items?.reduce((sum, line) => sum + line.quantity, 0) ?? 0} items</span><strong>Total ₹{Number(order.total).toLocaleString("en-IN")}</strong></footer><CustomerOrderActions order={order}/></article>;
  })}</div></>;
}

function CustomerOrderActions({ order }: { order: PickupOrder }) {
  const { tickets, reviews, createTicket, createReview } = useApp();
  const [mode, setMode] = useState<"ticket" | "review" | null>(null);
  const [issue, setIssue] = useState("Order question");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState("");
  const hasOpenTicket = tickets.some((ticket) => ticket.orderId === order.id && ticket.status === "Open");
  const hasReview = reviews.some((review) => review.orderId === order.id);
  async function submitTicket(event: React.FormEvent) {
    event.preventDefault();
    try { await createTicket(order, issue, message); setFeedback("Support ticket sent to the shop."); setMode(null); }
    catch (reason) { setFeedback(reason instanceof Error ? reason.message : "Could not create ticket."); }
  }
  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    try { await createReview(order, stars, message); setFeedback("Thank you for reviewing this shop."); setMode(null); }
    catch (reason) { setFeedback(reason instanceof Error ? reason.message : "Could not add review."); }
  }
  return <div className="customer-order-actions"><div><button type="button" className="text-button" disabled={hasOpenTicket} onClick={() => { setMode("ticket"); setMessage(""); setFeedback(""); }}><Icon name="ticket"/>{hasOpenTicket ? "Ticket open" : "Get order help"}</button>{order.stage === "Collected" ? <button type="button" className="text-button" disabled={hasReview} onClick={() => { setMode("review"); setMessage(""); setFeedback(""); }}><Icon name="star"/>{hasReview ? "Reviewed" : "Review shop"}</button> : null}</div>{feedback ? <p className="form-message">{feedback}</p> : null}{mode === "ticket" ? <form onSubmit={submitTicket}><label>Issue<select value={issue} onChange={(event) => setIssue(event.target.value)}><option>Order question</option><option>Pickup time change</option><option>Payment issue</option><option>Item issue</option></select></label><label>Message<textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell the shop how they can help"/></label><div><button type="button" className="button button-outline" onClick={() => setMode(null)}>Cancel</button><button className="button button-primary">Send ticket</button></div></form> : null}{mode === "review" ? <form onSubmit={submitReview}><label>Rating<select value={stars} onChange={(event) => setStars(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option value={value} key={value}>{value} stars</option>)}</select></label><label>Review<textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="How was your order?"/></label><div><button type="button" className="button button-outline" onClick={() => setMode(null)}>Cancel</button><button className="button button-primary">Submit review</button></div></form> : null}</div>;
}

export default function OrdersPage() {
  return <div className="page container"><header className="page-heading"><span className="eyebrow">MY ORDERS</span><h1>Your pickup timeline</h1><p>Track preparation and know exactly when your order is ready.</p></header><Suspense fallback={<LoadingState label="Loading orders…"/>}><OrdersContent/></Suspense></div>;
}
