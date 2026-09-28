"use client";

import { motion } from "framer-motion";
import { Github, Loader2, Mail, Sparkles, Twitter } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, GradientField, fadeUp, stagger } from "./ui";

export function FinalCta() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || state === "loading") return;
    setState("loading");
    // TODO: point this at your list provider (Buttondown / Resend / Loops) before launch.
    window.setTimeout(() => setState("done"), 800);
  };

  return (
    <section className="relative px-5 py-24 sm:px-8">
      <GradientField />
      <motion.div
        initial="hidden"
        whileInView="show"
        variants={stagger(0.05)}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900/70 px-6 py-14 text-center shadow-[0_60px_140px_-60px_rgba(0,0,0,1)] backdrop-blur-xl sm:px-12"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl accent-gradient shadow-[0_20px_50px_-20px_rgba(139,92,246,1)]">
            <Sparkles className="h-6 w-6 text-white" />
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Say it out loud. Get it back clean.
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-slate-400">
          Anotely launches October 1. Join the list and you get the early-bird lifetime price plus a
          free month of Pro.
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
            />
          </label>
          <Button type="submit" size="lg" disabled={state === "loading"} className="sm:w-auto">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {state === "done" ? "You're in ✓" : "Get early access"}
          </Button>
        </motion.form>

        <motion.p variants={fadeUp} className="mt-4 text-xs text-slate-600">
          No spam. One launch email, then only when something genuinely ships.
        </motion.p>
      </motion.div>
    </section>
  );
}

const FOOTER = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "Download"],
  },
  {
    title: "Resources",
    links: ["Voice commands", "AI setup", "Local Whisper", "Keyboard shortcuts", "FAQ"],
  },
  {
    title: "Company",
    links: ["About", "Privacy", "Terms", "Contact", "Press kit"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-5 py-12 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl accent-gradient">
              <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
            </span>
            <span className="font-display text-[17px] font-semibold tracking-tight text-white">
              Anotely
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Voice-first notes with AI that proofreads the second you say you’re done.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Twitter, Github, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#top"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {FOOTER.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#top" className="text-sm text-slate-400 transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row">
        <p>© {new Date().getFullYear()} Anotely. All rights reserved.</p>
        <p>Made for people with too much to say.</p>
      </div>
    </footer>
  );
}
