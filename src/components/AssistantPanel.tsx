import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  Bot,
  ListChecks,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@/lib/ipc";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import type { ChatMessage } from "@/lib/types";

const QUICK = [
  { label: "Summarise", icon: Sparkles, prompt: "Summarise this note in 3 bullet points." },
  { label: "Action items", icon: ListChecks, prompt: "List the concrete action items from this note as a checklist." },
  { label: "Tighten", icon: Wand2, prompt: "Rewrite this note so it is shorter and sharper, keeping every fact." },
  { label: "Explain simply", icon: MessageSquare, prompt: "Explain what this note means in plain language for a beginner." },
  { label: "Questions", icon: Bot, prompt: "What questions should I think about after writing this note?" },
  { label: "Continue", icon: ArrowDownToLine, prompt: "Continue this note naturally with the next section." },
];

export function AssistantPanel() {
  const settings = useStore((s) => s.settings);
  const chat = useStore((s) => s.chat);
  const chatBusy = useStore((s) => s.chatBusy);
  const pushChat = useStore((s) => s.pushChat);
  const setChatBusy = useStore((s) => s.setChatBusy);
  const notes = useStore((s) => s.notes);
  const activeId = useStore((s) => s.activeId);
  const patchNote = useStore((s) => s.patchNote);
  const setPanel = useStore((s) => s.setPanel);
  const toast = useStore((s) => s.toast);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const note = notes.find((n) => n.id === activeId);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [chat, chatBusy]);

  const ask = async (question: string) => {
    if (!question.trim() || chatBusy) return;
    const userMessage: ChatMessage = { role: "user", content: question.trim() };
    const history = [...chat, userMessage];
    pushChat(userMessage);
    setInput("");
    setChatBusy(true);
    try {
      const answer = await invoke<string>("ai_ask", {
        req: {
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
          system: "You are Anotely's assistant. Be concise, concrete and warm. Use markdown.",
          note: note?.content ?? "",
          question: userMessage.content,
          history: history.slice(0, -1),
          temperature: 0.4,
          maxTokens: 2048,
        },
      });
      pushChat({ role: "assistant", content: answer });
    } catch (error) {
      pushChat({
        role: "assistant",
        content: `⚠️ ${error instanceof Error ? error.message : "AI request failed"}`,
      });
    } finally {
      setChatBusy(false);
    }
  };

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="relative z-20 h-full shrink-0 overflow-hidden border-l border-white/[0.06] bg-ink-900/70 backdrop-blur-2xl"
    >
      <div className="flex h-full w-[400px] flex-col">
        <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg accent-gradient">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">AI assistant</p>
            <p className="text-[11px] text-slate-500">
              {note ? `Reading “${note.title || "untitled"}”` : "No note open"}
            </p>
          </div>
          <button
            onClick={() => setPanel("none")}
            className="text-slate-500 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-white/[0.06] px-3 py-2.5">
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <motion.button
                key={q.label}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => void ask(q.prompt)}
                className="pill transition hover:border-white/25 hover:text-white"
              >
                <q.icon className="h-3 w-3" />
                {q.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {chat.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl accent-gradient"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <p className="text-sm font-medium text-slate-300">Ask anything about this note</p>
              <p className="mt-1 text-xs text-slate-500">
                Summarise it, pull out action items, or draft the next section.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {chat.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className={cn(
                  "group relative rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                  message.role === "user"
                    ? "ml-8 bg-white/[0.07] text-slate-100"
                    : "mr-6 border border-white/[0.07] bg-black/25 text-slate-300",
                )}
              >
                <div
                  className="editor-body select-text"
                  style={{ fontSize: 13.5 }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }}
                />
                {message.role === "assistant" && note && (
                  <button
                    onClick={() => {
                      patchNote(note.id, {
                        content: `${note.content}\n\n${message.content}`.trim(),
                      });
                      toast("Inserted into note", "success");
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-white"
                  >
                    <ArrowDownToLine className="h-3 w-3" /> insert into note
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {chatBusy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-slate-500"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              thinking…
            </motion.div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          className="flex items-center gap-2 border-t border-white/[0.06] p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this note…"
            className="flex-1 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-[var(--accent-from)] focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.92 }}
            className="grid h-10 w-10 place-items-center rounded-xl accent-gradient text-white disabled:opacity-40"
            disabled={!input.trim() || chatBusy}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </motion.aside>
  );
}
