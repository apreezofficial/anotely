import type { ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useStore } from "@/store";

/**
 * Phone-width navigation drawer. Replaces the docked sidebar below 1024px and
 * sits above the editor as an overlay, so the note stays visible behind it.
 */
export function NavDrawer({ children }: { children: ReactNode }) {
  const open = useStore((s) => s.navOpen);
  const setNavOpen = useStore((s) => s.setNavOpen);
  const controls = useDragControls();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setNavOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[330px] flex-col shadow-[0_0_80px_-10px_rgba(0,0,0,0.9)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            drag="x"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -450) setNavOpen(false);
            }}
          >
            {/* Drag handle: the rest of the drawer must stay scrollable. */}
            <div
              className="safe-t shrink-0 cursor-grab px-4 pb-1 pt-2 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <span className="mx-auto block h-1 w-10 rounded-full bg-white/20" />
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
