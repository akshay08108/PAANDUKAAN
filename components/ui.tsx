"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Icon } from "./icons";
import type { OrderStage, PaymentStatus } from "@/lib/types";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? "brand-lockup compact" : "brand-lockup"}>
    <span className="brand-symbol" aria-hidden="true"><b>M</b><Icon name="leaf"/></span>
    <span className="brand-word">MeraPaan</span>
  </span>;
}

export function ProductMedia({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={`media-frame ${className}`}>
    {src && !failed
      ? <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw" onError={() => setFailed(true)}/>
      : <span className="leaf-placeholder"><Icon name="leaf"/><small>MeraPaan</small></span>}
  </span>;
}

export function EmptyState({ icon, title, body, href, action }: { icon: Parameters<typeof Icon>[0]["name"]; title: string; body?: string; href?: string; action?: ReactNode }) {
  return <section className="empty-state">
    <span><Icon name={icon}/></span>
    <h2>{title}</h2>
    {body ? <p>{body}</p> : null}
    {href && typeof action === "string" ? <Link className="button button-primary" href={href}>{action}<Icon name="arrow"/></Link> : action}
  </section>;
}

export function LoadingState({ label }: { label: string }) {
  return <div className="loading-state" role="status"><span/><p>{label}</p></div>;
}

const stageClass: Record<OrderStage, string> = {
  "Order placed": "info",
  Confirmed: "info",
  Preparing: "warning",
  "Ready for pickup": "success",
  Collected: "success",
  Cancelled: "danger",
  Rejected: "danger",
};

export function StatusBadge({ stage }: { stage: OrderStage }) {
  const label = stage === "Confirmed" ? "Accepted" : stage === "Collected" ? "Completed" : stage;
  return <span className={`status-badge ${stageClass[stage] ?? "info"}`}>{label}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Payment pending",
    PAID: "Paid to seller",
    PAY_AT_PICKUP: "Pay at pickup",
    FAILED: "Payment failed",
    REFUNDED: "Refunded",
  };
  const tone = status === "PAID" ? "success" : status === "FAILED" ? "danger" : status === "REFUNDED" ? "info" : "warning";
  return <span className={`status-badge ${tone}`}>{labels[status]}</span>;
}

export function SectionHeading({ title, copy, actionHref, actionLabel }: { title: string; copy?: string; actionHref?: string; actionLabel?: string }) {
  return <header className="section-heading"><div><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</div>{actionHref && actionLabel ? <Link href={actionHref}>{actionLabel}<Icon name="arrow"/></Link> : null}</header>;
}
