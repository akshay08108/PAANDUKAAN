import "@fontsource-variable/manrope";
import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "PaanDukaan — Fresh paan, scheduled pickup", template: "%s | PaanDukaan" },
  description: "Order fresh paan from trusted local shops and collect it at your chosen pickup time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;
}
