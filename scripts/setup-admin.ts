/**
 * Admin Setup Script — Creates the admin user in Supabase Auth + Profile.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... DATABASE_URL=... bun run scripts/setup-admin.ts
 *
 * Or set the env vars in .env first, then:
 *   bun run scripts/setup-admin.ts
 *
 * This script:
 * 1. Creates (or finds) the admin user in Supabase Auth
 * 2. Creates a Profile row with role=admin
 * 3. Prints the admin login credentials
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = "admin@tasbirkabir.site";
const ADMIN_PASSWORD = "ChangeMe2026!";
const ADMIN_NAME = "Tasbir Kabir";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Check if admin user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const existing = existingUsers?.users?.find((u: any) => u.email === ADMIN_EMAIL);
  let adminUser;

  if (existing) {
    console.log("Admin user already exists:", existing.id);
    adminUser = existing;
  } else {
    // 2. Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Skip email verification for admin
      user_metadata: { name: ADMIN_NAME },
    });

    if (error) {
      console.error("Failed to create admin user:", error.message);
      process.exit(1);
    }

    console.log("Admin user created:", data.user.id);
    adminUser = data.user;
  }

  // 3. Create the Profile row (via Prisma)
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();

  try {
    const profile = await db.profile.upsert({
      where: { id: adminUser.id },
      update: { role: "admin", name: ADMIN_NAME, email: ADMIN_EMAIL },
      create: {
        id: adminUser.id,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: "admin",
      },
    });
    console.log("Admin profile created:", profile.id);
  } catch (e: any) {
    console.error("Failed to create profile:", e.message);
    console.log("\nMake sure you've run: bun run db:push");
    process.exit(1);
  } finally {
    await db.$disconnect();
  }

  console.log("\n✓ Admin setup complete!");
  console.log("\nAdmin login:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  Change the password after first login via Admin → Account.");
}

main().catch(console.error);
