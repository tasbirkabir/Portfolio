import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.banned === "boolean") data.banned = body.banned;
  if (body.role) data.role = body.role;
  if (body.grantAccess) {
    await db.libraryAccess.upsert({
      where: { userEmail_itemType_itemSlug: { userEmail: body.userEmail, itemType: body.grantAccess.type, itemSlug: body.grantAccess.slug } },
      update: {},
      create: {
        userId: id,
        userEmail: body.userEmail,
        itemType: body.grantAccess.type,
        itemSlug: body.grantAccess.slug,
      },
    });
  }
  if (body.removeAccess) {
    await db.libraryAccess.deleteMany({
      where: { userEmail: body.userEmail, itemType: body.removeAccess.type, itemSlug: body.removeAccess.slug },
    });
  }
  const u = data.banned !== undefined || data.role ? await db.profile.update({ where: { id }, data }) : await db.profile.findUnique({ where: { id } });
  return NextResponse.json({ user: u });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await params;
  await db.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
