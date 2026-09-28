import { AnimatePresence, motion } from "framer-motion";
import {
  CornerDownLeft,
  FileText,
  Mic,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/store";
import { cn, relativeTime, snippet } from "@/lib/utils";

export interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: typeof FileText;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onToggleDictation,
  onProofread,
}: {
  open: boolean;
  onClose: () => void;
  onToggleDictation: () => void;
  onProofread: () => void;
}) {
  const notes = useStore((s) => s.notes);
  const select = useStore((s) => s.select);
  const setView = useStore((s) => s.setView);
  const createNote = useStore((s) => s.createNote);
  const emptyTrash = useStore((s) => s.emptyTrash);
  const updateSettings = useStore((s) => s.updateSettings);
  const theme = useStore((s) => s.settings.theme);
  const dictating = useStore((s) => s.dictation.state !== "idle");
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "new",
        label: "New note",
        icon: FileText,
        run: () => void createNote(),
      },
      {
        id: "dictate",
        label: dictating ? "Stop Auto Write" : "Start Auto Write",
        hint: "Ctrl+Shift+Space",
        icon: Mic,
        run: onToggleDictation,
      },
      {
        id: "proof",
        label: "Proofread this note",
        hint: "Ctrl+Shift+P",
        icon: Wand2,
        run: onProofread,
      },
      {
        id: "assistant",
        label: "Ask the AI assistant",
        icon: Sparkles,
        run: () => useStore.getState().setPanel("assistant"),
      },
      {
        id: "settings",
        label: "Open settings",
        icon: SettingsIcon,
        run: () => setView("settings"),
      },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: theme === "dark" ? Sun : Moon,
        run: () => void updateSettings({ theme: theme === "dark" ? "light" : "dark" }),
      },
      {
        id: "trash",
        label: "Empty trash",
        icon: Trash2,
        run: () => void emptyTrash(),
      },
    ],
    [
      createNote,
      dictating,
      emptyTrash,
      onProofread,
      onToggleDictation,
      setView,
      theme,
      updateSettings,
    ],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const noteHits = notes
      .filter((n) => n.folder !== "trash")
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 8);
    const commandHits = commands.filter(
      (c) => !q || c.label.toLowerCase().includes(q),
    );
    return [
      ...commandHits.map((c) => ({ type: "command" as const, value: c })),
      ...noteHits.map((n) => ({ type: "note" as const, value: n })),
    ];
  }, [commands, notes, query]);

  useEffect(() => {
    setCursor(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const runAt = (index: number) => {
    const item = results[index];
    if (!item) return;
    if (item.type === "command") {
      item.value.run();
    } else {
      select(item.value.id);
      setView("notes");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-[36rem] max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-[0_40px_100px_-40px_rgba(0,0,0,1)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(c + 1, results.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runAt(cursor);
                  }
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Search notes or run a command…"
                className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
              />
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[22rem] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-600">Nothing matches.</p>
              ) : (
                results.map((item, index) => (
                  <button
                    key={item.type + (item.value as any).id}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => runAt(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      cursor === index ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    {item.type === "command" ? (
                      <>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg accent-gradient">
                          <item.value.icon className="h-4 w-4 text-white" />
                        </span>
                        <span className="flex-1 text-sm text-slate-100">{item.value.label}</span>
                        {item.value.hint && (
                          <span className="text-[10.5px] uppercase tracking-wider text-slate-600">
                            {item.value.hint}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-slate-400">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-slate-100">
                            {item.value.title || "Untitled note"}
                          </span>
                          <span className="block truncate text-[11.5px] text-slate-500">
                            {snippet(item.value.content, 60) || "Empty note"}
                          </span>
                        </span>
                        <span className="text-[10.5px] uppercase tracking-wider text-slate-600">
                          {relativeTime(item.value.updatedAt)}
                        </span>
                      </>
                    )}
                    {cursor === index && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 accent-text" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
