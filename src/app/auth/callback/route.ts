import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * /auth/callback — handles Supabase Auth redirects.
 *
 * Triggered after:
 * - Email confirmation (user clicks the link in the verification email)
 * - Password reset (user clicks the recovery link)
 * - OAuth sign-in (if enabled)
 *
 * Exchanges the code for a session, then redirects to the appropriate page.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "signup" | "recovery" | "email"
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              req.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password reset flow → redirect to account page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/?v=account`);
      }
      // Email confirmation or OAuth → redirect to library (or next param)
      return NextResponse.redirect(`${origin}/?v=library`);
    }
  }

  // Error or no code — redirect home
  return NextResponse.redirect(`${origin}/`);
}
