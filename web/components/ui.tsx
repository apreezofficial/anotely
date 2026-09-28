"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const Cmp = motion[as];
  return (
    <Cmp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </Cmp>
  );
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full accent-gradient" />
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-60";

const variants = {
  primary:
    "accent-gradient text-white shadow-[0_18px_50px_-18px_rgba(139,92,246,0.9)] hover:shadow-[0_22px_60px_-16px_rgba(217,70,239,0.85)] hover:brightness-110",
  ghost: "border border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white",
  quiet: "text-slate-400 hover:text-white",
};

const sizes = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-3",
  lg: "px-6 py-3.5 text-[15px]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button className={cn(buttonBase, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function GradientField({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-40 -top-56 h-[42rem] w-[42rem] animate-float rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_65%)] blur-[100px]" />
      <div className="absolute -right-32 top-1/3 h-[34rem] w-[34rem] animate-float rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.28),transparent_65%)] blur-[110px] [animation-delay:-3s]" />
      <div className="absolute inset-0 noise opacity-[0.03] mix-blend-soft-light" />
    </div>
  );
}

/** The animated mic orb — same language as the app. */
export function Orb({
  level = 0.35,
  active = true,
  size = 96,
  children,
}: {
  level?: number;
  active?: boolean;
  size?: number;
  children: ReactNode;
}) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full accent-gradient"
          animate={active ? { scale: 1 + level * 0.3 + i * 0.12, opacity: 0.3 - i * 0.08 } : { scale: 0.9, opacity: 0.12 }}
          transition={{
            scale: { type: "spring", stiffness: 160, damping: 18 },
            opacity: { duration: 0.3 },
            delay: i * 0.14,
          }}
        />
      ))}
      <span className="relative grid place-items-center rounded-full border border-white/15 bg-ink-900 shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)]">
        {children}
      </span>
    </div>
  );
}
