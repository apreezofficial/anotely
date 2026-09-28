"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Section, fadeUp, stagger } from "./ui";

const FAQS = [
  {
    q: "Does dictation work offline?",
    a: "Yes, if you point the transcription at a local Whisper server (faster-whisper or whisper.cpp) or run Ollama for proofreading. Otherwise the built-in speech engine or a cloud Whisper key does the heavy lifting.",
  },
  {
    q: "Which AI providers are supported?",
    a: "Anthropic Claude, OpenAI, Google Gemini, Groq, OpenRouter, Ollama and any custom OpenAI-compatible endpoint. You paste your own key, so you keep control of cost and data.",
  },
  {
    q: "What exactly happens when I say “anotely done”?",
    a: "Dictation stops, the full note is sent to your configured model, and a review panel opens with a score, every edit, and the reason behind it. Nothing changes until you press Apply.",
  },
  {
    q: "Will AI rewrite what I meant?",
    a: "No. The proofread prompt is explicitly told to preserve meaning, and every change is shown side by side. If the AI overreaches you hit Keep mine and nothing is touched.",
  },
  {
    q: "Where are my notes stored?",
    a: "In a single JSON file in your app data folder, on your machine. No account, no sync, no analytics. Back it up by copying the file.",
  },
  {
    q: "Does it work on a phone?",
    a: "Anotely ships for Windows, macOS, Linux, iOS and Android with the same flow — talk, say done, review the proof.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="text-center">
        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Questions, answered
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        variants={stagger(0.04, 0.06)}
        className="mx-auto mt-10 max-w-2xl divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
      >
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={item.q} variants={fadeUp}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
              >
                <span className="flex-1 text-[15px] font-medium text-white">{item.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
