import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Hash,
  Moon,
  Pin,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore, type View } from "@/store";
import { cn, relativeTime, snippet } from "@/lib/utils";
import { MotionIconButton } from "./ui";

const NAV: { key: View | "pinned" | "starred" | "archive"; label: string; icon: typeof FileText }[] = [
  { key: "notes", label: "All notes", icon: FileText },
  { key: "pinned", label: "Pinned", icon: Pin },
  { key: "starred", label: "Starred", icon: Star },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "trash", label: "Trash", icon: Trash2 },
];

export function Sidebar({ filter, setFilter }: { filter: string; setFilter: (f: string) => void }) {
  const notes = useStore((s) => s.notes);
  const activeId = useStore((s) => s.activeId);
  const settings = useStore((s) => s.settings);
  const createNote = useStore((s) => s.createNote);
  const select = useStore((s) => s.select);
  const setView = useStore((s) => s.setView);
  const setQuery = useStore((s) => s.setQuery);
  const updateSettings = useStore((s) => s.updateSettings);
  const view = useStore((s) => s.view);
  const [query, setLocalQuery] = useState("");

  const live = useMemo(
    () => notes.filter((n) => n.folder !== "trash"),
    [notes],
  );
  const tags = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of live) for (const t of n.tags) map.set(t, (map.get(t) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [live]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = live;
    if (filter === "pinned") list = list.filter((n) => n.pinned);
    if (filter === "starred") list = list.filter((n) => n.starred);
    if (filter === "archive") list = list.filter((n) => n.folder === "archive");
    if (filter.startsWith("tag:")) list = list.filter((n) => n.tags.includes(filter.slice(4)));
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [live, filter, query]);

  const totalWords = live.reduce((sum, n) => sum + n.wordCount, 0);
  const light = settings.theme === "light";

  return (
    <motion.aside
      animate={{ width: settings.sidebarWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <motion.div
          className="grid h-9 w-9 place-items-center rounded-xl accent-gradient shadow-[0_8px_24px_-8px_var(--accent-ring)]"
          whileHover={{ rotate: -8, scale: 1.06 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[15px] font-semibold tracking-tight text-white">
            Anotely
          </h1>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">
            speak · write · polish
          </p>
        </div>
        <MotionIconButton
          className="h-7 w-7"
          title="Collapse sidebar"
          onClick={() =>
            void updateSettings({
              sidebarWidth: settings.sidebarWidth > 210 ? 64 : 288,
            })
          }
        >
          {settings.sidebarWidth > 210 ? (
            <ChevronsLeft className="h-4 w-4" />
          ) : (
            <ChevronsRight className="h-4 w-4" />
          )}
        </MotionIconButton>
      </div>

      <div className="px-3 pb-3">
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setView("notes");
            void createNote();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl accent-gradient px-3 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_var(--accent-ring)]"
        >
          <motion.span
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
          </motion.span>
          {settings.sidebarWidth > 210 ? "New note" : ""}
        </motion.button>
      </div>

      {settings.sidebarWidth > 210 && (
        <>
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setQuery(e.target.value);
                }}
                placeholder="Search notes…"
                className="w-full rounded-xl border border-white/[0.07] bg-black/25 py-2 pl-8.5 pr-3 text-[13px] text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[var(--accent-from)] focus:ring-2 focus:ring-[var(--accent-ring)]"
              />
            </div>
          </div>

          <nav className="space-y-0.5 px-2">
            {NAV.map((item) => (
              <NavItem
                key={item.key}
                label={item.label}
                icon={<item.icon className="h-4 w-4" />}
                active={filter === item.key}
                onClick={() => {
                  setView("notes");
                  setFilter(item.key);
                }}
              />
            ))}
          </nav>

          {tags.length > 0 && (
            <div className="mt-4 px-2">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                <AnimatePresence initial={false}>
                  {tags.map(([tag, count]) => (
                    <motion.button
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={() => {
                        setView("notes");
                        setFilter(`tag:${tag}`);
                      }}
                      className={cn(
                        "pill transition hover:border-white/25 hover:text-white",
                        filter === `tag:${tag}` && "border-transparent accent-gradient text-white",
                      )}
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                      <span className="text-slate-500">{count}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {filter === "pinned"
                ? "Pinned"
                : filter === "starred"
                  ? "Starred"
                  : filter === "archive"
                    ? "Archive"
                    : filter.startsWith("tag:")
                      ? "Tagged"
                      : query
                        ? "Results"
                        : "Recent"}
              <span className="ml-1 text-slate-700">{filtered.length}</span>
            </p>
            <div className="space-y-1">
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.slice(0, 60).map((note) => (
                  <motion.button
                    key={note.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    onClick={() => {
                      setView("notes");
                      select(note.id);
                    }}
                    className={cn(
                      "group relative w-full rounded-xl px-3 py-2.5 text-left transition-colors",
                      activeId === note.id
                        ? "bg-white/[0.07]"
                        : "hover:bg-white/[0.035]",
                    )}
                  >
                    {activeId === note.id && (
                      <motion.span
                        layoutId="active-note"
                        className="absolute left-0 top-2.5 h-8 w-[3px] rounded-full accent-gradient"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-100">
                        {note.title || "Untitled note"}
                      </p>
                      {note.pinned && <Pin className="h-3 w-3 shrink-0 accent-text" />}
                      {note.starred && <Star className="h-3 w-3 shrink-0 text-amber-300" />}
                    </div>
                    <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                      {snippet(note.content, 70) || "Empty note"}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                      {relativeTime(note.updatedAt)}
                    </p>
                  </motion.button>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-slate-600">
                  Nothing here yet. Press the mic and start talking.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex items-center gap-1 border-t border-white/[0.06] px-3 py-2.5">
        {settings.sidebarWidth > 210 && (
          <p className="flex-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-300">{totalWords.toLocaleString()}</span>{" "}
            words
          </p>
        )}
        <MotionIconButton
          className="h-8 w-8"
          title={light ? "Dark theme" : "Light theme"}
          onClick={() =>
            void updateSettings({ theme: light ? "dark" : "light" })
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={light ? "sun" : "moon"}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.22 }}
            >
              {light ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </MotionIconButton>
        <MotionIconButton
          className="h-8 w-8"
          title="Accent colour"
          onClick={() => setView("settings")}
        >
          <span
            className="h-3.5 w-3.5 rounded-full accent-gradient"
            style={{ boxShadow: "0 0 12px -2px var(--accent-ring)" }}
          />
        </MotionIconButton>
        <MotionIconButton
          className={cn("h-8 w-8", view === "settings" && "icon-btn-active")}
          title="Settings"
          onClick={() => setView("settings")}
        >
          <motion.span
            animate={{ rotate: view === "settings" ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <SettingsIcon className="h-4 w-4" />
          </motion.span>
        </MotionIconButton>
      </div>
    </motion.aside>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors",
        active ? "text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}
