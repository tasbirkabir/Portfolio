import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieNames = allCookies.map(c => c.name);

  return NextResponse.json({
    DATABASE_URL_configured: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    
    NEXT_PUBLIC_SUPABASE_URL_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL_val: process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined",
    
    NEXT_PUBLIC_SUPABASE_ANON_KEY_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0,
    
    SUPABASE_SERVICE_ROLE_KEY_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY_length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
    
    ADMIN_EMAIL_configured: !!process.env.ADMIN_EMAIL,
    ADMIN_EMAIL_val: process.env.ADMIN_EMAIL || "undefined",

    cookies_received: cookieNames
  });
}
