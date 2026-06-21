import { NextRequest, NextResponse } from "next/server";

/**
 * Security middleware — runs on every request.
 *
 * In production: applies full security headers (CSP, HSTS, clickjacking, etc.)
 * In development: applies lighter headers (HSTS/CSP omitted to avoid breaking HMR)
 *
 * Defense-in-depth: routes also check server-side for admin access.
 */

function getSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  };

  if (isProduction) {
    // Full security headers in production only
    headers["X-Frame-Options"] = "DENY";
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
    headers["X-XSS-Protection"] = "1; mode=block";
    headers["Content-Security-Policy"] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://sandbox.sslcommerz.com https://securepay.sslcommerz.com wss:",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "form-action 'self' https://sandbox.sslcommerz.com https://securepay.sslcommerz.com",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; ");
  }
  // In dev: NO X-Frame-Options, NO CSP, NO HSTS — allows the preview iframe,
  // HMR, WebSocket, and hot reload to all work normally.

  return headers;
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isProduction = process.env.NODE_ENV === "production";

  // Apply security headers
  for (const [key, value] of Object.entries(getSecurityHeaders(isProduction))) {
    res.headers.set(key, value);
  }

  // Remove X-Powered-By header (hides Next.js)
  res.headers.delete("X-Powered-By");

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
