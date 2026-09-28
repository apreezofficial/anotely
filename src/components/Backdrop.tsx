import { motion } from "framer-motion";
import { useStore } from "@/store";
import { ACCENTS } from "@/lib/utils";

export function Backdrop() {
  const accent = useStore((s) => s.settings.accent);
  const reduce = useStore((s) => s.settings.reduceMotion);
  const a = ACCENTS[accent] ?? ACCENTS.violet;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <motion.div
        className="absolute -left-40 -top-48 h-[42rem] w-[42rem] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, ${a.from}55, transparent 65%)` }}
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-1/4 h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{ background: `radial-gradient(circle, ${a.to}44, transparent 65%)` }}
        animate={reduce ? undefined : { x: [0, -70, 0], y: [0, -50, 0], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full blur-[140px]"
        style={{ background: `radial-gradient(circle, ${a.from}33, transparent 70%)` }}
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 noise opacity-[0.035] mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55))]" />
    </div>
  );
}
