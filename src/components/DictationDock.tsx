import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Keyboard, X } from "lucide-react";
import { useState } from "react";
import { MicOrb } from "./MicOrb";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import type { DictationState } from "@/lib/types";

const DEFAULT_DONE_PHRASE = "anotely done";

const COMMANDS = [
  { phrase: "new paragraph", effect: "Starts a new paragraph" },
  { phrase: "new line", effect: "Line break" },
  { phrase: "period / comma / question mark", effect: "Types punctuation" },
  { phrase: "delete last sentence", effect: "Removes the previous sentence" },
  { phrase: DEFAULT_DONE_PHRASE, effect: "Stops listening and proofreads" },
];

export function DictationDock({
  state,
  level,
  engine,
  interim,
  onToggle,
}: {
  state: DictationState;
  level: number;
  engine: "web" | "cloud";
  interim: string;
  onToggle: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const donePhrase = useStore((s) => s.settings.donePhrase);
  const sttProvider = useStore((s) => s.settings.sttProvider);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center pb-6">
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="surface pointer-events-auto mb-3 w-[26rem] max-w-[90vw] p-3"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Voice commands
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-500 transition hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {COMMANDS.map((c, i) => (
                <motion.div
                  key={c.phrase}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-white/[0.04]"
                >
                  <span className="accent-text">“{i === COMMANDS.length - 1 ? donePhrase : c.phrase}”</span>
                  <span className="text-slate-500">{c.effect}</span>
                </motion.div>
              ))}
            </div>
            <p className="mt-2 border-t border-white/[0.06] px-2 pt-2 text-[11px] text-slate-500">
              Engine: <span className="text-slate-300">{sttProvider === "web" ? "built-in browser speech" : sttProvider}</span>
              . Shortcut <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Ctrl</kbd>{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Shift</kbd>{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Space</kbd> to talk.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-900/80 p-1.5 pl-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,1)] backdrop-blur-2xl">
        <button
          onClick={() => setShowHelp((s) => !s)}
          title="Voice commands"
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full transition-colors",
            showHelp ? "bg-white/10 text-white" : "text-slate-500 hover:text-white",
          )}
        >
          <motion.span animate={{ rotate: showHelp ? 180 : 0 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <MicOrb state={state} level={level} engine={engine} onToggle={onToggle} />

        <div className="flex min-w-[13rem] max-w-[22rem] flex-col px-2">
          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.p
                key="idle"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[13px] font-medium text-slate-300"
              >
                Auto Write
                <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                  tap the mic and just talk
                </span>
              </motion.p>
            ) : (
              <motion.p
                key="live"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="line-clamp-2 text-[13px] italic text-[var(--accent-text)]"
              >
                {state === "proofreading"
                  ? "Proofreading with AI…"
                  : interim || "listening…"}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-[10.5px] uppercase tracking-wider text-slate-600">
            {state === "idle"
              ? "say “anotely done” to proofread"
              : `${engine} engine · level ${Math.round(level * 100)}%`}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center text-slate-600">
          <Keyboard className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
