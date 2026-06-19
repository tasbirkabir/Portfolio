import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const posts = await db.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json({ posts: posts.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || "[]") })) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const post = await db.blogPost.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      excerpt: body.excerpt || "",
      content: body.content || "",
      category: body.category || "Systems",
      tags: JSON.stringify(body.tags || []),
      readTime: Number(body.readTime) || 5,
      cover: body.cover || "/images/blog-systems.jpg",
      featured: !!body.featured,
      status: body.status || "published",
      seoTitle: body.seoTitle || null,
      seoDesc: body.seoDesc || null,
    },
  });
  return NextResponse.json({ post });
}
