"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Check, Mic, Sparkles, Wand2 } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Button, Eyebrow, GradientField, Orb, fadeUp, stagger } from "./ui";

const PLATFORMS = ["Windows", "macOS", "Linux", "iOS", "Android"];

const chip =
  "rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400";

export function Hero() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  // 0 when the stage enters the bottom of the screen, 1 when it leaves the top
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  // the app mock starts tilted back + small, then stands up as you scroll
  const rotateX = useTransform(p, [0, 0.4], [14, 0]);
  const scale = useTransform(p, [0, 0.4], [0.92, 1]);
  const mockY = useTransform(p, [0, 0.4], [40, 0]);
  const glow = useTransform(p, [0, 0.45], [0.25, 1]);

  return (
    <section id="top" className="relative overflow-x-clip pt-32 pb-24 sm:pt-40">
      <GradientField />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />

      {/* centered copy */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.05)}
        className="relative mx-auto max-w-4xl px-5 text-center sm:px-8"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <Eyebrow>Launching October 1</Eyebrow>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="block text-white">Talk. Anotely writes.</span>
          <span className="block text-slate-500">AI polishes it.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-slate-400"
        >
          The voice-first notes app. Dictate naturally — Auto Write turns speech into clean,
          punctuated text as you talk. Say{" "}
          <span className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-accent-300">
            “anotely done”
          </span>{" "}
          and an AI proofreads the whole note before a single change is applied.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="group rounded-full">
            Download for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Mic className="h-4 w-4" /> Hear it work
          </Button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-slate-500"
        >
          {["No account needed", "Works offline", "Your notes stay on your device"].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll stage: app mock in the middle, cards drift out around it */}
      <motion.div
        ref={stageRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-16 w-full max-w-5xl px-5 sm:mt-20 sm:px-8"
      >
        <motion.div
          style={reduce ? undefined : { opacity: glow }}
          className="absolute left-1/2 top-1/2 h-[85%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.3),transparent_65%)] blur-3xl"
        />

        <div className="relative z-0 mx-auto max-w-2xl [perspective:1400px]">
          <motion.div
            style={reduce ? undefined : { rotateX, scale, y: mockY, transformOrigin: "50% 100%" }}
          >
            <AppMock />
          </motion.div>
        </div>

        {/* desktop floating cards */}
        <FloatCard
          progress={p}
          reduce={reduce}
          className="left-0 top-10 w-56"
          from={{ x: 110, rotate: -6 }}
          drift={110}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-8 w-8 place-items-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full accent-gradient opacity-60" />
              <span className="relative grid h-8 w-8 place-items-center rounded-full accent-gradient">
                <Mic className="h-4 w-4 text-white" />
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white">Listening</p>
              <p className="text-[10.5px] text-slate-500">Auto Write is on</p>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] italic leading-snug text-accent-300">
            flight lands at nine on the tuesday
          </p>
        </FloatCard>

        <FloatCard
          progress={p}
          reduce={reduce}
          className="right-0 top-28 w-56"
          from={{ x: -110, rotate: 5 }}
          drift={150}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md accent-gradient">
              <Wand2 className="h-3.5 w-3.5 text-white" />
            </span>
            <p className="text-[12px] font-medium text-white">Proofread</p>
          </div>
          <dl className="mt-3 divide-y divide-white/[0.06] text-[11px]">
            <Row label="Suggestions" value="3" />
            <Row
              label="Status"
              value={
                <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
                  Ready
                </span>
              }
            />
            <Row label="Score" value="94" />
          </dl>
        </FloatCard>

        <FloatCard
          progress={p}
          reduce={reduce}
          className="bottom-16 left-0 w-56"
          from={{ x: 130, rotate: 4 }}
          drift={90}
        >
          <div className="relative isolate">
            <span className="absolute inset-x-2 -bottom-4 -z-10 h-full rounded-2xl border border-white/[0.06] bg-ink-800/80" />
            <p className="text-[12px] font-medium text-white">Trip to Lisbon</p>
            <p className="mt-0.5 text-[10.5px] text-slate-500">Edited just now · 84 words</p>
          </div>
        </FloatCard>

        <FloatCard
          progress={p}
          reduce={reduce}
          className="bottom-6 right-0 w-56"
          from={{ x: -100, rotate: -4 }}
          drift={60}
        >
          <p className="text-right text-[11px] text-slate-500">Available on</p>
          <div className="mt-2 flex flex-wrap justify-end gap-1.5">
            {PLATFORMS.map((platform) => (
              <span key={platform} className={chip}>
                {platform}
              </span>
            ))}
          </div>
        </FloatCard>

        {/* below lg the cards would sit on top of the mock, so just show platforms */}
        <div className="relative mt-8 flex flex-wrap justify-center gap-2 lg:hidden">
          {PLATFORMS.map((platform) => (
            <span key={platform} className={chip}>
              {platform}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-200">{value}</dd>
    </div>
  );
}

/**
 * Decorative card that flies outward from behind the mock as the stage scrolls
 * into view, then keeps drifting at its own speed for parallax depth.
 */
function FloatCard({
  progress,
  reduce,
  className,
  from,
  drift,
  children,
}: {
  progress: MotionValue<number>;
  reduce: boolean | null;
  className: string;
  from: { x: number; rotate: number };
  drift: number;
  children: ReactNode;
}) {
  const x = useTransform(progress, [0, 0.45], [from.x, 0]);
  const rotate = useTransform(progress, [0, 0.45], [from.rotate, 0]);
  const opacity = useTransform(progress, [0, 0.3], [0, 1]);
  const y = useTransform(progress, [0, 1], [drift / 2, -drift / 2]);

  return (
    <motion.div
      aria-hidden="true"
      style={reduce ? undefined : { x, y, rotate, opacity }}
      className={`pointer-events-none absolute z-10 hidden rounded-2xl border border-white/10 bg-ink-850/90 p-3.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:block ${className}`}
    >
      {children}
    </motion.div>
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