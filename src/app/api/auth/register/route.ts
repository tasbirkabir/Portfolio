import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/auth/session";

/** POST /api/auth/register — creates and auto-confirms a user using Supabase Admin API. */
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create and auto-confirm user in Supabase Auth using the admin client
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    // Pre-create the database Profile row so it's ready in the Prisma DB
    await getOrCreateProfile(user);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
