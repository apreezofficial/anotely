import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Undo2, X } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

const TONES = {
  info: "border-white/10 bg-ink-850/95 text-slate-200",
  success: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-400/25 bg-rose-500/10 text-rose-200",
};

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[26rem] max-w-[90vw] -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "pointer-events-auto flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] shadow-[0_18px_50px_-20px_rgba(0,0,0,1)] backdrop-blur-xl",
                TONES[toast.tone],
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{toast.message}</span>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.run();
                    dismiss(toast.id);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium transition hover:bg-white/20"
                >
                  <Undo2 className="h-3 w-3" />
                  {toast.action.label}
                </button>
              )}
              <button onClick={() => dismiss(toast.id)} className="opacity-50 transition hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
