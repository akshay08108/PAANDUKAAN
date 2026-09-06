import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; store?: string }> }) {
  const { q = "", store = "" } = await searchParams;
  return <div className="page container"><header className="page-heading split-heading"><div><span className="eyebrow">EXPLORE HYDERABAD</span><h1>Fresh from local paan shops</h1><p>Browse live seller inventory. Every order is prepared for scheduled pickup.</p></div><div className="pickup-promise"><Icon name="clock"/><span><b>Pickup only</b>No delivery wait or platform-held payment</span></div></header><Catalog initialTerm={q} initialStore={store}/></div>;
}
