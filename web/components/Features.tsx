"use client";

import { motion } from "framer-motion";
import {
  AudioLines,
  FileText,
  Hash,
  Lock,
  MessagesSquare,
  Mic,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Section, fadeUp, stagger } from "./ui";

const FEATURES = [
  {
    icon: Mic,
    title: "Auto Write",
    body: "Press the mic and talk like a human. Anotely commits each sentence the moment you pause, so text lands while you are still thinking.",
  },
  {
    icon: AudioLines,
    title: "Smart punctuation",
    body: "Say “new paragraph”, “comma” or “question mark”. Filler words disappear, contractions appear, and everything is capitalised properly.",
  },
  {
    icon: Wand2,
    title: "Say “done” → AI proofreads",
    body: "Speak your done-phrase and an AI reviews the whole note: grammar, punctuation, clarity. Every edit is shown before it is applied.",
  },
  {
    icon: MessagesSquare,
    title: "An assistant that read the note",
    body: "Summarise, pull out action items, tighten a paragraph or keep writing. One click inserts the answer straight into your note.",
  },
  {
    icon: Search,
    title: "Search that reads everything",
    body: "Full-text across titles, body and tags. Pin, star, colour and archive notes; the sidebar groups them by recency automatically.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Notes live in one local JSON file. Keys stay on your device. Bring your own model, or run everything through Ollama offline.",
  },
];

const SUPPORT = [
  { icon: FileText, label: "Markdown" },
  { icon: Hash, label: "Tags & colours" },
  { icon: Sparkles, label: "AI proofread" },
  { icon: AudioLines, label: "Whisper STT" },
];

export function Features() {
  return (
    <Section id="features">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="max-w-2xl">
        <motion.div variants={fadeUp} className="flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full accent-gradient" />
            Features
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Built for people with more thoughts than hands
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-slate-400">
          Every part of Anotely exists to get words out of your head and into a form worth keeping.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        variants={stagger(0.05, 0.07)}
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="card group relative overflow-hidden p-5"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="grid h-10 w-10 place-items-center rounded-xl accent-gradient shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]">
              <feature.icon className="h-5 w-5 text-white" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{feature.body}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        {SUPPORT.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-400"
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </span>
        ))}
      </motion.div>
    </Section>
  );
}
