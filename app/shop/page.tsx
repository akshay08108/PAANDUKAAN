import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <div className="page container"><header className="page-heading"><h1>Fresh from local shops</h1><p>Browse real seller inventory. Every order is prepared for scheduled pickup.</p></header><Catalog initialTerm={q}/></div>;
}
