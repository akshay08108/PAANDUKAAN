import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeraPaan — Hyderabad ka apna paan",
    short_name: "MeraPaan",
    description: "Order fresh paan from local Hyderabad shops for scheduled pickup.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF1DA",
    theme_color: "#003B2A",
    icons: [
      { src: "/icons/merapaan-favicon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/merapaan-app-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
