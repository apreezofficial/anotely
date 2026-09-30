import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, Undo2, Wand2, X } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { PanelShell } from "./PanelShell";

const KIND_STYLE: Record<string, string> = {
  grammar: "text-sky-300 bg-sky-400/10 border-sky-400/25",
  spelling: "text-rose-300 bg-rose-400/10 border-rose-400/25",
  punctuation: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  clarity: "text-violet-300 bg-violet-400/10 border-violet-400/25",
  style: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
  added: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
  removed: "text-rose-300 bg-rose-400/10 border-rose-400/25",
};

export function ProofreadPanel() {
  const proof = useStore((s) => s.proof);
  const setProof = useStore((s) => s.setProof);
  const setPanel = useStore((s) => s.setPanel);
  const patchNote = useStore((s) => s.patchNote);
  const activeId = useStore((s) => s.activeId);
  const toast = useStore((s) => s.toast);

  const result = proof.result;

  const highlighted = useMemo(() => {
    if (!result) return "";
    let html = escapeHtml(result.corrected);
    for (const change of result.changes.slice(0, 12)) {
      if (!change.replacement.trim()) continue;
      const needle = escapeRegex(change.replacement.trim());
      html = html.replace(
        new RegExp(`(${needle})`, "gi"),
        `<mark class="rounded bg-[var(--accent-ring)] px-0.5 text-white">$1</mark>`,
      );
    }
    return html;
  }, [result]);

  const apply = () => {
    if (!result || !activeId) return;
    patchNote(activeId, { content: result.corrected, lastProofreadAt: Date.now() });
    setProof({ result: null, before: null });
    setPanel("none");
    toast(`Applied ${result.changes.length} improvements`, "success");
  };

  const reject = () => {
    setProof({ result: null, before: null });
    setPanel("none");
  };

  const unchanged =
    !!result && !!proof.before && result.corrected.trim() === proof.before.trim();

  return (
    <PanelShell width={380}>
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3.5">
          <motion.span
            animate={{ rotate: proof.running ? 360 : 0 }}
            transition={proof.running ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
            className="grid h-8 w-8 place-items-center rounded-lg accent-gradient"
          >
            {proof.running ? (
              <Loader2 className="h-4 w-4 text-white" />
            ) : (
              <Wand2 className="h-4 w-4 text-white" />
            )}
          </motion.span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">AI Proofread</p>
            <p className="text-[11px] text-slate-500">
              {proof.running ? "Reading your note…" : "Review before applying"}
            </p>
          </div>
          <button
            onClick={() => {
              setProof({ result: null });
              setPanel("none");
            }}
            className="text-slate-500 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
  
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {proof.running ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {["w-3/4", "w-full", "w-5/6", "w-2/3", "w-full", "w-4/5"].map((w, i) => (
                  <motion.div
                    key={i}
                    className={cn("h-3 rounded-full bg-white/[0.07]", w)}
                    animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: i * 0.12,
                    }}
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.14), rgba(255,255,255,.04))",
                      backgroundSize: "200% 100%",
                    }}
                  />
                ))}
                <p className="pt-2 text-center text-xs text-slate-500">
                  Fixing grammar, punctuation and flow…
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <ScoreRing score={result.score} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {unchanged ? "Already clean" : `${result.changes.length} improvements found`}
                    </p>
                    <p className="text-xs text-slate-400">{result.summary}</p>
                  </div>
                </div>
  
                {result.changes.length > 0 ? (
                  <div className="space-y-1.5">
                    {result.changes.map((change, i) => (
                      <motion.div
                        key={`${change.original}-${i}`}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 320, damping: 26 }}
                        className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5"
                      >
                        <div className="mb-1 flex items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              KIND_STYLE[change.kind] ?? KIND_STYLE.grammar,
                            )}
                          >
                            {change.kind}
                          </span>
                          <p className="truncate text-[11px] text-slate-500">{change.reason}</p>
                        </div>
                        <p className="text-[13px]">
                          <span className="text-rose-300/80 line-through decoration-rose-400/50">
                            {change.original || "∅"}
                          </span>
                          <span className="mx-1.5 text-slate-600">→</span>
                          <span className="font-medium text-emerald-300">
                            {change.replacement || "∅"}
                          </span>
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-center text-xs text-emerald-300">
                    Nothing to fix — your writing is tidy.
                  </p>
                )}
  
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Corrected text
                  </p>
                  <div
                    className="editor-body max-h-56 overflow-y-auto rounded-xl border border-white/[0.07] bg-black/25 p-3 text-[13.5px] text-slate-300"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-10 text-center text-sm text-slate-500"
              >
                Press <span className="accent-text">Ctrl</span> +{" "}
                <span className="accent-text">Shift</span> +{" "}
                <span className="accent-text">P</span> to proofread this note.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
  
        {!proof.running && result && (
          <div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
            <button
              onClick={apply}
              disabled={unchanged}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl accent-gradient px-3 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> Apply
            </button>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(result.corrected);
                toast("Corrected text copied", "success");
              }}
              title="Copy corrected text"
              className="icon-btn h-10 w-10 border border-white/10"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={reject}
              title="Keep my version"
              className="icon-btn h-10 w-10 border border-white/10"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </div>
        )}
    </PanelShell>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const tone = pct >= 90 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="97.4"
          initial={{ strokeDashoffset: 97.4 }}
          animate={{ strokeDashoffset: 97.4 * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">
        {pct}
      </span>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
