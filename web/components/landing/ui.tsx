import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "onInk" | "solid";

/**
 * Buttons behave like keys: a flat fill, no shadow, and a 1px drop while
 * held down. Focus rings are the acid highlighter, defined once in globals.
 */
const base =
  "press inline-flex items-center justify-center gap-2 border-2 px-5 py-3 label-mono text-[0.75rem] active:translate-y-px";

const variants: Record<Variant, string> = {
  // Solid highlighter, ink label.
  primary: "border-ink bg-highlight text-ink hover:bg-highlight-2",
  // Hairline ink outline on paper.
  outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  // For sections sitting on ink.
  onInk: "border-highlight bg-transparent text-highlight hover:bg-highlight hover:text-ink",
  // Solid ink, for use on the highlighter band. Hover inverts to paper.
  solid: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  className?: string;
} & ComponentProps<"button">;

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

type TagProps = {
  children: ReactNode;
  className?: string;
  tone?: "ink" | "margin" | "highlight";
};

const tagTones: Record<NonNullable<TagProps["tone"]>, string> = {
  ink: "border-ink text-ink",
  margin: "border-margin text-margin",
  highlight: "border-ink bg-highlight text-ink",
};

/** A small monospace tag, like a hand-written label on a page margin. */
export function Tag({ children, className, tone = "ink" }: TagProps) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center border px-2 py-1 text-[0.6875rem]",
        tagTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small monospace section label with a leading rule. */
export function SectionTag({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: "ink" | "onInk";
  className?: string;
}) {
  return (
    <p
      className={cn("section-tag", className)}
      style={
        tone === "onInk"
          ? ({ "--tag-color": "var(--color-paper-3)", "--tag-rule": "var(--color-highlight)" } as CSSProperties)
          : undefined
      }
    >
      <span aria-hidden="true" className="section-tag-rule block h-px w-6" />
      {children}
    </p>
  );
}

/** Consistent max width and gutters for every section. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}
