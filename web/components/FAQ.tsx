"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow, Section, fadeUp, stagger } from "./ui";

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
{
q: "Does dictation work offline?",
a: "Yes. Point transcription at a local Whisper server (faster-whisper or whisper.cpp) and run Ollama for proofreading, and nothing leaves your machine. Otherwise the built-in speech engine or a cloud Whisper key does the work.",
},
{
q: "Which AI providers are supported?",
a: "Anthropic Claude, OpenAI, Google Gemini, Groq, OpenRouter, Ollama and any custom OpenAI-compatible endpoint. You paste your own key, so you control cost and data.",
},
{
q: "What happens when I say “anotely done”?",
a: "Dictation stops and the full note goes to your chosen model. A review panel opens with a score, every edit and the reason behind it. Nothing changes until you press Apply.",
},
{
q: "Will AI rewrite what I meant?",
a: "No. The proofread prompt is told to preserve your meaning, and every change is shown side by side. If the AI overreaches, press Keep mine and your note stays untouched.",
},
{
q: "Where are my notes stored?",
a: "In a single JSON file in your app data folder, on your machine. No account, no sync, no analytics. To back up, copy the file.",
},
{
q: "Does it work on a phone?",
a: "Yes. Anotely runs on Windows, macOS, Linux, iOS and Android with the same flow: talk, say done, review the proof.",
},
];

// Structured data so search engines can show these as rich results.
const JSON_LD = JSON.stringify({
"@context": "https://schema.org",
"@type": "FAQPage",
mainEntity: FAQS.map(({ q, a }) => ({
"@type": "Question",
name: q,
acceptedAnswer: { "@type": "Answer", text: a },
})),
});

export function FAQ() {
const reduce = useReducedMotion();
const uid = useId();
const [open, setOpen] = useState<number | null>(0);
const buttons = useRef<(HTMLButtonElement | null)[]>([]);

// roving focus between questions: arrows, Home, End
const onKeyDown = (e: KeyboardEvent, i: number) => {
const last = FAQS.length - 1;
const next =
e.key === "ArrowDown" ? (i === last ? 0 : i + 1)
: e.key === "ArrowUp" ? (i === 0 ? last : i - 1)
: e.key === "Home" ? 0
: e.key === "End" ? last
: null;
if (next === null) return;
e.preventDefault();
buttons.current[next]?.focus();
};

return (
<Section id="faq">
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />

<motion.div
initial="hidden"
whileInView="show"
viewport={{ once: true, margin: "-80px" }}
variants={stagger(0.05)}
className="mx-auto max-w-2xl text-center"
>
<motion.div variants={fadeUp} className="flex justify-center">
<Eyebrow>FAQ</Eyebrow>
</motion.div>
<motion.h2
variants={fadeUp}
className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]"
>
<span className="block text-white">Questions,</span>
<span className="block text-slate-500">answered.</span>
</motion.h2>
<motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-slate-400">
Privacy, offline use and what the AI is allowed to touch.
</motion.p>
</motion.div>

<motion.div
initial="hidden"
whileInView="show"
viewport={{ once: true, margin: "-80px" }}
variants={stagger(0.05, 0.1)}
className="mx-auto mt-12 flex max-w-2xl flex-col gap-2.5"
>
{FAQS.map((item, i) => {
const isOpen = open === i;
const panelId = `${uid}-panel-${i}`;
const buttonId = `${uid}-button-${i}`;

return (
<motion.div
key={item.q}
variants={fadeUp}
className={cn(
"group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-[background-color,border-color] duration-300",
isOpen
? "border-white/15 bg-white/[0.05]"
: "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]",
)}
>
{/* same violet corner glow as the feature cards, only while open */}
<div
className={cn(
"pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_70%)] transition-opacity duration-500",
isOpen ? "opacity-100" : "opacity-0",
)}
/>

<h3>
<button
ref={(el) => {
buttons.current[i] = el;
}}
id={buttonId}
type="button"
aria-expanded={isOpen}
aria-controls={panelId}
onClick={() => setOpen(isOpen ? null : i)}
onKeyDown={(e) => onKeyDown(e, i)}
className="relative flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
>
<span
className={cn(
"flex-1 text-[15px] font-medium transition-colors",
isOpen ? "text-white" : "text-slate-200 group-hover:text-white",
)}
>
{item.q}
</span>
<motion.span
animate={{ rotate: isOpen ? 45 : 0 }}
transition={
reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }
}
className={cn(
"grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300",
isOpen
? "accent-gradient border-transparent text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]"
: "border-white/10 text-slate-400 group-hover:text-white",
)}
>
<Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
</motion.span>
</button>
</h3>

<AnimatePresence initial={false}>
{isOpen && (
<motion.div
id={panelId}
role="region"
aria-labelledby={buttonId}
initial={{ height: 0, opacity: 0 }}
animate={{ height: "auto", opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={
reduce ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
}
className="relative overflow-hidden"
>
<p className="max-w-[60ch] px-5 pb-5 text-sm leading-relaxed text-slate-400">
{item.a}
</p>
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