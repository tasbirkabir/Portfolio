import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * Auth helpers — Supabase Auth + Prisma Profile.
 *
 * Admin role is assigned AUTOMATICALLY based on the ADMIN_EMAIL environment variable.
 * When a user signs up or signs in with the email matching ADMIN_EMAIL, they are
 * automatically promoted to admin. No scripts, no terminal commands, no manual setup.
 *
 * To configure the admin:
 * 1. Set ADMIN_EMAIL in your Vercel environment variables (e.g., "admin@tasbirkabir.site")
 * 2. Sign up on the website using that email
 * 3. The account is automatically promoted to admin on first login
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  profileImage: string | null;
};

/** The email that should have admin access (from env var). */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@tasbirkabir.site").toLowerCase().trim();

/** Get the current authenticated user from Supabase session + Prisma profile. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get or create the profile (auto-promotes if email matches ADMIN_EMAIL)
    const profile = await getOrCreateProfile(user);
    if (profile.banned) return null;

    return profile;
  } catch {
    return null;
  }
}

/** Require an admin user — returns null if not admin. */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/** Require any authenticated user — returns null if not logged in. */
export async function requireAuth(): Promise<AuthUser | null> {
  return getCurrentUser();
}

/**
 * Get or create a profile for a Supabase user.
 * Automatically promotes to admin if the email matches the ADMIN_EMAIL env var.
 * This runs on every login — no setup scripts needed.
 */
export async function getOrCreateProfile(supabaseUser: { id: string; email: string; user_metadata?: any }): Promise<AuthUser> {
  const email = supabaseUser.email.toLowerCase().trim();
  const isAdmin = email === ADMIN_EMAIL;

  let profile = await db.profile.findUnique({ where: { id: supabaseUser.id } });

  if (!profile) {
    // Create the profile — auto-promote if email matches ADMIN_EMAIL
    profile = await db.profile.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || null,
        role: isAdmin ? "admin" : "user",
      },
    });
  } else {
    // Profile exists — ensure admin email always has admin role (safety net)
    if (isAdmin && profile.role !== "admin") {
      profile = await db.profile.update({
        where: { id: supabaseUser.id },
        data: { role: "admin" },
      });
    }
    // Sync email/name if changed in Supabase
    if (profile.email !== supabaseUser.email || (profile.name === null && supabaseUser.user_metadata?.name)) {
      profile = await db.profile.update({
        where: { id: supabaseUser.id },
        data: {
          email: supabaseUser.email,
          name: profile.name || supabaseUser.user_metadata?.name || null,
        },
      });
    }
  }

  // Update last login timestamp
  await db.profile.update({
    where: { id: supabaseUser.id },
    data: { lastLoginAt: new Date() },
  }).catch(() => {});

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as "user" | "admin",
    profileImage: profile.profileImage,
  };
}
