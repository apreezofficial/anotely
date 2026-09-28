import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, MicOff, Sparkles, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DictationState } from "@/lib/types";

const RINGS = 3;

export function MicOrb({
  state,
  level,
  engine,
  onToggle,
  disabled,
}: {
  state: DictationState;
  level: number;
  engine: "web" | "cloud";
  onToggle: () => void;
  disabled?: boolean;
}) {
  const active = state === "listening" || state === "transcribing" || state === "starting";
  const showWave = state === "listening";

  return (
    <div className="relative grid h-16 w-16 place-items-center">
      <AnimatePresence>
        {active &&
          Array.from({ length: RINGS }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full accent-gradient"
              initial={{ scale: 0.7, opacity: 0.45 }}
              animate={{
                scale: 1 + level * 0.35 + i * 0.14,
                opacity: 0.28 - i * 0.07,
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                scale: { type: "spring", stiffness: 180, damping: 18 },
                opacity: { duration: 0.3 },
                delay: i * 0.12,
              }}
            />
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-label={active ? "Stop dictation" : "Start Auto Write"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        className={cn(
          "relative z-10 grid h-14 w-14 place-items-center rounded-full transition-colors",
          active
            ? "bg-white text-ink-900 shadow-[0_0_40px_-6px_var(--accent-ring)]"
            : "border border-white/12 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "starting" ? (
            <motion.span
              key="start"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.span>
          ) : state === "transcribing" ? (
            <motion.span
              key="trans"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <Waves className="h-5 w-5" />
            </motion.span>
          ) : state === "proofreading" ? (
            <motion.span
              key="proof"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.span>
          ) : active ? (
            <motion.span
              key="stop"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <MicOff className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <Mic className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>

        <motion.span
          className="pointer-events-none absolute -inset-px rounded-full border border-white/20"
          animate={showWave ? { opacity: 0.35 + level * 0.5 } : { opacity: 0.15 }}
          transition={{ duration: 0.12 }}
        />
      </motion.button>

      {/* live waveform skirt */}
      <AnimatePresence>
        {showWave && (
          <motion.div
            className="absolute -bottom-7 flex h-6 items-end gap-[3px]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full accent-gradient"
                animate={{
                  height: `${6 + level * 18 * (0.4 + Math.abs(Math.sin((Date.now() / 180 + i) % 3))) }px`,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.span
            className="absolute -top-9 whitespace-nowrap rounded-full border border-white/10 bg-ink-900/90 px-2.5 py-1 text-[10px] font-medium text-slate-300 backdrop-blur"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            {state === "transcribing" ? "Transcribing…" : `Auto Write · ${engine}`}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
