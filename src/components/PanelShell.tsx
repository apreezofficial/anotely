import type { ReactNode } from "react";
import { motion, useDragControls } from "framer-motion";
import { useStore } from "@/store";
import { useIsWide } from "@/hooks/useMediaQuery";

/**
 * One container for the AI surfaces. On wide screens it is a docked right-hand
 * column; on phones it is a bottom sheet with a drag handle.
 */
export function PanelShell({
  width = 400,
  children,
}: {
  width?: number;
  children: ReactNode;
}) {
  const wide = useIsWide();
  const setPanel = useStore((s) => s.setPanel);
  const controls = useDragControls();

  if (wide) {
    return (
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className="relative z-20 h-full shrink-0 overflow-hidden border-l border-white/[0.06] bg-ink-900/70 backdrop-blur-2xl"
      >
        <div className="flex h-full flex-col" style={{ width }}>
          {children}
        </div>
      </motion.aside>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setPanel("none")}
      />
      <motion.div
        className="safe-b fixed inset-x-0 bottom-0 z-40 flex max-h-[92vh] flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-ink-900/95 shadow-[0_-24px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 500) setPanel("none");
        }}
      >
        {/* Drag handle: the sheet body must stay scrollable. */}
        <div
          className="shrink-0 cursor-grab px-4 pb-1 pt-2.5 active:cursor-grabbing"
          onPointerDown={(e) => controls.start(e)}
        >
          <span className="mx-auto block h-1 w-10 rounded-full bg-white/20" />
        </div>
        {children}
      </motion.div>
    </>
  );
}
