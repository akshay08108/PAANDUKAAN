"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { friendlyAuthError, useApp } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { Brand } from "@/components/ui";
import type { UserRole } from "@/lib/types";

function AuthForm() {
  const { user, authReady, signIn, register, resetPassword, signOut } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(() => searchParams.get("mode") === "register" ? "register" : "login");
  const [role, setRole] = useState<UserRole>(() => searchParams.get("role") === "seller" ? "seller" : "customer");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "login") await signIn(email, password, role);
      else await register({ name, email, mobile, password, role, storeName: role === "seller" ? storeName : undefined });
      router.replace(searchParams.get("next") || (role === "seller" ? "/sell" : "/"));
    } catch (reason) { setMessage(friendlyAuthError(reason)); setBusy(false); }
  }

  if (!authReady) return <div className="auth-loading"><span/>Checking your account…</div>;
  if (user) return <section className="auth-card signed-in"><span><Icon name="check"/></span><h1>Welcome back, {user.name}</h1><p>{user.roles.includes("seller") ? "Your seller dashboard is ready." : `Signed in as ${user.email}`}</p><div><button type="button" className="button button-outline" onClick={() => router.push(user.roles.includes("seller") ? "/sell" : "/orders")}>{user.roles.includes("seller") ? "Open seller dashboard" : "Continue"}</button><button type="button" className="text-button" onClick={signOut}>Sign out</button></div></section>;

  return <section className="auth-card"><div className="auth-intro"><span>Welcome to MeraPaan</span><h1>{mode === "login" ? "Welcome back" : role === "seller" ? "Register your shop" : "Create your account"}</h1><p>{mode === "login" ? "Use your account details to continue." : role === "seller" ? "Start selling fresh paan for scheduled pickup." : "Discover local shops and order for pickup."}</p></div>
    <div className="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Register</button></div>
    <form className="form" onSubmit={submit}>
      <div className="role-options" aria-label="Account type"><button type="button" className={role === "customer" ? "active" : ""} onClick={() => { setRole("customer"); setMessage(""); }}><Icon name="user"/><span><b>Customer</b><small>Order for pickup</small></span>{role === "customer" ? <i><Icon name="check"/></i> : null}</button><button type="button" className={role === "seller" ? "active" : ""} onClick={() => { setRole("seller"); setMessage(""); }}><Icon name="shop"/><span><b>Seller</b><small>Open seller dashboard</small></span>{role === "seller" ? <i><Icon name="check"/></i> : null}</button></div>
      {mode === "register" ? <div className="auth-fields"><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name"/></label><label>Mobile number<input required value={mobile} onChange={(event) => setMobile(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="10-digit mobile number" pattern="[0-9 +()-]{8,16}"/></label>{role === "seller" ? <label className="auth-field-wide">Shop name<input required value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Your paan shop name"/></label> : null}</div> : null}
      <div className="auth-fields"><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com"/></label><label>Password<span className="password-control"><input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 6 characters"/><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}><Icon name={showPassword ? "eyeOff" : "eye"}/></button></span></label></div>
      {mode === "login" ? <div className="auth-options"><span>Signing in as {role}</span><button type="button" className="text-button" onClick={async () => { if (!email) { setMessage("Enter your email first."); return; } try { await resetPassword(email); setMessage("Password reset email sent."); } catch (reason) { setMessage(friendlyAuthError(reason)); } }}>Forgot password?</button></div> : null}
      {message ? <p className={message.includes("sent") ? "form-message auth-feedback" : "form-error auth-feedback"} role={message.includes("sent") ? "status" : "alert"}><Icon name={message.includes("sent") ? "check" : "alert"}/>{message}</p> : null}<button className="button button-primary full auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? `Sign in as ${role}` : role === "seller" ? "Create seller account" : "Create customer account"}<Icon name="arrow"/></button>
      <p className="auth-switch">{mode === "login" ? "New to MeraPaan?" : "Already registered?"}<button type="button" onClick={() => changeMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Register" : "Sign in"}</button></p>
    </form>
  </section>;
}

export default function LoginPage() {
  return <div className="auth-page"><aside className="auth-side"><Link href="/" className="auth-brand" aria-label="MeraPaan home"><Brand/><small>Apna Paan. Apni Pasand.</small></Link><div className="auth-story"><span>Welcome to MeraPaan</span><h2>Fresh paan.<br/> Local shops.<br/> Pickup on your time.</h2><p>A simpler way to order fresh from neighbourhood paan shops.</p></div><ul><li><Icon name="leaf"/><span><b>Fresh & local</b>From trusted shops</span></li><li><Icon name="shop"/><span><b>Pickup only</b>No delivery wait</span></li><li><Icon name="check"/><span><b>Trusted sellers</b>Direct payments</span></li></ul></aside><div className="auth-workspace"><Suspense fallback={<div className="auth-loading"><span/>Loading MeraPaan…</div>}><AuthForm/></Suspense></div></div>;
}
