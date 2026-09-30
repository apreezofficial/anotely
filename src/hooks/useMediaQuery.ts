import { useEffect, useState } from "react";

/** Subscribes to a CSS media query and re-renders on change. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True on tablet/desktop widths where the split-pane layout is used. */
export function useIsWide() {
  return useMediaQuery("(min-width: 1024px)");
}
