"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow, Section, fadeUp, stagger } from "./ui";

type Feature = { icon: LucideIcon; title: string; body: string };

const FEATURES: Feature[] = [
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

// how far (px) each column drifts while scrolling; the middle column moves most
// so the grid staggers as it passes. Index % 3 = column on lg.
const DEPTH = [18, 44, 18];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function Features() {
  const isDesktop = useIsDesktop();

  return (
    <Section id="features">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger(0.05)}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <Eyebrow>Features</Eyebrow>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]"
        >
          <span className="block text-white">Built for people with more thoughts</span>
          <span className="block text-slate-500">than hands.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-slate-400">
          Every part of Anotely exists to get words out of your head and into a form worth keeping.
        </motion.p>
      </motion.div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            feature={feature}
            depth={DEPTH[i % 3]}
            parallax={isDesktop}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 flex flex-wrap items-center justify-center gap-2"
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

/**
 * Each card tracks its own trip through the viewport: it scales/fades in as it
 * enters, and (lg+ only) drifts at its column's speed for parallax depth.
 */
function FeatureCard({
  feature,
  depth,
  parallax,
}: {
  feature: Feature;
  depth: number;
  parallax: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { opacity, scale, y: parallax ? y : 0 }}
      className="card group relative overflow-hidden p-6 transition-colors duration-300 hover:border-white/20"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="grid h-10 w-10 place-items-center rounded-xl accent-gradient shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]">
        <feature.icon className="h-5 w-5 text-white" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{feature.body}</p>
    </motion.div>
  );
}