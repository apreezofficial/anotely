import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Backdrop } from "@/components/Backdrop";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { EmptyState } from "@/components/EmptyState";
import { DictationDock } from "@/components/DictationDock";
import { ProofreadPanel } from "@/components/ProofreadPanel";
import { AssistantPanel } from "@/components/AssistantPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { SettingsScreen } from "@/components/SettingsScreen";
import { TrashScreen } from "@/components/TrashScreen";
import { Onboarding } from "@/components/Onboarding";
import { Preloader } from "@/components/Preloader";
import { Toasts } from "@/components/Toasts";
import { useDictation } from "@/hooks/useDictation";
import { useStore } from "@/store";
import { ACCENTS } from "@/lib/utils";

export default function App() {
  const ready = useStore((s) => s.ready);
  const onboarded = useStore((s) => s.settings.onboarded);
  const notes = useStore((s) => s.notes);
  const activeId = useStore((s) => s.activeId);
  const view = useStore((s) => s.view);
  const panel = useStore((s) => s.panel);
  const dictation = useStore((s) => s.dictation);
  const settings = useStore((s) => s.settings);
  const init = useStore((s) => s.init);
  const createNote = useStore((s) => s.createNote);
  const setPanel = useStore((s) => s.setPanel);

  const [filter, setFilter] = useState("notes");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  const { toggle: toggleDictation } = useDictation();

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setBooted(true), 1150);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    const a = ACCENTS[settings.accent] ?? ACCENTS.violet;
    const root = document.documentElement;
    root.style.setProperty("--accent-from", a.from);
    root.style.setProperty("--accent-to", a.to);
    root.style.setProperty("--accent-ring", a.ring);
    root.style.setProperty("--accent-text", a.text);
    root.style.setProperty("--editor-size", `${settings.fontSize}px`);
    root.classList.toggle("light", settings.theme === "light");
    document.body.classList.toggle("bg-ink-100", settings.theme === "light");
  }, [settings.accent, settings.fontSize, settings.theme]);

  const startProof = () => {
    if (!activeNote) return;
    void useStore.getState().startProof(activeNote.content);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        toggleDictation();
      } else if (meta && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        startProof();
      } else if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (meta && event.key.toLowerCase() === "n") {
        event.preventDefault();
        void createNote();
      } else if (event.key === "Escape") {
        if (paletteOpen) setPaletteOpen(false);
        else if (panel !== "none") setPanel("none");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createNote, panel, paletteOpen, setPanel, toggleDictation]);

  if (!ready) {
    return (
      <div className="grid h-full w-full place-items-center">
        <Backdrop />
      </div>
    );
  }

  if (!onboarded) {
    return (
      <>
        <Preloader visible={!booted} />
        <Backdrop />
        <Onboarding />
        <Toasts />
      </>
    );
  }

  return (
    <div className="flex h-full w-full">
      <Preloader visible={!booted} />
      <Backdrop />
      <Sidebar filter={filter} setFilter={setFilter} />

      <main className="relative flex min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              view === "settings"
                ? "settings"
                : view === "trash"
                  ? "trash"
                  : activeNote
                    ? `note-${activeNote.id}`
                    : filter === "notes"
                      ? "empty"
                      : "empty-filtered"
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="flex min-w-0 flex-1"
          >
            {view === "settings" ? (
              <SettingsScreen />
            ) : view === "trash" ? (
              <TrashScreen />
            ) : activeNote ? (
              <Editor
                note={activeNote}
                onProofread={startProof}
                onOpenAssistant={() => setPanel("assistant")}
                dictation={{
                  active: dictation.state !== "idle",
                  interim: dictation.interim,
                  level: dictation.level,
                }}
              />
            ) : (
              <EmptyState kind={filter === "notes" ? "none" : "search"} />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {panel === "proofread" && <ProofreadPanel key="proof" />}
          {panel === "assistant" && <AssistantPanel key="assistant" />}
        </AnimatePresence>

        <DictationDock
          state={dictation.state}
          level={dictation.level}
          engine={dictation.engine}
          interim={dictation.interim}
          onToggle={toggleDictation}
        />
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleDictation={toggleDictation}
        onProofread={startProof}
      />
      <Toasts />
    </div>
  );
}
