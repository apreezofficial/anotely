"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./ui";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Live demo" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string>("");

  // pill style flips once you leave the hero; clear active state back at the top
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 200) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // track which section sits in the middle of the viewport
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      Boolean,
    ) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // esc closes the mobile menu, and it auto-closes if you resize up to desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* the pill */}
        <div
          className={cn(
            "flex h-14 items-center justify-between rounded-full border pl-4 pr-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 md:grid md:grid-cols-[1fr_auto_1fr]",
            scrolled
              ? "border-white/10 bg-ink-900/80 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.8)]"
              : "border-white/[0.06] bg-white/[0.03]",
          )}
        >
          {/* logo */}
          <a
            href="#top"
            className="flex items-center gap-2.5 justify-self-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <motion.span
              whileHover={reduce ? undefined : { rotate: -8, scale: 1.06 }}
              className="grid h-8 w-8 place-items-center rounded-full accent-gradient shadow-[0_10px_30px_-10px_rgba(139,92,246,0.9)]"
            >
              <Sparkles className="h-[17px] w-[17px] text-white" strokeWidth={2.4} />
            </motion.span>
            <span className="font-display text-[17px] font-semibold tracking-tight text-white">
              Anotely
            </span>
          </a>

          {/* centered links */}
          <nav
            className="hidden items-center md:flex"
            onMouseLeave={() => setHovered(null)}
            aria-label="Primary"
          >
            {LINKS.map((link) => {
              const isActive = active === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm transition-colors focus-visible:outline-none",
                    isActive || hovered === link.href ? "text-white" : "text-slate-400",
                  )}
                >
                  {hovered === link.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full accent-gradient"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* actions */}
          <div className="hidden items-center gap-2 justify-self-end md:flex">
            <Button variant="quiet" size="sm" className="rounded-full">
              Sign in
            </Button>
            <Button size="sm" className="rounded-full">
              Download free
            </Button>
          </div>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* mobile dropdown, floats under the pill */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="mt-2 origin-top rounded-3xl border border-white/10 bg-ink-900/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl md:hidden"
            >
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm transition hover:bg-white/[0.05] hover:text-white",
                    active === link.href ? "bg-white/[0.05] text-white" : "text-slate-300",
                  )}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 p-1">
                <Button variant="quiet" className="rounded-full" onClick={() => setOpen(false)}>
                  Sign in
                </Button>
                <Button className="rounded-full" onClick={() => setOpen(false)}>
                  Download free
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}