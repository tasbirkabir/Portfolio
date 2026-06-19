import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (user.banned) {
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    return withSession(res, user.id, user.email, user.role);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Something went wrong." }, { status: 500 });
  }
}
