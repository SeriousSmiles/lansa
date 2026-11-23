import { useEffect, useState } from "react";

/** True below the width where the seeker sidebar rail appears (Tailwind lg, 1024px). */
export function useCompactSeeker(): boolean {
  const q = "(max-width: 1023px)";
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setCompact(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return compact;
}
