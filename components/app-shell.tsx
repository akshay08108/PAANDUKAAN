"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "./app-provider";
import { Icon } from "./icons";
import { Brand } from "./ui";
import { LocationPicker } from "./location-picker";

const publicNav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"], ["/sell", "For Sellers"]] as const;
const customerNav = [["/", "Home"], ["/shop", "Explore"], ["/orders", "My Orders"]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, user, authReady, activeAlert, dismissAlert, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const isSeller = user?.roles.includes("seller") === true;
  const redirectSeller = authReady && isSeller && pathname !== "/sell" && pathname !== "/login";
  const nav = user ? customerNav : publicNav;
  const accountHref = user?.roles.includes("seller") ? "/sell" : user ? "/account" : "/login";
  useEffect(() => {
    if (redirectSeller) router.replace("/sell");
  }, [redirectSeller, router]);
  useEffect(() => {
    if (!accountOpen) return;
    const closeMenu = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  async function handleSignOut() {
    setAccountOpen(false);
    setOpen(false);
    await signOut();
    router.replace("/login");
  }
  if (pathname === "/login") return <main className="auth-route">{children}</main>;
  if (isSeller && pathname === "/sell") return <>{children}</>;
  if (redirectSeller) return <main className="role-route-loading"><span/>Opening seller dashboard…</main>;
  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="MeraPaan home"><Brand/></Link>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {nav.map(([href, label]) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <div className="mobile-nav-extra"><LocationPicker/><Link href={accountHref} onClick={() => setOpen(false)}><Icon name="user"/>{user ? "My account" : "Sign in"}</Link>{user ? <button type="button" onClick={() => void handleSignOut()}><Icon name="logout"/>Log out</button> : null}</div>
      </nav>
      <div className="header-actions">
        <LocationPicker compact/>
        {user ? <div className="account-menu" ref={accountMenuRef}><button className="account-link" type="button" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}><Icon name="user"/><span>{user.name.split(" ")[0]}</span><Icon className="account-caret" name="chevron"/></button>{accountOpen ? <div className="account-popover" role="menu"><header><span>Signed in as</span><b>{user.name}</b><small>{user.email}</small></header><Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}><Icon name="user"/>My account</Link><Link href="/orders" role="menuitem" onClick={() => setAccountOpen(false)}><Icon name="orders"/>My orders</Link><button type="button" role="menuitem" onClick={() => void handleSignOut()}><Icon name="logout"/>Log out</button></div> : null}</div> : <Link className="account-link" href="/login"><Icon name="user"/><span>Sign in</span></Link>}
        <Link className="cart-link" href="/cart"><Icon name="cart"/><span>Cart</span>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}><Icon name={open ? "close" : "menu"}/></button>
      </div>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><div className="container footer-inner"><Link className="brand" href="/"><Brand/></Link><p><b>Apna Paan. Apni Pasand.</b><br/>Freshly prepared by Hyderabad&apos;s local shops. Pickup on your time.</p><div><Link href="/shop">Explore</Link>{!user ? <Link href="/sell">For sellers</Link> : null}<Link href="/orders">My orders</Link><Link href={accountHref}>{user ? "My account" : "Sign in"}</Link></div></div><div className="container footer-note">MeraPaan is a marketplace for pickup orders. Payments go directly to sellers.</div></footer>
    {activeAlert?.audience === "customer" ? <div className="order-alert-toast" role="status" aria-live="assertive"><Icon name="volume"/><div><b>{activeAlert.title}</b><span>{activeAlert.body}</span></div><button type="button" onClick={dismissAlert} aria-label="Dismiss alert"><Icon name="close"/></button></div> : null}
  </div>;
}
