import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Check whether the current user can access a book or resource.
 * Returns { access: boolean, reason: string, accessType: string }
 */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type"); // book | resource
  const slug = req.nextUrl.searchParams.get("slug");
  if (!type || !slug) {
    return NextResponse.json({ error: "type and slug required" }, { status: 400 });
  }

  const user = await getCurrentUser();

  const item =
    type === "book"
      ? await db.book.findUnique({ where: { slug }, select: { slug: true, accessType: true, title: true } })
      : await db.resource.findUnique({ where: { slug }, select: { slug: true, accessType: true, title: true } });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accessType = item.accessType || "free";
  let access = false;
  let reason = "";

  if (accessType === "public" || accessType === "free") {
    access = true;
    reason = "open";
  } else if (accessType === "email-gate") {
    if (user) {
      access = true;
      reason = "authenticated";
    } else {
      reason = "email-required";
    }
  } else if (accessType === "paid") {
    if (user) {
      const lib = await db.libraryAccess.findFirst({
        where: { userEmail: user.email, itemType: type, itemSlug: slug },
      });
      if (lib) {
        access = true;
        reason = "purchased";
      } else {
        reason = "purchase-required";
      }
    } else {
      reason = "login-required";
    }
  } else if (accessType === "members") {
    if (user) {
      const lib = await db.libraryAccess.findFirst({
        where: { userEmail: user.email, itemType: type, itemSlug: slug },
      });
      if (lib || user.role === "admin") {
        access = true;
        reason = "member";
      } else {
        reason = "membership-required";
      }
    } else {
      reason = "login-required";
    }
  }

  return NextResponse.json({ access, reason, accessType, title: item.title });
}
