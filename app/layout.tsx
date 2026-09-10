import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://paandukaan.vercel.app"),
  title: { default: "MeraPaan — Hyderabad ka apna paan", template: "%s | MeraPaan" },
  description: "Discover local Hyderabad paan shops, order fresh, and collect at your scheduled pickup time.",
  applicationName: "MeraPaan",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MeraPaan" },
  icons: {
    icon: [{ url: "/icons/merapaan-favicon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/icons/merapaan-app-icon.png", type: "image/png", sizes: "512x512" }],
  },
};

export const viewport = { themeColor: "#062f26", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;
}
