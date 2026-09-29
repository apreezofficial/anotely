/**
 * Ink line-art icons for the landing page.
 *
 * Drawn as single-stroke, square-cornered line art — the same idiom as the
 * logo mark and the torn edge. No filled circles, no sparkles, no gradients.
 * Each is `currentColor` so it inherits whatever text colour wraps it.
 *
 * All icons accept `className` (for sizing) and an optional `strokeWidth`.
 */

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

const DEFAULT_STROKE = 1.75;
const CAP = "square" as const;
const JOIN = "miter" as const;

function basePath(d: string) {
  return <path d={d} />;
}

/** Summarise: a paragraph with the middle lines shortened. */
function SummariseIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5h16M4 9h11M4 13h16M4 17h9" />
      <path d="M17 9l3 3-3 3" />
    </svg>
  );
}

/** Auto-title: a sheet with a folded top corner and a tab across the top. */
function AutoTitleIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4h9l6 6v10H5z" />
      <path d="M14 4v6h6" />
      <path d="M8 14h8M8 17h6" />
    </svg>
  );
}

/** Action items: a checklist, two ticks. */
function ActionItemsIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <path d="M5 7h14M5 12h14M5 17h10" />
      <path d="m8 12 1.6 1.6L15 10" />
    </svg>
  );
}

/** Semantic search: a magnifier with a crosshair. */
function SearchIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m15 15 5 5" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

/** A folder tab. */
function FolderIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h6l2 2h8v10H4z" />
    </svg>
  );
}

/** A magnifier. */
function MagnifierIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m15 15 5 5" />
    </svg>
  );
}

/** A small plus, for disclosure toggles. */
function PlusIcon({ className, strokeWidth = DEFAULT_STROKE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

export const landingIcons = {
  Summarise: SummariseIcon,
  "Auto-title": AutoTitleIcon,
  "Action items": ActionItemsIcon,
  "Semantic search": SearchIcon,
  Folder: FolderIcon,
  Magnifier: MagnifierIcon,
  Plus: PlusIcon,
};