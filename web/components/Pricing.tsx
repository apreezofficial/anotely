"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button, Section, fadeUp, stagger } from "./ui";

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "For capturing thoughts",
    features: [
      "Unlimited notes",
      "Auto Write with built-in speech",
      "Smart punctuation & voice commands",
      "Tags, colours, pin, archive, trash",
      "Full-text search",
    ],
    cta: "Download free",
  },
  {
    name: "Pro",
    monthly: 9,
    yearly: 7,
    tagline: "For the AI layer",
    popular: true,
    features: [
      "Everything in Free",
      "AI proofread on “done”",
      "Whisper transcription (Groq / OpenAI / local)",
      "AI assistant: summaries, actions, rewrites",
      "Bring any model: Claude, GPT, Gemini, Ollama",
      "Priority support",
    ],
    cta: "Start 14-day trial",
  },
  {
    name: "Lifetime",
    monthly: 79,
    yearly: 79,
    tagline: "One payment, launch price forever",
    lifetime: true,
    features: [
      "Everything in Pro, permanently",
      "Free updates for life",
      "Early-bird price locked until October 1",
      "Support a small indie app",
    ],
    cta: "Get lifetime",
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <Section id="pricing">
      <motion.div initial="hidden" whileInView="show" variants={stagger(0.05)} className="text-center">
        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Simple pricing. No note limits.
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-slate-400">
          Use your own AI keys, so your cost stays with your provider — or use the free built-in
          speech engine and pay nothing at all.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-7 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {[
            { label: "Monthly", value: false },
            { label: "Yearly −20%", value: true },
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => setYearly(option.value)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-[13px] font-medium transition",
                yearly === option.value ? "text-white" : "text-slate-400 hover:text-white",
              )}
            >
              {yearly === option.value && (
                <motion.span layout className="absolute inset-0 rounded-full accent-gradient" />
              )}
              <span className="relative">{option.label}</span>
            </button>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        variants={stagger(0.05, 0.1)}
        className="mt-10 grid gap-4 lg:grid-cols-3"
      >
        {PLANS.map((plan) => {
          const price = plan.lifetime ? plan.monthly : yearly ? plan.yearly : plan.monthly;
          return (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className={cn(
                "card relative flex flex-col p-6",
                plan.popular && "border-accent-500/40 shadow-[0_40px_100px_-50px_rgba(139,92,246,0.9)]",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full accent-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}

              <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-[13px] text-slate-500">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="font-display text-4xl font-semibold text-white"
                  >
                    ${price}
                  </motion.span>
                </AnimatePresence>
                <span className="pb-1.5 text-sm text-slate-500">
                  {plan.lifetime ? "once" : "/month"}
                </span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full" variant={plan.popular ? "primary" : "ghost"}>
                {plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      <p className="mt-6 text-center text-xs text-slate-600">
        Prices in USD. Early-bird lifetime pricing ends October 1. Cancel any time.
      </p>
    </Section>
  );
}
