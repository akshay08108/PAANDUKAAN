"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";
import { Brand } from "./ui";
import { LocationPicker } from "./location-picker";

const nav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"], ["/sell", "For Sellers"]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, user } = useApp();
  const [open, setOpen] = useState(false);
  const accountHref = user?.roles.includes("seller") ? "/sell" : user ? "/orders" : "/login";
  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="MeraPaan home"><Brand/></Link>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {nav.map(([href, label]) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <div className="mobile-nav-extra"><LocationPicker/><Link href={accountHref} onClick={() => setOpen(false)}><Icon name="user"/>{user ? user.name : "Account"}</Link></div>
      </nav>
      <div className="header-actions">
        <LocationPicker compact/>
        <Link className="account-link" href={accountHref}><Icon name="user"/><span>{user ? user.name.split(" ")[0] : "Account"}</span></Link>
        <Link className="cart-link" href="/cart"><Icon name="cart"/><span>Cart</span>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}><Icon name={open ? "close" : "menu"}/></button>
      </div>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><div className="container footer-inner"><Link className="brand" href="/"><Brand/></Link><p><b>Apna Paan. Apni Pasand.</b><br/>Freshly prepared by Hyderabad&apos;s local shops. Pickup on your time.</p><div><Link href="/shop">Explore</Link><Link href="/sell">For sellers</Link><Link href="/orders">My orders</Link><Link href={accountHref}>Account</Link></div></div><div className="container footer-note">MeraPaan is a marketplace for pickup orders. Payments go directly to sellers.</div></footer>
  </div>;
}
