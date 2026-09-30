import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

const DISALLOW = ["/admin", "/admin/", "/api/"];

// Arama motorları ve AI asistanlarının tarayıcıları açıkça davet edilir (GEO).
const AGENTS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOW }, ...AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW }))],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
