import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const posts = await db.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }],
  });
  const data = posts.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category,
    readTime: p.readTime,
    cover: p.cover,
    featured: p.featured,
    publishedAt: p.publishedAt,
  }));
  return NextResponse.json({ posts: data });
}
