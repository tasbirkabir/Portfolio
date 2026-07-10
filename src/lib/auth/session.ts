import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * Auth helpers — Supabase Auth + Prisma Profile.
 *
 * Supabase handles authentication (signup, signin, sessions, JWT tokens).
 * Prisma stores the Profile (role, name, image) linked by Supabase user ID.
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  profileImage: string | null;
};

/** Get the current authenticated user from Supabase session + Prisma profile. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Look up the profile for role/name/image
    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) return null;
    if (profile.banned) return null;

    return {
      id: user.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as "user" | "admin",
      profileImage: profile.profileImage,
    };
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

/** Get or create a profile for a Supabase user (called after signup/login). */
export async function getOrCreateProfile(supabaseUser: { id: string; email: string; user_metadata?: any }): Promise<AuthUser> {
  let profile = await db.profile.findUnique({ where: { id: supabaseUser.id } });
  if (!profile) {
    profile = await db.profile.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || null,
        role: "user",
      },
    });
  }
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as "user" | "admin",
    profileImage: profile.profileImage,
  };
}
