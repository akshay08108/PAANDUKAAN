"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";

const nav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"], ["/sell", "For Sellers"]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, user } = useApp();
  const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="MeraPaan home"><span className="brand-mark">M</span><span className="brand-name"><b>Mera</b>Paan</span></Link>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {nav.map(([href, label]) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className="account-link" href="/login"><Icon name="user"/><span>{user ? user.name.split(" ")[0] : "Account"}</span></Link>
        <Link className="cart-link" href="/cart"><Icon name="cart"/><span>Cart</span>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu"><Icon name={open ? "close" : "menu"}/></button>
      </div>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><div className="container footer-inner"><Link className="brand" href="/"><span className="brand-mark">M</span><span className="brand-name"><b>Mera</b>Paan</span></Link><p>Apna Paan. Apni Pasand. Freshly prepared by local shops.</p><div><Link href="/shop">Explore</Link><Link href="/sell">For sellers</Link><Link href="/login">Account</Link></div></div></footer>
  </div>;
}
