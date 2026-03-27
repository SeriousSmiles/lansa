import { useRef, useEffect, useState, ReactNode } from "react";

interface SlideRendererProps {
  children: ReactNode;
}

export function SlideRenderer({ children }: SlideRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      setScale(Math.min(w / 1920, h / 1080));
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[hsl(215,20%,96%)]">
      <div
        className="absolute w-[1920px] h-[1080px] left-1/2 top-1/2"
        style={{
          marginLeft: -960,
          marginTop: -540,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
