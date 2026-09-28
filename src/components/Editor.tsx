import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Check,
  Copy,
  Eye,
  EyeOff,
  Hash,
  Pin,
  PinOff,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/store";
import { NOTE_COLORS, cn, readTime, relativeTime } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import { dictationCursor } from "@/lib/cursor";
import { MotionIconButton } from "./ui";
import type { Note } from "@/lib/types";

export function Editor({
  note,
  onProofread,
  onOpenAssistant,
  dictation,
}: {
  note: Note;
  onProofread: () => void;
  onOpenAssistant: () => void;
  dictation: { active: boolean; interim: string; level: number };
}) {
  const patchNote = useStore((s) => s.patchNote);
  const trashNote = useStore((s) => s.trashNote);
  const createNote = useStore((s) => s.createNote);
  const select = useStore((s) => s.select);
  const settings = useStore((s) => s.settings);
  const setPanel = useStore((s) => s.setPanel);
  const toast = useStore((s) => s.toast);

  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showTags, setShowTags] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const autoSize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    autoSize(titleRef.current);
  }, [note.title]);

  useLayoutEffect(() => {
    autoSize(bodyRef.current);
    if (!dictation.active) dictationCursor.offset = note.content.length;
  }, [note.content, note.id, dictation.active]);

  useEffect(() => {
    setSavedFlash(true);
    const t = window.setTimeout(() => setSavedFlash(false), 1200);
    return () => window.clearTimeout(t);
  }, [note.updatedAt]);

  const html = useMemo(
    () => (preview ? markdownToHtml(note.content) : ""),
    [preview, note.content],
  );

  const trackCaret = () => {
    if (bodyRef.current) dictationCursor.offset = bodyRef.current.selectionStart;
  };

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, "");
    if (!value) return;
    if (!note.tags.includes(value)) {
      patchNote(note.id, { tags: [...note.tags, value] });
    }
    setTagInput("");
  };

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-start gap-3 border-b border-white/[0.06] px-7 pb-4 pt-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {note.color && (
                <motion.span
                  layoutId="note-color-dot"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: NOTE_COLORS.find((c) => c.key === note.color)?.dot,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </AnimatePresence>
            <textarea
              ref={titleRef}
              rows={1}
              value={note.title}
              onChange={(e) => patchNote(note.id, { title: e.target.value })}
              placeholder="Untitled note"
              className="w-full resize-none overflow-hidden bg-transparent font-display text-2xl font-semibold tracking-tight text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>Edited {relativeTime(note.updatedAt)}</span>
            <span className="text-slate-700">•</span>
            <span>{note.wordCount.toLocaleString()} words</span>
            <span className="text-slate-700">•</span>
            <span>{readTime(note.wordCount)}</span>
            <AnimatePresence>
              {note.lastProofreadAt && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1 rounded-full accent-gradient px-2 py-0.5 font-medium text-white"
                >
                  <Sparkles className="h-3 w-3" /> polished
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {savedFlash && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1 text-emerald-400"
                >
                  <Check className="h-3 w-3" /> saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <MotionIconButton
            title="AI proofread now (Ctrl+Shift+P)"
            onClick={onProofread}
            className="text-[var(--accent-text)]"
          >
            <Wand2 className="h-4 w-4" />
          </MotionIconButton>
          <MotionIconButton
            title="Ask AI about this note"
            onClick={onOpenAssistant}
          >
            <Sparkles className="h-4 w-4" />
          </MotionIconButton>
          <MotionIconButton
            className={cn(preview && "icon-btn-active")}
            title={preview ? "Edit mode" : "Preview (Ctrl+/)"}
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </MotionIconButton>
          <MotionIconButton
            className={cn(note.starred && "icon-btn-active text-amber-300")}
            title="Star"
            onClick={() => patchNote(note.id, { starred: !note.starred })}
          >
            <Star className="h-4 w-4" fill={note.starred ? "currentColor" : "none"} />
          </MotionIconButton>
          <MotionIconButton
            className={cn(note.pinned && "icon-btn-active")}
            title={note.pinned ? "Unpin" : "Pin to top"}
            onClick={() => patchNote(note.id, { pinned: !note.pinned })}
          >
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </MotionIconButton>
          <MotionIconButton
            title="Copy text"
            onClick={() => {
              void navigator.clipboard.writeText(note.content);
              toast("Copied to clipboard", "success");
            }}
          >
            <Copy className="h-4 w-4" />
          </MotionIconButton>
          <MotionIconButton
            title={note.folder === "archive" ? "Move to notes" : "Archive"}
            onClick={() =>
              patchNote(note.id, {
                folder: note.folder === "archive" ? "notes" : "archive",
              })
            }
          >
            {note.folder === "archive" ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </MotionIconButton>
          <MotionIconButton
            title="Delete note"
            className="hover:text-rose-400"
            onClick={() => {
              void trashNote(note.id);
              select(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </MotionIconButton>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-40 pt-5">
        {preview ? (
          <div
            className="editor-body max-w-3xl select-text text-slate-300"
            style={{ fontSize: settings.fontSize }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="relative max-w-3xl">
            <textarea
              ref={bodyRef}
              value={note.content}
              onChange={(e) => patchNote(note.id, { content: e.target.value })}
              onSelect={trackCaret}
              onClick={trackCaret}
              onKeyUp={trackCaret}
              placeholder="Start talking — press the mic, or just type. Say “new paragraph” to break, “anotely done” to proofread."
              className="editor-body w-full resize-none overflow-hidden bg-transparent text-slate-300 outline-none placeholder:text-slate-600"
              style={{ fontSize: settings.fontSize }}
              spellCheck
            />

            <AnimatePresence>
              {dictation.active && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-1 flex items-start gap-2 text-[15px] italic text-[var(--accent-text)]"
                  style={{ fontSize: settings.fontSize }}
                >
                  <motion.span
                    className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full accent-gradient"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>
                    {dictation.interim || "listening…"}
                    <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-current animate-caret-blink" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTags((s) => !s)}
            className="pill transition hover:border-white/25 hover:text-white"
          >
            <Hash className="h-3 w-3" />
            {note.tags.length ? `${note.tags.length} tags` : "Add tags"}
          </button>

          {NOTE_COLORS.map((c) => (
            <button
              key={c.key}
              title={c.key}
              onClick={() =>
                patchNote(note.id, { color: note.color === c.key ? null : c.key })
              }
              className={cn(
                "h-4 w-4 rounded-full transition-transform hover:scale-125",
                note.color === c.key
                  ? "ring-2 ring-white/70 ring-offset-2 ring-offset-ink-950"
                  : "opacity-60 hover:opacity-100",
              )}
              style={{ background: c.dot }}
            />
          ))}

          <AnimatePresence>
            {showTags && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence initial={false}>
                    {note.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="pill accent-gradient border-transparent text-white"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            patchNote(note.id, {
                              tags: note.tags.filter((t) => t !== tag),
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <input
                  autoFocus
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                    if (e.key === "Escape") setShowTags(false);
                  }}
                  onBlur={addTag}
                  placeholder="tag…"
                  className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs outline-none focus:border-[var(--accent-from)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {note.folder === "trash" && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-3 bg-rose-500/10 py-2 text-xs text-rose-300 backdrop-blur">
          <Trash2 className="h-3.5 w-3.5" />
          This note is in the trash
          <button
            className="underline underline-offset-2"
            onClick={() => {
              void useStore.getState().restoreNote(note.id);
              patchNote(note.id, { folder: "notes" });
            }}
          >
            Restore
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between px-7 py-2 text-[10.5px] uppercase tracking-wider text-slate-600">
        <span>{note.charCount.toLocaleString()} characters</span>
        <button
          className="pointer-events-auto transition hover:text-slate-300"
          onClick={() => {
            void createNote();
            select(null);
            setPanel("none");
          }}
        >
          new note
        </button>
      </div>
    </div>
  );
}
