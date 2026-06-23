import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * llms.txt — AI discovery file (https://llmstxt.org)
 *
 * A markdown-formatted summary that helps AI answer engines (ChatGPT, Claude,
 * Perplexity, Gemini) quickly understand the site's purpose, entities, and
 * key content. This is the AI equivalent of robots.txt.
 */
export async function GET() {
  const body = `# Tasbir Kabir — AI Consultant, Web Developer & Media Buyer

> Tasbir Kabir builds AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster. Based in Dhaka, Bangladesh.

Tasbir Kabir is an AI Consultant, Web Developer, and Media Buyer based in Dhaka, Bangladesh. With 60+ projects delivered over 3+ years, he combines AI and digital strategy to create systems that drive real business growth. He offers four core services: AI Agents, Automation Systems, AI-Integrated Web Development, and AI Consulting & Media Buying.

## Services

- **AI Agents**: Custom AI systems that automate customer interactions, lead qualification, support tasks, and business operations. Built with OpenAI, Claude, and n8n.
- **Automation Systems**: End-to-end workflows that connect tools and streamline repetitive processes using n8n, Make, and API integrations.
- **AI-Integrated Web Development**: Modern websites enhanced with AI-powered features, automation, and conversion-focused experiences. Built with WordPress, Next.js, and AI features.
- **AI Consulting & Media Buying**: Strategy and ad campaigns that put AI to work on acquisition, from intelligent workflows to conversion-focused campaigns.

## Key Content

- [Home](https://tasbirkabir.site/) — Overview of services and work
- [Books & Ebooks](https://tasbirkabir.site/?v=books) — Digital ebooks and frameworks on AI, automation, marketing, and business systems
- [Free Resources](https://tasbirkabir.site/?v=resources) — Prompt packs, checklists, templates, and guides
- [Blog](https://tasbirkabir.site/?v=blog) — Articles on AI, automation, and digital systems
- [Knowledge Hub](https://tasbirkabir.site/?v=knowledge) — Content organized by topic cluster
- [About](https://tasbirkabir.site/?v=about) — Biography and philosophy
- [Contact](https://tasbirkabir.site/?v=contact) — Start a project

## Featured Ebook

- **The AI Agency Operating System** — A complete framework for building, running, and scaling an AI-powered agency. Available at https://tasbirkabir.site/?v=book&slug=ai-agency-operating-system

## Process

1. **Understand** — Map the business and identify where AI fits best
2. **Build** — Design and test the agent or automation
3. **Learn** — Teach the client how to run and modify the system
4. **Scale** — Expand across more brands, products, and income streams

## Contact

- Email: tasbirrkabir@gmail.com
- Location: Dhaka, Bangladesh
- LinkedIn: https://www.linkedin.com/in/tasbirrkabir
- X (Twitter): https://x.com/tasbirrkabir
- GitHub: https://github.com/tasbirkabir

## Sitemap

- XML Sitemap: https://tasbirkabir.site/sitemap.xml
- RSS Feed: https://tasbirkabir.site/rss.xml
- Robots: https://tasbirkabir.site/robots.txt`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
