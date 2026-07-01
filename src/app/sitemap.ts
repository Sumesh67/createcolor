import type { MetadataRoute } from "next";
import { THEMES, SITE_URL } from "@/lib/themes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/create", "/coloring-pages", "/gallery", "/community"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const themeEntries: MetadataRoute.Sitemap = THEMES.map((t) => ({
    url: `${SITE_URL}/coloring-pages/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...themeEntries];
}
