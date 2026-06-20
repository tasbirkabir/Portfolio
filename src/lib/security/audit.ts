import { db } from "@/lib/db";

/**
 * Audit logging for admin and security-sensitive actions.
 * Every admin action is logged with the user, action, target, and timestamp.
 */

export async function logAudit(opts: {
  userId: string;
  userEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, any>;
}) {
  try {
    await db.analyticsEvent.create({
      data: {
        type: "admin_audit",
        path: `${opts.action}:${opts.targetType || ""}:${opts.targetId || ""}`,
        refSlug: opts.targetId || null,
        value: 0,
        meta: JSON.stringify({
          userId: opts.userId,
          userEmail: opts.userEmail,
          action: opts.action,
          targetType: opts.targetType,
          targetId: opts.targetId,
          ...opts.meta,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (e) {
    console.error("[Audit log failed]", e);
  }
}

/** Log a security event (failed login, rate limit hit, etc.) */
export async function logSecurityEvent(opts: {
  type: string;
  ip?: string;
  email?: string;
  meta?: Record<string, any>;
}) {
  try {
    await db.analyticsEvent.create({
      data: {
        type: `security_${opts.type}`,
        path: opts.ip || null,
        refSlug: opts.email || null,
        value: 0,
        meta: JSON.stringify({
          ...opts.meta,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (e) {
    console.error("[Security log failed]", e);
  }
}
