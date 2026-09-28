import { useEffect } from "react";

/**
 * Boot splash: the "A" pops in, then "NOTELY" slides out from behind it as one
 * unit, followed by a shine sweep and a loading bar.
 */
export function Preloader({ visible }: { visible: boolean }) {
  useEffect(() => {
    if (!visible) return;
    const el = document.getElementById("anotely-preloader");
    if (el) {
      el.classList.add("anotely-hide");
      const timer = window.setTimeout(() => el.remove(), 520);
      return () => window.clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div id="anotely-preloader" className="anotely-preloader">
      <div className="anotely-logo">
        <span className="anotely-a">A</span>
        <span className="anotely-rest">NOTELY</span>
        <span className="anotely-shine" aria-hidden="true">
          <span>A</span>
          <span>NOTELY</span>
        </span>
      </div>
      <div className="anotely-bar">
        <div className="anotely-bar-fill" />
      </div>
    </div>
  );
}
