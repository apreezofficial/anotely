import { motion } from "framer-motion";
import { FilePlus2, Mic, SearchX, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "@/store";

export function EmptyState({ kind }: { kind: "none" | "search" | "trash" }) {
  const createNote = useStore((s) => s.createNote);
  const setView = useStore((s) => s.setView);
  const dispatch = useStore((s) => s.dictation);

  if (kind === "search") {
    return (
      <Centered
        icon={
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            <SearchX className="h-7 w-7 accent-text" />
          </motion.span>
        }
        title="No matches"
        body="Try another word, or search titles, body text and tags."
        actions={
          <button onClick={() => setView("notes")} className="pill transition hover:text-white">
            back to notes
          </button>
        }
      />
    );
  }

  if (kind === "trash") {
    return (
      <Centered
        icon={
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Trash2 className="h-7 w-7 text-slate-500" />
          </span>
        }
        title="Trash is empty"
        body="Deleted notes rest here for a while before you purge them."
        actions={null}
      />
    );
  }

  return (
    <Centered
      icon={
        <div className="relative grid h-24 w-24 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full accent-gradient opacity-40 blur-md"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="relative grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-ink-900"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic className="h-7 w-7 accent-text" />
          </motion.span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full accent-gradient"
              animate={{
                x: [0, 0],
                scale: [1, 1.6, 1],
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
              style={{ top: 6, left: 8 + i * 12 }}
            />
          ))}
        </div>
      }
      title={dispatch.state !== "idle" ? "Listening…" : "Tap the mic and start talking"}
      body={
        dispatch.state !== "idle"
          ? "Everything you say becomes text. Say “new paragraph” to break, and “anotely done” to let AI proofread it."
          : "Auto Write turns your voice into clean notes, then polishes them with AI the moment you say you're done."
      }
      actions={
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => void createNote()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <FilePlus2 className="h-4 w-4" /> Blank note
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => useStore.getState().toast("Press the mic below to talk", "info")}
            className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> How it works
          </motion.button>
        </div>
      }
    />
  );
}

function Centered({
  icon,
  title,
  body,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actions: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center lg:px-10"
    >
      {icon}
      <div className="max-w-md space-y-1.5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-500">{body}</p>
      </div>
      {actions}
    </motion.div>
  );
}
