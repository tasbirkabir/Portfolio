import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware — runs on every request (Edge Runtime).
 *
 * 1. Refreshes the Supabase auth session (handles token rotation).
 * 2. Applies security headers (CSP, HSTS, etc. in production).
 *
 * The session refresh ensures users stay logged in across page refreshes
 * and serverless function invocations on Vercel.
 */

function getSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  };

  if (isProduction) {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isProduction = process.env.NODE_ENV === "production";

  // Apply security headers
  for (const [key, value] of Object.entries(getSecurityHeaders(isProduction))) {
    res.headers.set(key, value);
  }
  res.headers.delete("X-Powered-By");

  // Refresh Supabase session (token rotation + cookie update)
  // Skip if Supabase isn't configured (local dev without Supabase)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    await supabase.auth.getUser();
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|xml|txt)$).*)",
  ],
};
