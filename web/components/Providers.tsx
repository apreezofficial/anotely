"use client";

import { motion } from "framer-motion";
import { Section, fadeUp, stagger } from "./ui";

const MODELS = [
  "Claude",
  "GPT-4o",
  "Gemini",
  "Llama",
  "Groq Whisper",
  "OpenAI Whisper",
  "Ollama",
  "OpenRouter",
  "Mistral",
  "Qwen",
  "faster-whisper",
  "whisper.cpp",
];

export function Providers() {
  const row = [...MODELS, ...MODELS];

  return (
    <Section className="py-16">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="text-center">
        <motion.h2 variants={fadeUp} className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Bring your own model
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-xl text-slate-400">
          Anotely never sells you a subscription on someone else’s AI. Pick a cloud provider, or run
          everything locally through Ollama and never touch the internet.
        </motion.p>
      </motion.div>

      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <motion.div
          className="flex w-max gap-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-slate-300"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
