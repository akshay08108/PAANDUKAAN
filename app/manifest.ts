import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeraPaan — Hyderabad ka apna paan",
    short_name: "MeraPaan",
    description: "Order fresh paan from local Hyderabad shops for scheduled pickup.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8E7",
    theme_color: "#064E3B",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
