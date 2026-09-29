import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Deterministic PRNG so the server and client render byte-identical bars. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAR_WIDTH = 3;
const GAP = 2.6;
const FIELD_HEIGHT = 100;

type WaveformProps = {
  /** Number of bars in the waveform. */
  bars?: number;
  /** Change to get a different but equally stable waveform. */
  seed?: number;
  /** Bar indices painted in the highlighter colour — the "AI found this" bars. */
  highlight?: number[];
  /** Rendered height in pixels. */
  height?: number;
  /** Idle "listening" pulse. Ignored when the user prefers reduced motion. */
  pulse?: boolean;
  className?: string;
};

/**
 * A seeded audio waveform drawn as flat SVG bars. No audio, no canvas — the
 * bar heights are deterministic pseudo-random values shaped by a slow
 * envelope so it reads as speech rather than uniform noise.
 *
 * Bars are flat fills. The vertical stretch is an SVG `scaleY` on a
 * transform-box of `fill-box`, and it only runs under
 * `prefers-reduced-motion: no-preference`.
 */
export function Waveform({
  bars = 64,
  seed = 7,
  highlight = [],
  height = 96,
  pulse = true,
  className,
}: WaveformProps) {
  const random = mulberry32(seed);
  const highlighted = new Set(highlight);

  const fieldWidth = bars * (BAR_WIDTH + GAP) - GAP;
  const rects: React.ReactElement[] = [];

  for (let i = 0; i < bars; i += 1) {
    const t = i / Math.max(bars - 1, 1);
    // Slow humps stand in for the loud and quiet stretches of real speech.
    const envelope = 0.3 + 0.7 * Math.abs(Math.sin(t * Math.PI * 2.1 + 0.4));
    const noise = random();
    const amplitude = 0.28 * envelope + 0.72 * noise;
    const barHeight = Math.round(9 + amplitude * 84);
    const x = Number((i * (BAR_WIDTH + GAP)).toFixed(2));
    const y = Number(((FIELD_HEIGHT - barHeight) / 2).toFixed(2));

    rects.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={BAR_WIDTH}
        height={barHeight}
        fill={
          highlighted.has(i) ? "var(--color-highlight)" : "var(--color-ink)"
        }
        className={cn(pulse && "wave-bar")}
        style={
          pulse
            ? ({ "--wave-delay": `${-i * 85}ms` } as CSSProperties)
            : undefined
        }
      />,
    );
  }

  return (
    <svg
      viewBox={`0 0 ${fieldWidth} ${FIELD_HEIGHT}`}
      preserveAspectRatio="none"
      style={{ height }}
      className={cn("block w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
}
