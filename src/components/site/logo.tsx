"use client";

import { cn } from "@/lib/utils";
import { useNav } from "@/lib/store/nav";
import { useData } from "@/hooks/use-data";

/**
 * Tasbir Kabir brand logo — the stylized portrait mark.
 * Used in the navbar, footer, post bylines, author cards, etc.
 *
 * If the site settings expose a `logoUrl`, that is used for all sizes.
 * Otherwise the original size-based logic applies (small WebP for ≤ 64px,
 * full WebP for larger).
 */
export function Logo({
  size = 32,
  className,
  rounded = "rounded-full",
  onClickHome = false,
  alt,
}: {
  size?: number;
  className?: string;
  rounded?: string;
  onClickHome?: boolean;
  alt?: string;
}) {
  const navigate = useNav((s) => s.navigate);
  const { data: settingsData } = useData<{ settings: any }>("/api/settings");
  const s = settingsData?.settings ?? null;

  // Settings logoUrl wins; otherwise the original size-based fallback.
  // Normalize .png → .webp for performance (logo.png is 533KB, logo.webp is 38KB).
  const rawSrc = s?.logoUrl || (size <= 64 ? "/images/logo-small.webp" : "/images/logo.webp");
  const src = rawSrc.endsWith(".png") ? rawSrc.replace(/\.png$/, ".webp") : rawSrc;
  const resolvedAlt = alt || s?.brandName || "Tasbir Kabir";

  return (
    <img
      src={src}
      alt={resolvedAlt}
      width={size}
      height={size}
      loading="eager"
      onClick={onClickHome ? () => navigate("home") : undefined}
      className={cn(
        "shrink-0 object-cover ring-1 ring-black/5",
        rounded,
        onClickHome && "cursor-pointer",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
