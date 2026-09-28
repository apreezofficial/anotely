"use client";

import { motion } from "framer-motion";
import { Mic, Sparkles, Wand2 } from "lucide-react";
import { Section, fadeUp, stagger } from "./ui";

const STEPS = [
  {
    icon: Mic,
    title: "Tap the mic",
    body: "No typing, no thinking about structure. Press space or tap once and start talking.",
    accent: "from-accent-500 to-fuchsia-500",
  },
  {
    icon: Sparkles,
    title: "Just talk",
    body: "Anotely writes as you speak, adds punctuation, drops the ums and listens for your done-phrase.",
    accent: "from-fuchsia-500 to-accent-400",
  },
  {
    icon: Wand2,
    title: "Say “anotely done”",
    body: "An AI proofreads the note and shows every change with a reason. Accept all, or keep your words.",
    accent: "from-accent-400 to-emerald-400",
  },
];

export function HowItWorks() {
  return (
    <Section id="how" className="py-10">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="text-center">
        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Three steps. Ten seconds.
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-slate-400">
          The whole loop is muscle memory after the first note.
        </motion.p>
      </motion.div>

      <div className="relative mt-14">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-accent-500/40 via-white/5 to-transparent lg:block" />
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={stagger(0.05, 0.15)}
          className="grid gap-6 lg:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="relative">
              <div className="card h-full p-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${step.accent}`}
                  >
                    <step.icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="font-display text-4xl font-semibold text-white/10">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
