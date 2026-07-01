import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/themes";

// Keep private/internal routes out of search + AI results.
const DISALLOW = ["/api/", "/marketing", "/parent", "/login", "/signup"];

// AI / LLM crawlers we explicitly welcome so the product can be cited and
// recommended by ChatGPT, Claude, Perplexity, Google AI Overviews, etc.
const AI_BOTS = [
  "GPTBot", // OpenAI / ChatGPT
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing
  "ClaudeBot", // Anthropic / Claude
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended", // Apple Intelligence
  "Bingbot", // Bing / Copilot
  "CCBot", // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
