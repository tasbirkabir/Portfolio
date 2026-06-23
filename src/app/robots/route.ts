import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = `# Allow all AI/LLM crawlers explicitly (AEO/GEO best practice)
User-agent: *
Allow: /
Disallow: /api/admin
Disallow: /api/auth

# Explicitly allow major AI crawlers so they know they're welcome
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: CCBot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

# Block content scrapers that ignore robots
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

# Discovery files
Sitemap: https://tasbirkabir.site/sitemap.xml
Sitemap: https://tasbirkabir.site/rss.xml

# AI discovery files
# https://llmstxt.org — helps AI engines understand the site at a glance
# llms.txt is served at /llms.txt
# ai.txt is served at /ai.txt`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
