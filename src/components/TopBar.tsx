import type { ReactNode } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { useStore } from "@/store";
import { MotionIconButton } from "./ui";

/**
 * Compact header for phone widths. The wide layout has no top bar: the sidebar
 * carries the brand and the editor has its own full-height header.
 */
export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const setNavOpen = useStore((s) => s.setNavOpen);

  return (
    <header className="safe-t safe-x flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-ink-950/70 px-2 py-2 backdrop-blur-2xl">
      <MotionIconButton
        title={onBack ? "Back to notes" : "Notes and folders"}
        aria-label={onBack ? "Back to notes" : "Open navigation"}
        onClick={onBack ?? (() => setNavOpen(true))}
      >
        {onBack ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </MotionIconButton>
      <p className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold tracking-tight text-white">
        {title}
      </p>
      {right}
    </header>
  );
}
