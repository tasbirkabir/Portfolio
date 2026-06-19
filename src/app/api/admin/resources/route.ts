import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const resources = await db.resource.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ resources });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const r = await db.resource.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: body.description || "",
      type: body.type || "pdf",
      category: body.category || "Resources",
      accent: body.accent || "#1a1a1a",
      price: Number(body.price) || 0,
      accessType: body.accessType || "free",
      status: body.status || "published",
      pages: body.pages ? Number(body.pages) : null,
      fileUrl: body.fileUrl || null,
    },
  });
  return NextResponse.json({ resource: r });
}
