import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  const body = await req.json();
  const post = await db.blogPost.update({
    where: { slug },
    data: {
      title: body.title,
      slug: body.slug || slug,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      tags: JSON.stringify(body.tags || []),
      readTime: Number(body.readTime) || 5,
      cover: body.cover,
      featured: !!body.featured,
      status: body.status,
      seoTitle: body.seoTitle || null,
      seoDesc: body.seoDesc || null,
    },
  });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  await db.blogPost.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
