"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";
import { Brand } from "./ui";
import { LocationPicker } from "./location-picker";

const publicNav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"], ["/sell", "For Sellers"]] as const;
const customerNav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, user, authReady, activeAlert, dismissAlert } = useApp();
  const [open, setOpen] = useState(false);
  const isSeller = user?.roles.includes("seller") === true;
  const redirectSeller = authReady && isSeller && pathname !== "/sell" && pathname !== "/login";
  const nav = user ? customerNav : publicNav;
  const accountHref = user?.roles.includes("seller") ? "/sell" : user ? "/orders" : "/login";
  useEffect(() => {
    if (redirectSeller) router.replace("/sell");
  }, [redirectSeller, router]);
  if (pathname === "/login") return <main className="auth-route">{children}</main>;
  if (isSeller && pathname === "/sell") return <>{children}</>;
  if (redirectSeller) return <main className="role-route-loading"><span/>Opening seller dashboard…</main>;
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
    <footer className="footer"><div className="container footer-inner"><Link className="brand" href="/"><Brand/></Link><p><b>Apna Paan. Apni Pasand.</b><br/>Freshly prepared by Hyderabad&apos;s local shops. Pickup on your time.</p><div><Link href="/shop">Explore</Link>{!user ? <Link href="/sell">For sellers</Link> : null}<Link href="/orders">My orders</Link><Link href={accountHref}>Account</Link></div></div><div className="container footer-note">MeraPaan is a marketplace for pickup orders. Payments go directly to sellers.</div></footer>
    {activeAlert?.audience === "customer" ? <div className="order-alert-toast" role="status" aria-live="assertive"><Icon name="volume"/><div><b>{activeAlert.title}</b><span>{activeAlert.body}</span></div><button type="button" onClick={dismissAlert} aria-label="Dismiss alert"><Icon name="close"/></button></div> : null}
  </div>;
}
