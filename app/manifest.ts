import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Palworld 1.0 toolkit`,
    short_name: "Paldex",
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#070b16",
    theme_color: "#2f62f0",
    lang: "en",
    categories: ["games", "utilities"],
  };
}
