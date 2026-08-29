"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";

const slots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
const localDate = (offset: number) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toLocaleDateString("en-CA"); };

export default function CheckoutPage() {
  const { user, authReady, cart, cartTotal, placeOrder } = useApp();
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState(localDate(0));
  const [pickupTime, setPickupTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay-at-shop" | "upi">("pay-at-shop");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dates = useMemo(() => [0, 1, 2].map((offset) => { const value = localDate(offset); return { value, label: new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) }; }), []);

  if (authReady && !user) return <div className="page container"><section className="simple-empty"><Icon name="user"/><h1>Sign in to schedule pickup</h1><p>Your account keeps the shop updated and stores your pickup order.</p><Link className="button button-accent" href="/login?next=/checkout">Sign in</Link></section></div>;
  if (!cart.length) return <div className="page container"><section className="simple-empty"><Icon name="cart"/><h1>Your cart is empty</h1><Link className="button button-accent" href="/shop">Browse items</Link></section></div>;

  async function submit() {
    if (!pickupTime) { setError("Choose a pickup time."); return; }
    setBusy(true); setError("");
    try { const id = await placeOrder({ pickupDate, pickupTime, paymentMethod }); router.push(`/orders?placed=${id}`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not place the order."); setBusy(false); }
  }

  return <div className="page container"><header className="page-heading"><h1>Schedule your pickup</h1><p>Your order will be prepared close to the time you choose.</p></header><div className="checkout-layout"><section className="checkout-main">
    <div className="panel"><div className="panel-title"><b>1</b><div><span>PICKUP DAY</span><h2>When will you come?</h2></div></div><div className="date-options">{dates.map((date) => <button className={pickupDate === date.value ? "active" : ""} onClick={() => setPickupDate(date.value)} key={date.value}><Icon name="calendar"/>{date.label}</button>)}</div></div>
    <div className="panel"><div className="panel-title"><b>2</b><div><span>PICKUP TIME</span><h2>Choose a time slot</h2></div></div><div className="slot-options">{slots.map((slot) => <button className={pickupTime === slot ? "active" : ""} onClick={() => setPickupTime(slot)} key={slot}>{slot}</button>)}</div><p className="fresh-note"><Icon name="leaf"/>The shop prepares perishable items close to your selected slot.</p></div>
    <div className="panel"><div className="panel-title"><b>3</b><div><span>PAYMENT</span><h2>How would you like to pay?</h2></div></div><div className="payment-options"><button className={paymentMethod === "pay-at-shop" ? "active" : ""} onClick={() => setPaymentMethod("pay-at-shop")}>Pay at shop</button><button className={paymentMethod === "upi" ? "active" : ""} onClick={() => setPaymentMethod("upi")}>UPI at pickup</button></div></div>
  </section><aside className="summary"><span>PICKUP FROM</span><h2>{cart[0].product.storeName}</h2><p className="pickup-only"><Icon name="shop"/>Pickup only</p><dl><div><dt>{cart.reduce((sum, line) => sum + line.quantity, 0)} items</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div><div className="total"><dt>Total</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div></dl>{pickupTime ? <p className="selected-time"><Icon name="calendar"/>{new Date(`${pickupDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {pickupTime}</p> : null}{error ? <p className="form-error">{error}</p> : null}<button className="button button-accent full" disabled={busy} onClick={submit}>{busy ? "Placing order…" : "Place pickup order"}<Icon name="arrow"/></button></aside></div></div>;
}
