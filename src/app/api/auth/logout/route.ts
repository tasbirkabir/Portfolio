import { NextResponse } from "next/server";
import { clearSessionRes, revokeCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await revokeCurrentSession();
  const res = NextResponse.json({ ok: true });
  return clearSessionRes(res);
}
