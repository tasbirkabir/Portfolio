import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { getOrCreateProfile } from "@/lib/auth/session";

/** GET /api/auth/me — returns the current user's profile (role, name, image). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get or create the profile
    const profile = await getOrCreateProfile(user);

    // Update last login
    await db.profile.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    return NextResponse.json({ user: profile });
  } catch (err: any) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ 
      user: null, 
      error: err.message || String(err),
      stack: err.stack || null
    });
  }
}
