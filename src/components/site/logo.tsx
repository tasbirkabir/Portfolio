"use client";

import { cn } from "@/lib/utils";
import { useNav } from "@/lib/store/nav";

/**
 * Tasbir Kabir brand logo — the stylized portrait mark.
 * Used in the navbar, footer, post bylines, author cards, etc.
 */
export function Logo({
  size = 32,
  className,
  rounded = "rounded-full",
  onClickHome = false,
  alt = "Tasbir Kabir",
}: {
  size?: number;
  className?: string;
  rounded?: string;
  onClickHome?: boolean;
  alt?: string;
}) {
  const navigate = useNav((s) => s.navigate);
  return (
    <img
      src="/images/logo.png"
      alt={alt}
      width={size}
      height={size}
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
