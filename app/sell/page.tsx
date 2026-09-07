"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { EmptyState, LoadingState, PaymentBadge, ProductMedia, StatusBadge } from "@/components/ui";
import type { OrderStage, Product, ProductInput, StoreInput, StoreProfile } from "@/lib/types";

type Tab = "overview" | "orders" | "products" | "store" | "payments";
const categories = ["Meetha Paan", "Sada Paan", "Flavoured Paan", "Special Paan", "Custom Paan"];
const nextStages: Partial<Record<OrderStage, OrderStage[]>> = {
  "Order placed": ["Confirmed", "Rejected"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Ready for pickup", "Cancelled"],
  "Ready for pickup": ["Collected"],
};
const emptyProduct: ProductInput = { name: "", category: "Meetha Paan", description: "", price: 0, stock: 0, preparationMinutes: 15, imageUrl: "" };
const emptyStore: StoreInput = { name: "", description: "", address: "", area: "", city: "Hyderabad", openingTime: "09:00", closingTime: "22:00", isOpen: true, contactNumber: "", imageUrl: "", upiId: "", upiQrImageUrl: "" };
const storeToInput = (store: StoreProfile): StoreInput => ({ name: store.name, description: store.description ?? "", address: store.address ?? "", area: store.area ?? "", city: store.city, openingTime: store.openingTime ?? "09:00", closingTime: store.closingTime ?? "22:00", isOpen: store.isOpen, contactNumber: store.contactNumber ?? "", imageUrl: store.imageUrl ?? "", upiId: store.upiId ?? "", upiQrImageUrl: store.upiQrImageUrl ?? "" });

function ProductEditor({ product, onClose }: { product?: Product; onClose?: () => void }) {
  const { publishProduct, updateProduct } = useApp();
  const [form, setForm] = useState<ProductInput>(product ? { name: product.name, category: product.category, description: product.description, price: product.price, stock: product.stock, preparationMinutes: product.preparationMinutes ?? 15, imageUrl: product.imageUrl ?? "" } : emptyProduct);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const update = (field: keyof ProductInput, value: string | number) => setForm((current) => ({ ...current, [field]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const clean = { ...form, name: form.name.trim(), description: form.description.trim(), imageUrl: form.imageUrl?.trim() || undefined };
      if (product) await updateProduct(product.id, clean); else await publishProduct(clean);
      setMessage(product ? "Product updated." : "Product published to the live catalog.");
      if (!product) setForm(emptyProduct);
      if (product && onClose) window.setTimeout(onClose, 500);
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save product."); }
    setBusy(false);
  }
  return <form className="form two-column product-form" onSubmit={submit}><label>Product name<input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Sweet Paan"/></label><label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="wide">Description<textarea required rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Ingredients, flavour and what makes it special"/></label><label>Price (₹)<input required min="1" type="number" value={form.price || ""} onChange={(event) => update("price", Number(event.target.value))}/></label><label>Available quantity<input required min="0" type="number" value={form.stock} onChange={(event) => update("stock", Number(event.target.value))}/></label><label>Preparation time (minutes)<input required min="1" type="number" value={form.preparationMinutes} onChange={(event) => update("preparationMinutes", Number(event.target.value))}/></label><label>Image URL (optional)<input type="url" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://…"/></label>{message ? <p className="form-message wide" role="status">{message}</p> : null}<div className="form-actions wide">{onClose ? <button type="button" className="button button-outline" onClick={onClose}>Cancel</button> : null}<button className="button button-primary" disabled={busy}>{busy ? "Saving…" : product ? "Save changes" : "Publish product"}<Icon name="arrow"/></button></div></form>;
}

function SellerOrders() {
  const { orders, updateOrderStage, updatePaymentStatus } = useApp();
  const [message, setMessage] = useState("");
  if (!orders.length) return <EmptyState icon="orders" title="No pickup orders yet" body="New customer orders will appear here with their requested pickup time."/>;
  async function move(id: string, stage: OrderStage) { try { await updateOrderStage(id, stage); setMessage("Order moved to “" + stage + "”."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not update order."); } }
  return <div className="seller-orders">{message ? <p className="form-message" role="status">{message}</p> : null}{orders.map((order) => <article key={order.id}><header><div><span>#{order.id.slice(0, 8).toUpperCase()}</span><h3>{order.customerName}</h3><p>{order.customerMobile || "No mobile provided"}</p></div><div className="badge-row"><StatusBadge stage={order.stage}/><PaymentBadge status={order.paymentStatus}/></div></header><div className="seller-order-slot"><Icon name="calendar"/><span><b>{new Date(order.pickupDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</b>{order.pickupTime}</span></div><div className="seller-order-items">{order.items.map((line) => <span key={line.product.id}>{line.quantity} × {line.product.name}<b>₹{(line.product.price * line.quantity).toLocaleString("en-IN")}</b></span>)}</div><footer><strong>Total ₹{order.total.toLocaleString("en-IN")}</strong><div>{order.paymentMethod === "upi" && order.paymentStatus !== "PAID" ? <button type="button" className="button button-outline compact-button" onClick={() => updatePaymentStatus(order.id, "PAID")}>Confirm UPI received</button> : null}{(nextStages[order.stage] || []).map((stage) => <button type="button" key={stage} className={stage === "Rejected" || stage === "Cancelled" ? "text-button danger-text" : "button button-primary compact-button"} onClick={() => move(order.id, stage)}>{stage === "Confirmed" ? "Accept order" : stage}</button>)}</div></footer></article>)}</div>;
}

function StoreEditor() {
  const { user, stores, saveStore } = useApp();
  const store = stores.find((item) => item.id === user?.id);
  const [form, setForm] = useState<StoreInput>(() => store ? storeToInput(store) : { ...emptyStore, name: user?.storeName || user?.name || "", contactNumber: user?.mobile || "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (field: keyof StoreInput, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); try { await saveStore(form); setMessage("Store details saved."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save store."); } setBusy(false); }
  return <form className="form two-column store-form" onSubmit={submit}><label>Shop name<input required value={form.name} onChange={(event) => update("name", event.target.value)}/></label><label>Contact number<input required value={form.contactNumber} onChange={(event) => update("contactNumber", event.target.value)} inputMode="tel"/></label><label>Area<input required value={form.area} onChange={(event) => update("area", event.target.value)} placeholder="e.g. Charminar"/></label><label>City<input required value={form.city} onChange={(event) => update("city", event.target.value)}/></label><label className="wide">Pickup address<textarea required rows={3} value={form.address} onChange={(event) => update("address", event.target.value)}/></label><label>Opening time<input type="time" required value={form.openingTime} onChange={(event) => update("openingTime", event.target.value)}/></label><label>Closing time<input type="time" required value={form.closingTime} onChange={(event) => update("closingTime", event.target.value)}/></label><label className="wide">Shop description<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)}/></label><label>Shop image URL<input type="url" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)}/></label><label className="switch-label form-switch"><input type="checkbox" checked={form.isOpen} onChange={(event) => update("isOpen", event.target.checked)}/>Shop is accepting pickup orders</label>{message ? <p className="form-message wide">{message}</p> : null}<button className="button button-primary wide" disabled={busy}>{busy ? "Saving…" : "Save store details"}<Icon name="arrow"/></button></form>;
}

function PaymentsEditor() {
  const { user, stores, saveStore, orders } = useApp();
  const store = stores.find((item) => item.id === user?.id);
  const [upiId, setUpiId] = useState(store?.upiId ?? "");
  const [upiQrImageUrl, setUpiQrImageUrl] = useState(store?.upiQrImageUrl ?? "");
  const [message, setMessage] = useState("");
  const received = orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.total, 0);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!store) { setMessage("Save your store details first."); return; } try { await saveStore({ ...storeToInput(store), upiId: upiId.trim(), upiQrImageUrl: upiQrImageUrl.trim() }); setMessage("Direct payment details saved."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save payment details."); } }
  return <div className="payments-layout"><section className="payments-explainer"><Icon name="wallet"/><span className="eyebrow">DIRECT SETTLEMENT</span><h2>Your money goes straight to you.</h2><p>MeraPaan does not collect customer funds or run seller payouts. Customers either pay at pickup or use the UPI details you provide.</p><div><span>Confirmed direct payments</span><strong>₹{received.toLocaleString("en-IN")}</strong></div></section><form className="form panel" onSubmit={submit}><h2>Seller UPI settings</h2><label>UPI ID<input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="shopname@bank"/></label><label>UPI QR image URL (optional)<input type="url" value={upiQrImageUrl} onChange={(event) => setUpiQrImageUrl(event.target.value)} placeholder="https://…"/></label><p className="payment-note"><Icon name="alert"/>Only mark an order paid after the payment is visible in your own account.</p>{message ? <p className="form-message">{message}</p> : null}<button className="button button-primary">Save payment details</button></form></div>;
}

export default function SellPage() {
  const { user, authReady, sellerProducts, orders, deactivateProduct, stores } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState<Product | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const store = stores.find((item) => item.id === user?.id);
  const metrics = useMemo(() => ({ newOrders: orders.filter((order) => order.stage === "Order placed").length, preparing: orders.filter((order) => order.stage === "Preparing").length, ready: orders.filter((order) => order.stage === "Ready for pickup").length, revenue: orders.filter((order) => order.paymentStatus === "PAID" || (order.paymentStatus === "PAY_AT_PICKUP" && order.stage === "Collected")).reduce((sum, order) => sum + order.total, 0) }), [orders]);

  if (!authReady) return <div className="page container"><LoadingState label="Opening seller studio…"/></div>;
  if (!user) return <div className="page container"><section className="seller-invite"><div><span className="eyebrow">MERAPAAN SELLER</span><h1>Your paan shop,<br/>one command centre.</h1><p>Sign in to open your dashboard, publish products, manage scheduled pickup orders, and confirm direct payments.</p><div className="seller-invite-actions"><Link className="button button-gold" href="/login?role=seller&next=/sell">Sign in as seller <Icon name="arrow"/></Link><Link className="button seller-register-link" href="/login?role=seller&mode=register&next=/sell">Register seller account</Link></div></div><span><Icon name="shop"/></span></section></div>;
  if (!user.roles.includes("seller")) return <div className="page container"><EmptyState icon="shop" title="Seller account required" body="This customer account cannot publish or manage a shop."/></div>;

  const tabs: [Tab, string, Parameters<typeof Icon>[0]["name"]][] = [["overview", "Overview", "dashboard"], ["orders", "Orders", "orders"], ["products", "Products", "leaf"], ["store", "Store", "shop"], ["payments", "Payments", "wallet"]];
  return <div className="seller-page"><aside className="seller-sidebar"><div className="seller-profile"><span><Icon name="shop"/></span><div><small>SELLER STUDIO</small><b>{store?.name || user.storeName || user.name}</b><p className={store?.isOpen === false ? "closed" : ""}>{store?.isOpen === false ? "Closed for orders" : "Open for pickup"}</p></div></div><nav>{tabs.map(([value, label, icon]) => <button type="button" className={tab === value ? "active" : ""} onClick={() => setTab(value)} key={value}><Icon name={icon}/>{label}{value === "orders" && metrics.newOrders ? <b>{metrics.newOrders}</b> : null}</button>)}</nav><Link href={"/shop?store=" + encodeURIComponent(user.id)} className="seller-view-store"><Icon name="search"/>View marketplace</Link></aside><main className="seller-main"><header className="seller-heading"><div><span className="eyebrow">MERAPAAN SELLER</span><h1>{tabs.find(([value]) => value === tab)?.[1]}</h1><p>{tab === "overview" ? "Today’s pickup activity at a glance." : tab === "orders" ? "Accept requests and keep every customer updated." : tab === "products" ? "Keep prices, stock, and preparation time accurate." : tab === "store" ? "Manage what customers see and where they collect." : "Configure direct seller payments—no platform payouts."}</p></div>{tab === "products" ? <button type="button" className="button button-primary" onClick={() => { setEditing(undefined); setShowAdd(true); }}><Icon name="plus"/>Add product</button> : null}</header>
    {tab === "overview" ? <><div className="metric-grid"><article><span><Icon name="orders"/>New orders</span><strong>{metrics.newOrders}</strong><small>Needs your response</small></article><article><span><Icon name="clock"/>Preparing</span><strong>{metrics.preparing}</strong><small>In the kitchen now</small></article><article><span><Icon name="check"/>Ready</span><strong>{metrics.ready}</strong><small>Waiting for pickup</small></article><article><span><Icon name="rupee"/>Order value</span><strong>₹{metrics.revenue.toLocaleString("en-IN")}</strong><small>Collected or confirmed paid</small></article></div><section className="seller-section"><header><div><span className="eyebrow">PRIORITY</span><h2>New pickup requests</h2></div><button type="button" className="text-button" onClick={() => setTab("orders")}>View all<Icon name="arrow"/></button></header><SellerOrders/></section></> : null}
    {tab === "orders" ? <SellerOrders/> : null}
    {tab === "products" ? <section className="seller-products">{showAdd ? <div className="editor-panel"><header><h2>Add a real product</h2><button type="button" aria-label="Close editor" onClick={() => setShowAdd(false)}><Icon name="close"/></button></header><ProductEditor onClose={() => setShowAdd(false)}/></div> : null}{editing ? <div className="editor-panel"><header><h2>Edit {editing.name}</h2><button type="button" aria-label="Close editor" onClick={() => setEditing(undefined)}><Icon name="close"/></button></header><ProductEditor product={editing} onClose={() => setEditing(undefined)}/></div> : null}{sellerProducts.length ? <div className="seller-product-list">{sellerProducts.map((product) => <article key={product.id}><ProductMedia src={product.imageUrl} alt={product.name}/><div><span className={product.status === "published" ? "shop-state" : "shop-state closed"}>{product.status}</span><h3>{product.name}</h3><p>{product.category} · {product.preparationMinutes ?? 15} min</p></div><strong>₹{product.price}</strong><span>{product.stock} in stock</span><div><button type="button" onClick={() => { setShowAdd(false); setEditing(product); }}><Icon name="edit"/>Edit</button>{product.status !== "draft" ? <button type="button" className="danger-text" onClick={() => { if (window.confirm("Deactivate " + product.name + "? It will disappear from the customer catalog.")) deactivateProduct(product.id); }}><Icon name="trash"/>Deactivate</button> : null}</div></article>)}</div> : <EmptyState icon="leaf" title="No products yet" body="Add your first real product when it is available for pickup."/>}</section> : null}
    {tab === "store" ? <StoreEditor key={store ? store.id + store.name + store.area : "new-store"}/> : null}
    {tab === "payments" ? <PaymentsEditor key={store ? store.id + store.upiId + store.upiQrImageUrl : "new-payment"}/> : null}
  </main></div>;
}
