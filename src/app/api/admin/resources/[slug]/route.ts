import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  const body = await req.json();
  const r = await db.resource.update({
    where: { slug },
    data: {
      title: body.title,
      slug: body.slug || slug,
      description: body.description,
      type: body.type,
      category: body.category,
      accent: body.accent,
      price: Number(body.price) || 0,
      accessType: body.accessType,
      status: body.status,
      pages: body.pages ? Number(body.pages) : null,
      fileUrl: body.fileUrl || null,
    },
  });
  return NextResponse.json({ resource: r });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  await db.resource.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
