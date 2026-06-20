import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Input validation schemas for all API endpoints.
 * Never trust client-side data — validate everything server-side.
 */

export const emailSchema = z.string().email().max(254).toLowerCase().trim();
export const passwordSchema = z.string().min(8).max(128);
export const nameSchema = z.string().min(1).max(100).trim();
export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/);
export const priceSchema = z.number().min(0).max(10000);
export const urlSchema = z.string().url().max(2048).optional().or(z.literal(""));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema.refine((p) => /[A-Z]/.test(p), "Must contain uppercase")
    .refine((p) => /[a-z]/.test(p), "Must contain lowercase")
    .refine((p) => /[0-9]/.test(p), "Must contain a number"),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  topic: z.string().min(1).max(100),
  message: z.string().min(1).max(10000),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().max(100).optional(),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    slug: z.string().min(1).max(200),
    title: z.string().min(1).max(300),
    type: z.enum(["book", "resource"]),
    price: z.number().min(0).max(10000),
  })).min(1).max(20),
  method: z.string().min(1).max(50),
  customer: z.object({
    name: z.string().max(200).optional(),
    email: emailSchema,
    phone: z.string().max(50).optional(),
  }).optional(),
});

export const bookCreateSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(10000).optional().or(z.literal("")),
  price: priceSchema,
  originalPrice: priceSchema.nullable().optional(),
  pages: z.number().int().min(0).max(10000),
  category: z.string().min(1).max(100),
  accent: z.string().max(20),
  coverStyle: z.string().max(50),
  badge: z.string().max(50).nullable().optional(),
  featured: z.boolean().optional(),
  accessType: z.enum(["public", "free", "email-gate", "paid", "members"]),
  status: z.enum(["draft", "published", "scheduled"]),
  whatYouLearn: z.array(z.string().max(500)).max(50).optional(),
  chapters: z.array(z.any()).max(100).optional(),
  faq: z.array(z.any()).max(50).optional(),
  highlights: z.array(z.string().max(500)).max(20).optional(),
  content: z.array(z.any()).max(500).optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDesc: z.string().max(500).nullable().optional(),
});

export const blogCreateSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(2000).optional().or(z.literal("")),
  content: z.string().max(100000).optional().or(z.literal("")),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(20).optional(),
  readTime: z.number().int().min(1).max(300),
  cover: z.string().max(2048),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDesc: z.string().max(500).nullable().optional(),
});

export const resourceCreateSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  type: z.string().min(1).max(50),
  category: z.string().min(1).max(100),
  accent: z.string().max(20),
  price: priceSchema.optional(),
  accessType: z.enum(["public", "free", "email-gate", "paid", "members"]),
  status: z.enum(["draft", "published", "scheduled"]),
  pages: z.number().int().min(1).max(10000).nullable().optional(),
  fileUrl: z.string().max(2048).nullable().optional(),
});

/** Sanitize a string for safe output (basic XSS prevention). */
export function sanitizeString(s: string): string {
  return s
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Sanitized error response — never expose internal details. */
export function errorResponse(error: string, status = 400): NextResponse {
  // Log the full error server-side
  console.error("[API Error]", error);
  // Return a generic message to the client
  const safeMessages: Record<number, string> = {
    400: "Bad request.",
    401: "Authentication required.",
    403: "You don't have permission to do that.",
    404: "Not found.",
    429: "Too many requests. Please try again later.",
    500: "Something went wrong. Please try again.",
  };
  // For known client errors, return the specific message; for 500s, generic
  if (status === 500) {
    return NextResponse.json({ error: safeMessages[500] }, { status });
  }
  return NextResponse.json({ error: status >= 400 && status < 500 ? error : safeMessages[status] || error }, { status });
}
