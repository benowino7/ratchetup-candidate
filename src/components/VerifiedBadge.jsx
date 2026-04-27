/**
 * Verified badge — Twitter / X-style green tick.
 *
 * Inline SVG so it renders identically across every browser, no font-icon
 * dependency, and no flash of unstyled content. The body of the tick uses
 * the universal "checkmark inside a star-bezel" pattern (same silhouette
 * Twitter, Instagram, TikTok and LinkedIn settled on); we render it in
 * brand-green and add a subtle hover tooltip.
 *
 * Usage:
 *   <VerifiedBadge size={18} title="Verified" />
 *   <VerifiedBadge size="lg" />     // 18px / 22px / 28px presets
 */
import { useState } from "react";

const SIZES = { sm: 16, md: 18, lg: 22, xl: 28 };

function resolveSize(s) {
  if (typeof s === "number") return s;
  return SIZES[s] || SIZES.md;
}

export default function VerifiedBadge({
  size = "md",
  title = "Verified",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const px = resolveSize(size);

  return (
    <span
      role="img"
      aria-label={title}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      className={`relative inline-flex items-center align-middle ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 22 22"
        width={px}
        height={px}
        aria-hidden="true"
        focusable="false"
        style={{ display: "block" }}
      >
        {/* Star-bezel silhouette in green */}
        <path
          fill="#1DA851"
          d="M20.396 11.0061c0-.85-.5036-1.6235-1.2891-1.9682.4054-.7714.2666-1.7387-.394-2.3993-.6606-.6606-1.6279-.7994-2.3993-.394-.3447-.7855-1.1182-1.289-1.9682-1.289-.85 0-1.6235.5035-1.9682 1.289-.7714-.4054-1.7387-.2666-2.3993.394-.6606.6606-.7994 1.6279-.394 2.3993-.7855.3447-1.289 1.1182-1.289 1.9682 0 .85.5035 1.6235 1.289 1.9682-.4054.7714-.2666 1.7387.394 2.3993.6606.6606 1.6279.7994 2.3993.394.3447.7855 1.1182 1.289 1.9682 1.289.85 0 1.6235-.5035 1.9682-1.289.7714.4054 1.7387.2666 2.3993-.394.6606-.6606.7994-1.6279.394-2.3993.7855-.3447 1.2891-1.1182 1.2891-1.9682z"
        />
        {/* Inner white tick */}
        <path
          fill="#FFFFFF"
          d="M9.642 14.137 6.354 10.85l1.253-1.252 2.035 2.035 4.751-4.752 1.253 1.252z"
        />
      </svg>

      {/* Tooltip */}
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 z-20 whitespace-nowrap rounded-md bg-emerald-600 text-white text-[11px] font-semibold px-2 py-0.5 shadow-md"
          style={{ lineHeight: "1.25rem" }}
        >
          {title}
        </span>
      )}
    </span>
  );
}
