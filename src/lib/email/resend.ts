import { Resend } from "resend";

/**
 * Email service using Resend.
 * Set RESEND_API_KEY in your .env file to enable email sending.
 * Get your key at: https://resend.com/api-keys
 */

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Tasbir Kabir <noreply@tasbirkabir.site>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = getClient();
  if (!resend) {
    console.log(`[Password Reset] No RESEND_API_KEY. Reset link for ${email}: ${SITE_URL}/?v=account&reset=${token}`);
    return { ok: false, dev: true };
  }

  const resetUrl = `${SITE_URL}/?v=account&reset=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — Tasbir Kabir",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">Reset your password</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          You requested a password reset for your Tasbir Kabir account.
          Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 24px 0;">
          Reset Password
        </a>
        <p style="font-size: 13px; color: #999; line-height: 1.5;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="font-size: 13px; color: #999; margin-top: 32px;">— Tasbir Kabir</p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend Error]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getClient();
  if (!resend) return { ok: false, dev: true };

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome${name ? `, ${name}` : ""} — Tasbir Kabir`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">Welcome${name ? `, ${name}` : ""}!</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Your account is ready. You can now purchase ebooks, download resources, and track your reading progress.
        </p>
        <a href="${SITE_URL}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 24px 0;">
          Explore the Library
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 32px;">— Tasbir Kabir</p>
      </div>
    `,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export async function sendBroadcastEmail(emails: string[], subject: string, body: string) {
  const resend = getClient();
  if (!resend) {
    console.log(`[Broadcast] No RESEND_API_KEY. Would send to ${emails.length} emails: ${subject}`);
    return { ok: false, dev: true, count: emails.length };
  }

  const batches: string[][] = [];
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50));
  }

  let sent = 0;
  for (const batch of batches) {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: batch[0],
      bcc: batch.slice(1),
      subject,
      html: `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="font-size: 16px; color: #333; line-height: 1.7; white-space: pre-wrap;">${body}</div>
        <p style="font-size: 13px; color: #999; margin-top: 32px;">— Tasbir Kabir</p>
      </div>`,
    });
    if (!error) sent += batch.length;
  }
  return { ok: true, sent };
}
