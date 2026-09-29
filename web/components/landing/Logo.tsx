import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
};

/**
 * The Anotely mark: a square page, three bars of a waveform, and one
 * highlighter tab on the top edge. Drawn with `currentColor` so it inherits
 * ink or paper depending on the surface it sits on. Flat fills only.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <g fill="currentColor">
        <rect x="8" y="14" width="3.4" height="6" />
        <rect x="14.3" y="9" width="3.4" height="16" />
        <rect x="20.6" y="16" width="3.4" height="4" />
      </g>
      <rect x="18" y="1" width="13" height="6" fill="var(--color-highlight)" />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
  markClassName?: string;
};

/** Logo plus wordmark, for the nav and footer. */
export function Wordmark({ className, markClassName }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo className={markClassName} />
      <span className="font-display text-xl leading-none font-semibold tracking-tight">
        Anotely
      </span>
    </span>
  );
}
