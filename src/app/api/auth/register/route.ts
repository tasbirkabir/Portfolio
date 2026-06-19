import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    const user = await db.user.create({
      data: { email: cleanEmail, password, name: name || null, role: "user" },
    });
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    return withSession(res, user.id, user.email, user.role);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Something went wrong." }, { status: 500 });
  }
}
