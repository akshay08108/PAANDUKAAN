"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";

export default function CartPage() {
  const { cart, cartTotal, setQuantity, removeFromCart } = useApp();
  if (!cart.length) return <div className="page container"><section className="simple-empty"><Icon name="cart"/><h1>Your cart is empty</h1><p>Add a fresh item from a local shop to schedule a pickup.</p><Link className="button button-accent" href="/shop">Browse items</Link></section></div>;
  return <div className="page container"><header className="page-heading"><h1>Your pickup order</h1><p>Items in one order are collected from the same shop.</p></header><div className="cart-layout"><section className="cart-lines">{cart.map(({ product, quantity }) => <article key={product.id}><span className="cart-thumb"><Icon name="leaf"/></span><div><small>{product.storeName}</small><h2>{product.name}</h2><p>Freshly prepared for your selected pickup slot.</p><div className="quantity"><button onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Decrease quantity"><Icon name="minus"/></button><b>{quantity}</b><button onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Increase quantity"><Icon name="plus"/></button></div></div><div className="line-price"><strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong><button onClick={() => removeFromCart(product.id)}><Icon name="trash"/>Remove</button></div></article>)}</section><aside className="summary"><h2>Order summary</h2><dl><div><dt>Items</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div><div><dt>Pickup fee</dt><dd>₹0</dd></div><div className="total"><dt>Total</dt><dd>₹{cartTotal.toLocaleString("en-IN")}</dd></div></dl><Link className="button button-accent full" href="/checkout">Choose pickup time <Icon name="arrow"/></Link><small>No delivery. Collect directly from {cart[0].product.storeName}.</small></aside></div></div>;
}
