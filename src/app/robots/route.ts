import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/admin

Sitemap: https://tasbirkabir.site/sitemap.xml
Sitemap: https://tasbirkabir.site/rss.xml`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
