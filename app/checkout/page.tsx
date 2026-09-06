"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { EmptyState, ProductMedia } from "@/components/ui";
import type { PaymentMethod } from "@/lib/types";

const slots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
const localDate = (offset: number) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toLocaleDateString("en-CA"); };

export default function CheckoutPage() {
  const { user, authReady, cart, cartTotal, stores, placeOrder } = useApp();
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState(localDate(0));
  const [pickupTime, setPickupTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay-at-shop");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dates = useMemo(() => [0, 1, 2].map((offset) => { const value = localDate(offset); return { value, label: new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) }; }), []);
  const store = stores.find((item) => item.id === cart[0]?.product.storeId);
  const hasSellerUpi = Boolean(store?.upiId || store?.upiQrImageUrl);

  if (authReady && !user) return <div className="page container"><EmptyState icon="user" title="Sign in to schedule pickup" body="Your account keeps the shop updated and stores your pickup order." href="/login?next=/checkout" action="Sign in"/></div>;
  if (!cart.length) return <div className="page container"><EmptyState icon="cart" title="Your cart is empty" href="/shop" action="Browse items"/></div>;

  async function submit() {
    if (!pickupTime) { setError("Choose a pickup time."); return; }
    setBusy(true); setError("");
    try { const id = await placeOrder({ pickupDate, pickupTime, paymentMethod }); router.push(`/orders?placed=${id}`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not place the order."); setBusy(false); }
  }

  return <div className="page container checkout-page"><header className="page-heading"><span className="eyebrow">CHECKOUT</span><h1>Schedule your pickup</h1><p>Your order will be prepared close to the time you choose.</p></header><div className="checkout-layout"><section className="checkout-main">
    <div className="panel"><div className="panel-title"><b>1</b><div><span>PICKUP DAY</span><h2>When will you come?</h2></div></div><div className="date-options">{dates.map((date) => <button type="button" className={pickupDate === date.value ? "active" : ""} onClick={() => setPickupDate(date.value)} key={date.value}><Icon name="calendar"/>{date.label}</button>)}</div></div>
    <div className="panel"><div className="panel-title"><b>2</b><div><span>PICKUP TIME</span><h2>Choose a time slot</h2></div></div><div className="slot-options">{slots.map((slot) => <button type="button" className={pickupTime === slot ? "active" : ""} onClick={() => setPickupTime(slot)} key={slot}>{slot}</button>)}</div><p className="fresh-note"><Icon name="leaf"/>Perishable items are prepared close to your selected slot.</p></div>
    <div className="panel"><div className="panel-title"><b>3</b><div><span>PAYMENT</span><h2>Pay the seller directly</h2></div></div><div className="payment-options"><button type="button" className={paymentMethod === "pay-at-shop" ? "active" : ""} onClick={() => setPaymentMethod("pay-at-shop")}><Icon name="wallet"/><span><b>Pay at pickup</b>Cash or seller-approved method</span></button><button type="button" disabled={!hasSellerUpi} className={paymentMethod === "upi" ? "active" : ""} onClick={() => setPaymentMethod("upi")}><Icon name="rupee"/><span><b>Direct seller UPI</b>{hasSellerUpi ? "Payment remains pending until seller confirms" : "Seller has not added UPI yet"}</span></button></div>{paymentMethod === "upi" ? <div className="upi-box"><b>Pay directly to {store?.name || cart[0].product.storeName}</b>{store?.upiQrImageUrl ? <ProductMedia src={store.upiQrImageUrl} alt={"UPI QR for " + store.name} className="upi-qr"/> : null}{store?.upiId ? <code>{store.upiId}</code> : null}<p>Placing this order does not mark it paid. The seller verifies the payment separately.</p></div> : <p className="payment-note">MeraPaan does not collect or hold your money.</p>}</div>
  </section><aside className="summary checkout-summary"><span className="eyebrow">PICKUP FROM</span><h2>{store?.name || cart[0].product.storeName}</h2>{store?.area || store?.address ? <p className="store-address"><Icon name="pin"/>{[store.area, store.address].filter(Boolean).join(", ")}</p> : null}<p className="pickup-only"><Icon name="shop"/>Pickup only</p><div className="checkout-items">{cart.map(({ product, quantity }) => <div key={product.id}><ProductMedia src={product.imageUrl} alt={product.name}/><span><b>{quantity} × {product.name}</b><small>₹{(product.price * quantity).toLocaleString("en-IN")}</small></span></div>)}</div><dl><div><dt>Subtotal</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div><div className="total"><dt>Total</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div></dl>{pickupTime ? <p className="selected-time"><Icon name="calendar"/>{new Date(`${pickupDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {pickupTime}</p> : null}{error ? <p className="form-error">{error}</p> : null}<button type="button" className="button button-primary full" disabled={busy} onClick={submit}>{busy ? "Placing order…" : "Place pickup order"}<Icon name="arrow"/></button><small className="terms-note">By placing your order, you request preparation for the selected pickup time.</small></aside></div></div>;
}
