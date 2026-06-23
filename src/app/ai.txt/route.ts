import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * ai.txt — AI crawler discovery file.
 *
 * Declares which AI crawlers are welcome, what content they may use, and
 * provides a machine-readable summary of the site's entities.
 */
export async function GET() {
  const body = JSON.stringify({
    "site": "https://tasbirkabir.site",
    "name": "Tasbir Kabir",
    "description": "AI Consultant, Web Developer, and Media Buyer based in Dhaka, Bangladesh. Builds AI agents, automation systems, and high-performing websites.",
    "author": {
      "name": "Tasbir Kabir",
      "email": "tasbirrkabir@gmail.com",
      "location": "Dhaka, Bangladesh",
      "role": "AI Consultant · Web Developer · Media Buyer"
    },
    "services": [
      "AI Agents",
      "Automation Systems",
      "AI-Integrated Web Development",
      "AI Consulting & Media Buying"
    ],
    "crawlers": {
      "allowed": [
        "GPTBot", "ChatGPT-User", "OAI-SearchBot",
        "Claude-Web", "ClaudeBot", "anthropic-ai",
        "PerplexityBot", "Perplexity-User",
        "Google-Extended", "Googlebot",
        "Bingbot", "CCBot",
        "FacebookBot", "Applebot-Extended", "cohere-ai"
      ],
      "disallowed": ["SemrushBot", "AhrefsBot"]
    },
    "content_licenses": {
      "commercial_use": "allowed with attribution",
      "training_use": "allowed",
      "citation": "please cite https://tasbirkabir.site as source"
    },
    "key_pages": {
      "home": "https://tasbirkabir.site/",
      "books": "https://tasbirkabir.site/?v=books",
      "resources": "https://tasbirkabir.site/?v=resources",
      "blog": "https://tasbirkabir.site/?v=blog",
      "knowledge_hub": "https://tasbirkabir.site/?v=knowledge",
      "about": "https://tasbirkabir.site/?v=about",
      "contact": "https://tasbirkabir.site/?v=contact"
    },
    "discovery_files": {
      "llms_txt": "https://tasbirkabir.site/llms.txt",
      "sitemap": "https://tasbirkabir.site/sitemap.xml",
      "rss": "https://tasbirkabir.site/rss.xml",
      "robots": "https://tasbirkabir.site/robots.txt"
    },
    "social": {
      "linkedin": "https://www.linkedin.com/in/tasbirrkabir",
      "twitter": "https://x.com/tasbirrkabir",
      "github": "https://github.com/tasbirkabir",
      "facebook": "https://www.facebook.com/share/1Tf65s6PB7/"
    }
  }, null, 2);
  return new NextResponse(body, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
