import { AnimatePresence, motion } from "framer-motion";
import { Flame, RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "@/store";
import { EmptyState } from "./EmptyState";
import { relativeTime, snippet } from "@/lib/utils";
import { MotionIconButton } from "./ui";

export function TrashScreen() {
  const notes = useStore((s) => s.notes);
  const restore = useStore((s) => s.restoreNote);
  const purge = useStore((s) => s.purgeNote);
  const emptyTrash = useStore((s) => s.emptyTrash);
  const trashed = notes.filter((n) => n.folder === "trash");

  if (trashed.length === 0) return <EmptyState kind="trash" />;

  return (
    <div className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-white">Trash</h2>
            <p className="text-sm text-slate-500">
              {trashed.length} note{trashed.length === 1 ? "" : "s"} · restore or delete forever
            </p>
          </div>
          <button
            onClick={() => void emptyTrash()}
            className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            <Flame className="h-4 w-4" /> Empty trash
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {trashed.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="surface flex items-center gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {note.title || "Untitled note"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {snippet(note.content, 90) || "Empty note"}
                  </p>
                  <p className="mt-1 text-[10.5px] uppercase tracking-wider text-slate-600">
                    deleted {relativeTime(note.updatedAt)}
                  </p>
                </div>
                <MotionIconButton title="Restore" onClick={() => void restore(note.id)}>
                  <RotateCcw className="h-4 w-4" />
                </MotionIconButton>
                <MotionIconButton
                  title="Delete forever"
                  className="hover:text-rose-400"
                  onClick={() => void purge(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </MotionIconButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
