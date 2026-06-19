"use client";

import { cn } from "@/lib/utils";

export type BookCoverData = {
  title: string;
  subtitle?: string;
  category?: string;
  accent: string;
  coverStyle: string;
  badge?: string | null;
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(n, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function withAlpha(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function shade(hex: string, amt: number) {
  // amt: -1 (black) .. 1 (white)
  const { r, g, b } = hexToRgb(hex);
  const f = (c: number) =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Premium CSS-designed book cover. Five editorial variants.
 * Designed to feel like a real published book — Apple Books quality.
 */
export function BookCover({
  book,
  className,
  showBadge = true,
}: {
  book: BookCoverData;
  className?: string;
  showBadge?: boolean;
}) {
  const { accent, coverStyle } = book;
  const dark = luminance(accent) < 0.55;
  const ink = "rgb(26,26,26)";
  const paper = "#fbfaf7";

  const author = "TASBIR KABIR";

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[6px] select-none",
        "shadow-cover ring-1 ring-black/5",
        className
      )}
      style={{ background: paper }}
    >
      {/* Spine highlight on the left edge */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[5px]"
        style={{ background: `linear-gradient(to right, ${withAlpha(ink, 0.28)}, transparent)` }}
      />
      {/* Page edge on the right */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[3px]"
        style={{ background: `linear-gradient(to left, ${withAlpha(ink, 0.12)}, transparent)` }}
      />

      {coverStyle === "editorial" && <EditorialVariant book={book} accent={accent} ink={ink} author={author} />}
      {coverStyle === "mono" && <MonoVariant book={book} accent={accent} dark={dark} author={author} />}
      {coverStyle === "duotone" && <DuotoneVariant book={book} accent={accent} author={author} />}
      {coverStyle === "grid" && <GridVariant book={book} accent={accent} ink={ink} author={author} />}
      {coverStyle === "stack" && <StackVariant book={book} accent={accent} dark={dark} author={author} />}

      {showBadge && book.badge && (
        <div
          className="absolute right-2.5 top-2.5 z-30 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] backdrop-blur"
          style={{
            background: withAlpha("#ffffff", 0.92),
            color: ink,
            boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          }}
        >
          {book.badge}
        </div>
      )}
    </div>
  );
}

/* ---------------- Variants ---------------- */

function EditorialVariant({ book, accent, ink, author }: { book: BookCoverData; accent: string; ink: string; author: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-[8%]">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 80% at 50% 0%, ${withAlpha(accent, 0.06)}, transparent 60%)` }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
          {book.category}
        </span>
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: accent }} />
      </div>

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="mb-3 h-px w-8" style={{ background: accent }} />
        <h3
          className="font-display leading-[0.95] text-balance"
          style={{ color: ink, fontSize: "clamp(1rem, 7cqw, 1.9rem)" }}
        >
          {book.title}
        </h3>
        {book.subtitle && (
          <p
            className="mt-3 line-clamp-3 font-reader text-[10px] italic leading-snug"
            style={{ color: withAlpha(ink, 0.6) }}
          >
            {book.subtitle}
          </p>
        )}
      </div>

      <div className="relative flex items-center justify-between">
        <span className="text-[7.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: withAlpha(ink, 0.7) }}>
          {author}
        </span>
        <span className="font-display text-[11px]" style={{ color: accent }}>
          TK
        </span>
      </div>
    </div>
  );
}

function MonoVariant({ book, accent, dark, author }: { book: BookCoverData; accent: string; dark: boolean; author: string }) {
  const fg = dark ? "#f7f4ee" : "#fff";
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-[8%]"
      style={{ background: accent }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(100% 60% at 50% 0%, #fff, transparent 70%)` }}
      />
      <div className="relative">
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: withAlpha(fg, 0.75) }}>
          {book.category}
        </span>
      </div>
      <div className="relative flex flex-1 flex-col justify-center">
        <h3
          className="font-display leading-[0.92] text-balance"
          style={{ color: fg, fontSize: "clamp(1.1rem, 7.5cqw, 2rem)" }}
        >
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="mt-3 line-clamp-3 text-[10px] leading-snug" style={{ color: withAlpha(fg, 0.7) }}>
            {book.subtitle}
          </p>
        )}
      </div>
      <div className="relative flex items-center justify-between">
        <span className="text-[7.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: withAlpha(fg, 0.7) }}>
          {author}
        </span>
        <div className="h-2 w-2 rounded-full border" style={{ borderColor: withAlpha(fg, 0.5) }} />
      </div>
    </div>
  );
}

function DuotoneVariant({ book, accent, author }: { book: BookCoverData; accent: string; author: string }) {
  const dark = shade(accent, -0.4);
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: accent }} />
      <div
        className="absolute inset-x-0 bottom-0 top-[42%]"
        style={{ background: dark }}
      />
      <div className="relative flex h-full flex-col justify-between p-[8%]">
        <div>
          <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/85">
            {book.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h3
            className="font-display text-balance text-white"
            style={{ fontSize: "clamp(1.1rem, 7.5cqw, 2rem)", lineHeight: 0.92 }}
          >
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="mt-3 line-clamp-3 text-[10px] leading-snug text-white/75">{book.subtitle}</p>
          )}
        </div>
        <span className="text-[7.5px] font-semibold uppercase tracking-[0.24em] text-white/70">{author}</span>
      </div>
    </div>
  );
}

function GridVariant({ book, accent, ink, author }: { book: BookCoverData; accent: string; ink: string; author: string }) {
  return (
    <div className="absolute inset-0" style={{ background: "#fbfaf7" }}>
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `linear-gradient(${withAlpha(accent, 0.18)} 1px, transparent 1px), linear-gradient(90deg, ${withAlpha(
            accent,
            0.18
          )} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-[8%]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
            {book.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-2 inline-block self-start px-2 py-1" style={{ background: accent }}>
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white">Playbook</span>
          </div>
          <h3
            className="font-display text-balance"
            style={{ color: ink, fontSize: "clamp(1.05rem, 7cqw, 1.85rem)", lineHeight: 0.94 }}
          >
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="mt-2 line-clamp-3 text-[10px] leading-snug" style={{ color: withAlpha(ink, 0.6) }}>
              {book.subtitle}
            </p>
          )}
        </div>
        <span className="text-[7.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: withAlpha(ink, 0.65) }}>
          {author}
        </span>
      </div>
    </div>
  );
}

function StackVariant({ book, accent, dark, author }: { book: BookCoverData; accent: string; dark: boolean; author: string }) {
  const fg = dark ? "#f7f4ee" : "#fff";
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-[3]" style={{ background: accent }} />
      <div className="flex-[2]" style={{ background: shade(accent, -0.18) }} />
      <div className="flex-[2]" style={{ background: shade(accent, -0.34) }} />
      <div className="absolute inset-0 flex flex-col justify-between p-[8%]">
        <div>
          <span className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: withAlpha(fg, 0.85) }}>
            {book.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h3
            className="font-display text-balance"
            style={{ color: fg, fontSize: "clamp(1.05rem, 7cqw, 1.9rem)", lineHeight: 0.92 }}
          >
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="mt-2 line-clamp-2 text-[10px] leading-snug" style={{ color: withAlpha(fg, 0.7) }}>
              {book.subtitle}
            </p>
          )}
        </div>
        <span className="text-[7.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: withAlpha(fg, 0.7) }}>
          {author}
        </span>
      </div>
    </div>
  );
}
