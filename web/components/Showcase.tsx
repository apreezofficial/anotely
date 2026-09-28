"use client";

import { motion } from "framer-motion";
import { Mic, Sparkles, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Section, fadeUp, stagger } from "./ui";

export function Showcase() {
  return (
    <Section className="py-10">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="text-center">
        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          The whole flow, one screen
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-slate-400">
          No modes, no menus to learn. Talk at the note, review the proof, keep what you meant.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        variants={stagger(0.1, 0.12)}
        className="mt-14 grid gap-10 lg:grid-cols-3 lg:items-center"
      >
        <motion.div variants={fadeUp} whileHover={{ y: -6 }} className="space-y-2">
          <PhoneFrame>
            <div className="space-y-3 p-4">
              <p className="text-[11px] text-slate-500">Today</p>
              {[
                { title: "Product sync notes", time: "2m ago", active: true },
                { title: "Lisbon itinerary", time: "1h ago" },
                { title: "Reading list", time: "yesterday" },
                { title: "Standup — Friday", time: "yesterday" },
              ].map((note) => (
                <div
                  key={note.title}
                  className={`rounded-xl px-3 py-2.5 ${note.active ? "bg-white/[0.07]" : ""}`}
                >
                  <p className="text-[13px] font-medium text-slate-100">{note.title}</p>
                  <p className="text-[10.5px] text-slate-500">{note.time}</p>
                </div>
              ))}
            </div>
          </PhoneFrame>
        </motion.div>

        <motion.div variants={fadeUp} whileHover={{ y: -6 }} className="space-y-2">
          <PhoneFrame>
            <div className="flex h-full flex-col p-4">
              <p className="text-[11px] text-slate-500">Edited just now · 61 words</p>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                <span className="font-display text-base font-semibold text-white">Product sync</span>
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                ok so the main thing is uh the onboarding is still taking nineteen minutes which is way
                too long for a trial user
              </p>
              <div className="mt-auto flex items-center gap-2 pt-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-900">
                  <Mic className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] italic text-accent-300">listening… say “anotely done”</p>
                  <div className="mt-1 flex items-end gap-[2px]">
                    {[6, 12, 8, 16, 10, 5].map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-[3px] rounded-full accent-gradient"
                        animate={{ height: [4, h + 6, 4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </motion.div>

        <motion.div variants={fadeUp} whileHover={{ y: -6 }} className="space-y-2">
          <PhoneFrame>
            <div className="flex h-full flex-col p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg accent-gradient">
                  <Wand2 className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">AI proofread</p>
                  <p className="text-[10px] text-slate-500">5 improvements · score 92</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { from: "uh", to: "—", kind: "filler" },
                  { from: "which is way too long", to: "far too long", kind: "clarity" },
                  { from: "nineteen minutes", to: "19 minutes", kind: "style" },
                ].map((c) => (
                  <div
                    key={c.to}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5"
                  >
                    <span className="rounded-md border border-violet-400/25 bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-violet-300">
                      {c.kind}
                    </span>
                    <p className="mt-1.5 text-[12px]">
                      <span className="text-rose-300/80 line-through">{c.from}</span>
                      <span className="mx-1.5 text-slate-600">→</span>
                      <span className="text-emerald-300">{c.to}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 pt-4">
                <span className="flex-1 rounded-lg accent-gradient py-2 text-center text-[12px] font-semibold text-white">
                  Apply all
                </span>
                <span className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-slate-300">
                  Keep mine
                </span>
              </div>
            </div>
          </PhoneFrame>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500"
      >
        <Sparkles className="h-4 w-4 text-accent-400" />
        Works on desktop and phone — same notes, same flow.
      </motion.div>
    </Section>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[9/19] w-[15rem] rounded-[2rem] border border-white/10 bg-ink-900 p-2 shadow-[0_50px_120px_-40px_rgba(0,0,0,1)]">
      <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-ink-850 to-ink-950">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        {children}
      </div>
    </div>
  );
}
