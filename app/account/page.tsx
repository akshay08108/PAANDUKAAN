"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { EmptyState, LoadingState } from "@/components/ui";

export default function AccountPage() {
  const router = useRouter();
  const { user, authReady, signOut } = useApp();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  if (!authReady) return <div className="page container"><LoadingState label="Opening your account…"/></div>;
  if (!user) return <div className="page container"><EmptyState icon="user" title="Sign in to your account" body="View your pickup orders and manage your MeraPaan session." href="/login?next=/account" action="Sign in"/></div>;

  return <div className="page container account-page"><header className="page-heading"><span className="eyebrow">MY ACCOUNT</span><h1>Hello, {user.name.split(" ")[0]}</h1><p>Manage your customer account and securely log out when you&apos;re finished.</p></header><section className="account-panel"><div className="account-identity"><span><Icon name="user"/></span><div><small>CUSTOMER ACCOUNT</small><h2>{user.name}</h2><p>{user.email}</p>{user.mobile ? <p>{user.mobile}</p> : null}</div></div><div className="account-actions"><Link className="button button-primary" href="/orders"><Icon name="orders"/>View my orders</Link><Link className="button button-outline" href="/shop"><Icon name="search"/>Explore shops</Link><button className="account-logout" type="button" disabled={signingOut} onClick={() => void handleSignOut()}><Icon name="logout"/>{signingOut ? "Logging out…" : "Log out of MeraPaan"}</button></div></section></div>;
}
