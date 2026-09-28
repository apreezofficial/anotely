"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Mic, Sparkles, Wand2 } from "lucide-react";
import { Button, Eyebrow, GradientField, Orb, fadeUp, stagger } from "./ui";

const PLATFORMS = ["Windows", "macOS", "Linux", "iOS", "Android"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <GradientField />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div initial="hidden" animate="show" variants={stagger(0.05)}>
          <motion.div variants={fadeUp}>
            <Eyebrow>Launching October 1</Eyebrow>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            Talk.
            <br />
            Anotely <span className="accent-text">writes</span>.
            <br />
            AI <span className="accent-text">polishes</span> it.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-400">
            The voice-first notes app. Dictate naturally — Auto Write turns speech into clean,
            punctuated text as you talk. Say{" "}
            <span className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-accent-300">
              “anotely done”
            </span>{" "}
            and an AI proofreads the whole note before a single change is applied.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="group">
              Download for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Mic className="h-4 w-4" /> Hear it work
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-slate-500">
            {["No account needed", "Works offline", "Your notes stay on your device"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-2">
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[12px] text-slate-400"
              >
                {platform}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.25),transparent_65%)] blur-2xl" />
          <AppMock />
        </motion.div>
      </div>
    </section>
  );
}

function AppMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 shadow-[0_50px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-[11px] text-slate-500">Anotely</span>
      </div>

      <div className="grid grid-cols-[0.85fr_1.6fr]">
        <div className="space-y-2 border-r border-white/[0.06] p-3">
          <div className="rounded-lg accent-gradient px-3 py-1.5 text-[11px] font-semibold text-white">
            + New note
          </div>
          {["Weekly review", "Trip to Lisbon", "Book notes", "Ideas"].map((title, i) => (
            <div
              key={title}
              className={`rounded-lg px-3 py-2 ${i === 1 ? "bg-white/[0.07]" : "opacity-70"}`}
            >
              <p className="text-[11.5px] font-medium text-slate-200">{title}</p>
              <p className="truncate text-[10px] text-slate-500">
                {i === 1 ? "so um the flight is at nine on…" : "3 notes · edited today"}
              </p>
            </div>
          ))}
        </div>

        <div className="relative min-h-[19rem] p-4">
          <p className="font-display text-[15px] font-semibold text-white">Trip to Lisbon</p>
          <p className="mt-1 text-[11px] text-slate-500">Edited just now · 84 words</p>

          <div className="mt-4 space-y-2 text-[12.5px] leading-relaxed text-slate-300">
            <p>
              Flight lands at nine on the{" "}
              <span className="rounded bg-emerald-400/10 px-1 text-emerald-300">Tuesday</span> so we
              can drop the bags at the apartment before lunch.
            </p>
            <p className="text-slate-500">
              book the tram 28 ticket <span className="text-slate-600">·</span>{" "}
              <span className="rounded bg-white/10 px-1">ruf</span>{" "}
              <span className="rounded bg-white/10 px-1">alfama</span> apartment{" "}
              <span className="rounded bg-rose-400/10 px-1 text-rose-300">checkin is after four</span>
            </p>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <Orb size={64} level={0.5}>
              <Mic className="h-5 w-5 text-white" />
            </Orb>
            <div className="flex-1 pb-1">
              <p className="text-[11.5px] italic text-accent-300">so the checkin is after four ok</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                say “anotely done” to proofread
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md accent-gradient">
              <Wand2 className="h-3.5 w-3.5 text-white" />
            </span>
            <p className="flex-1 text-[11px] text-slate-300">
              <span className="text-emerald-300">3 improvements</span> · score 94
            </p>
            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium text-white">
              Apply
            </span>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}

export function SparkleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Sparkles className="h-3.5 w-3.5" /> AI
    </span>
  );
}
