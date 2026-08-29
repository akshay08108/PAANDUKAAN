"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import type { UserRole } from "@/lib/types";

function AuthForm() {
  const { user, authReady, signIn, register, resetPassword, signOut } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>("customer");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "login") await signIn(email, password);
      else await register({ name, email, mobile, password, role, storeName: role === "seller" ? storeName : undefined });
      router.push(searchParams.get("next") || (role === "seller" ? "/sell" : "/"));
    } catch (reason) { setMessage(reason instanceof Error ? reason.message.replace("Firebase: ", "") : "Authentication failed."); setBusy(false); }
  }

  if (!authReady) return <div className="auth-loading">Checking your account…</div>;
  if (user) return <section className="auth-card signed-in"><span><Icon name="check"/></span><h1>Welcome back, {user.name}</h1><p>Signed in as {user.email}</p><div><button className="button button-outline" onClick={() => router.push(user.roles.includes("seller") ? "/sell" : "/orders")}>Continue</button><button className="text-button" onClick={signOut}>Sign out</button></div></section>;

  return <section className="auth-card"><div className="auth-intro"><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>{mode === "login" ? "Sign in with the same Firebase account used across the marketplace." : "Order as a customer or publish real inventory as a seller."}</p></div>
    <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button></div>
    <form className="form" onSubmit={submit}>
      {mode === "register" ? <><div className="role-options"><button type="button" className={role === "customer" ? "active" : ""} onClick={() => setRole("customer")}><Icon name="user"/>Customer</button><button type="button" className={role === "seller" ? "active" : ""} onClick={() => setRole("seller")}><Icon name="shop"/>Seller</button></div><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name"/></label><label>Mobile number<input required value={mobile} onChange={(event) => setMobile(event.target.value)} inputMode="tel" autoComplete="tel"/></label>{role === "seller" ? <label>Shop name<input required value={storeName} onChange={(event) => setStoreName(event.target.value)}/></label> : null}</> : null}
      <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email"/></label><label>Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>
      {message ? <p className="form-error" role="alert">{message}</p> : null}<button className="button button-accent full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<Icon name="arrow"/></button>
      {mode === "login" ? <button type="button" className="text-button" onClick={async () => { if (!email) { setMessage("Enter your email first."); return; } try { await resetPassword(email); setMessage("Password reset email sent."); } catch { setMessage("Could not send reset email."); } }}>Forgot password?</button> : null}
    </form>
  </section>;
}

export default function LoginPage() {
  return <div className="auth-page"><Suspense fallback={<div className="auth-loading">Loading…</div>}><AuthForm/></Suspense></div>;
}
