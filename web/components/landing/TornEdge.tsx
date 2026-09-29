import { cn } from "@/lib/cn";

/**
 * A deckled, torn-paper edge. Used instead of a straight divider between
 * sections — the fill is the colour of the section *below* it, so the path
 * reads as a sheet of paper torn away.
 */
const TORN_PATH =
  "M0,0 H1200 V14 L1150,27 L1112,18 L1074,31 L1036,21 L998,33 L960,23 L922,35 L884,25 L846,33 L808,23 L770,35 L732,25 L694,33 L656,21 L618,31 L580,19 L542,29 L504,17 L466,27 L428,15 L390,25 L352,13 L314,23 L276,11 L238,21 L200,9 L162,19 L124,7 L86,17 L48,7 L0,15 Z";

type TornEdgeProps = {
  /** Flat fill of the shape — set this to the next section's background. */
  fill?: string;
  /** Flip vertically so the tear points up instead of down. */
  flip?: boolean;
  className?: string;
};

export function TornEdge({
  fill = "var(--color-paper)",
  flip = false,
  className,
}: TornEdgeProps) {
  return (
    <svg
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      className={cn(
        "block h-7 w-full sm:h-10 lg:h-12",
        flip && "rotate-180",
        className,
      )}
      aria-hidden="true"
      focusable="false"
    >
      <path d={TORN_PATH} fill={fill} />
    </svg>
  );
}
