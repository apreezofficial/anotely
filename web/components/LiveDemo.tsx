"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check, Loader2, Mic, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Eyebrow, Section, fadeUp, stagger } from "./ui";

const SPOKEN = [
  "so", "um", "we", "need", "to", "uh", "talk", "about", "the", "budget", "on", "tuesday",
  "i", "think", "we", "should", "probably", "double", "check", "the", "numbers", "and", "then",
  "um", "send", "it", "over", "to", "finance", "before", "the", "end", "of", "the", "week",
];

const CHANGES = [
  { from: "um, uh", to: "—", kind: "filler", reason: "filler words removed" },
  { from: "tuesday", to: "Tuesday", kind: "capitalisation", reason: "day names are capitalised" },
  { from: "i think we should probably", to: "we should", kind: "clarity", reason: "hedge words removed" },
  { from: "over to", to: "to", kind: "clarity", reason: "redundant preposition" },
  { from: "double check", to: "double-check", kind: "spelling", reason: "compound verb hyphenated" },
];

const POLISHED =
  "We need to talk about the budget on Tuesday. We should double-check the numbers, then send it to finance before the end of the week.";

const KIND_STYLE: Record<string, string> = {
  filler: "text-rose-300 border-rose-400/25 bg-rose-400/10",
  capitalisation: "text-amber-300 border-amber-400/25 bg-amber-400/10",
  clarity: "text-violet-300 border-violet-400/25 bg-violet-400/10",
  spelling: "text-sky-300 border-sky-400/25 bg-sky-400/10",
};

type Phase = "idle" | "listening" | "proofing" | "done";

const STEPS: { key: Phase; label: string }[] = [
  { key: "listening", label: "Auto Write" },
  { key: "proofing", label: "AI proofread" },
  { key: "done", label: "Ready to apply" },
];

export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [changes, setChanges] = useState<typeof CHANGES>([]);
  const cancelled = useRef(false);
  const [level, setLevel] = useState(0.2);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = useCallback(async () => {
    cancelled.current = false;
    setPhase("listening");
    setTyped("");
    setChanges([]);

    for (const word of SPOKEN) {
      if (cancelled.current) return;
      setTyped((text) => `${text}${word} `);
      setLevel(0.35 + Math.random() * 0.55);
      await sleep(105 + Math.random() * 90);
    }

    if (cancelled.current) return;
    setLevel(0.08);
    await sleep(600);
    setPhase("proofing");
    await sleep(1300);

    for (const change of CHANGES) {
      if (cancelled.current) return;
      setChanges((list) => [...list, change]);
      await sleep(340);
    }
    if (!cancelled.current) setPhase("done");
  }, []);

  useEffect(() => {
    if (inView && phase === "idle") void run();
  }, [inView, phase, run]);

  useEffect(() => () => {
    cancelled.current = true;
  }, []);

  const active = phase === "listening";

  return (
    <Section id="demo" className="pt-10">
      <div ref={ref} className="text-center">
        <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)}>
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow>Live, in your browser</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Watch a messy voice note become a clean one
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-xl text-slate-400">
            This is the real flow: talk, pause, and the AI reads the whole note back with every edit
            explained.
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/70 shadow-[0_50px_120px_-50px_rgba(0,0,0,1)] backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          {STEPS.map((step) => {
            const order = STEPS.findIndex((s) => s.key === phase);
            const index = STEPS.findIndex((s) => s.key === step.key);
            const done = order >= index && order !== -1;
            return (
              <span
                key={step.key}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  done
                    ? "border-white/15 bg-white/[0.06] text-white"
                    : "border-white/[0.07] text-slate-500"
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
                {step.label}
              </span>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <AnimatePresence>
              {phase === "proofing" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1.5 text-[11px] text-accent-300"
                >
                  <Loader2 className="h-3 w-3 animate-spin" /> reading your note…
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => void run()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> replay
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          {/* transcript */}
          <div className="border-b border-white/[0.06] p-6 lg:border-b-0 lg:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              What you said
            </p>
            <p className="mt-4 min-h-[7.5rem] text-[15px] leading-relaxed text-slate-300">
              {typed}
              {active && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent-400 animate-caret" />
              )}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="relative grid h-14 w-14 place-items-center">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full accent-gradient"
                    animate={
                      active
                        ? { scale: 0.9 + level * 0.35 + i * 0.1, opacity: 0.25 - i * 0.07 }
                        : { scale: 0.9, opacity: 0.08 }
                    }
                    transition={{ type: "spring", stiffness: 150, damping: 18 }}
                  />
                ))}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => (active ? (cancelled.current = true, setPhase("idle")) : void run())}
                  className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-ink-900"
                >
                  <Mic className="h-5 w-5" />
                </motion.button>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {active ? "Listening…" : phase === "idle" ? "Tap to talk" : "Captured"}
                </p>
                <p className="text-[12px] text-slate-500">
                  {active ? "say “anotely done” when you finish" : "auto write · sentence by sentence"}
                </p>
              </div>
            </div>
          </div>

          {/* proofreading */}
          <div className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              What Anotely did
            </p>

            <div className="mt-4 min-h-[7.5rem] space-y-2">
              <AnimatePresence initial={false}>
                {changes.length === 0 && phase !== "proofing" && (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-slate-600"
                  >
                    Changes appear here, one by one, with the reason for each.
                  </motion.p>
                )}
                {phase === "proofing" && changes.length === 0 && (
                  <div className="space-y-2">
                    {[80, 95, 60].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-3 rounded-full bg-white/[0.06]"
                        style={{ width: `${w}%` }}
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                )}
                {changes.map((change, i) => (
                  <motion.div
                    key={change.to + i}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                  >
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${KIND_STYLE[change.kind]}`}
                    >
                      {change.kind}
                    </span>
                    <span className="text-[13px] text-rose-300/80 line-through decoration-rose-400/40">
                      {change.from}
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="text-[13px] font-medium text-emerald-300">{change.to}</span>
                    <span className="ml-auto text-[11px] text-slate-500">{change.reason}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4"
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" /> polished · score 94
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-200">{POLISHED}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm">
                      <Wand2 className="h-3.5 w-3.5" /> Apply all
                    </Button>
                    <Button size="sm" variant="ghost">
                      Keep mine
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
