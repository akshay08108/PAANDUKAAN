import "@fontsource-variable/manrope";
import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "MeraPaan — Apna Paan. Apni Pasand.", template: "%s | MeraPaan" },
  description: "Discover trusted local paan shops, order your favourites and collect them fresh at your chosen pickup time.",
  applicationName: "MeraPaan",
  themeColor: "#064E3B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;
}
