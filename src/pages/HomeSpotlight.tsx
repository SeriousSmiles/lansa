import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { TESTIMONIALS } from "../data/testimonials";
import Logo from "../components/Logo";

/**
 * Single-section homepage with:
 * - Fixed top-center Lansa logo
 * - Welcome block (headline, subtext, Login button to /auth)
 * - Full-viewport testimonials grid
 * - Cursor-follow radial spotlight overlay
 */
export default function HomeSpotlight() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Initialize CSS variables for a more dramatic spotlight effect
    root.style.setProperty("--x", "50vw");
    root.style.setProperty("--y", "50vh");
    root.style.setProperty("--r1", "80px");   // Smaller inner radius for tighter focus
    root.style.setProperty("--r2", "200px"); // Smaller outer radius for thicker fog

    const onMove = (e: PointerEvent) => {
      // Update spotlight position
      gsap.to(root, {
        "--x": `${e.clientX}px`,
        "--y": `${e.clientY}px`,
        duration: 0.15,
        ease: "power3.out"
      });

      // Add parallax effect to cards (opposite direction movement) - increased intensity
      if (gridRef.current) {
        const { innerWidth, innerHeight } = window;
        const xPercent = (e.clientX / innerWidth - 0.5) * -60; // Increased from -20 to -60
        const yPercent = (e.clientY / innerHeight - 0.5) * -60; // Increased from -20 to -60
        
        gsap.to(gridRef.current, {
          x: xPercent,
          y: yPercent,
          duration: 0.6, // Slightly faster response
          ease: "power2.out"
        });
      }
    };

    // Desktop pointer tracking
    window.addEventListener("pointermove", onMove);

    // Mobile: center the spotlight over the welcome block with enhanced focus
    const preferReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (preferReduced) {
      gsap.set(root, { "--x": "50vw", "--y": "38vh", "--r1": "100px", "--r2": "220px" });
    }

    // Mobile touch behavior: re-center with tighter focus and reset parallax
    const onTouchEnd = () => {
      gsap.to(root, { "--x": "50vw", "--y": "40vh", "--r1": "90px", "--r2": "210px", duration: 0.3, ease: "power2.out" });
      if (gridRef.current) {
        gsap.to(gridRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
      }
    };
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0E1A] text-white">
      <Logo />

      {/* Welcome block */}
      <section
        className="relative z-30 flex min-h-screen items-center justify-center px-6"
        aria-label="Welcome"
      >
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Get seen for your real value.
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/80">
            Lansa helps students, freelancers, and teams turn experience into clear, hire-ready profiles.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium bg-white text-[#0B0E1A] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Login to Lansa
          </Link>
        </div>
      </section>

      {/* Testimonials grid (behind the welcome block) */}
      <section
        aria-label="What users say"
        className="pointer-events-none absolute inset-0 z-10"
      >
        <div 
          ref={gridRef}
          className="grid h-full w-full content-start gap-6 px-6 py-8
                          grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                          auto-rows-max"
        >
          {TESTIMONIALS.concat(TESTIMONIALS, TESTIMONIALS).map((t, i) => {
            // Create varying heights for visual interest but prevent overlap
            const heights = ['h-[400px]', 'h-[450px]', 'h-[500px]', 'h-[420px]'];
            const cardHeight = heights[i % heights.length];
            
            return (
            <article
              key={`${t.id}-${i}`}
              className={`rounded-[10px] bg-white/4 backdrop-blur-[3px] border border-white/8 p-6 select-none
                         w-full ${cardHeight} flex flex-col justify-between
                         shadow-2xl shadow-black/20`}
            >
              {/* Quote text at top - properly centered */}
              <div className="flex-1 flex items-start justify-center pt-4">
                <blockquote className="text-base leading-relaxed text-white/90 font-medium text-center max-w-full">
                  "{t.quote}"
                </blockquote>
              </div>
              
              {/* User info at bottom with spacing */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
                  draggable={false}
                />
                <div className="min-w-0">
                  <h3 className="text-base font-bold truncate text-white">{t.name}</h3>
                  <p className="text-sm text-white/70 truncate">{t.title}</p>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      {/* Complete fog overlay with 0% transparency in center */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient( circle at var(--x) var(--y), rgba(11,14,26,0) 0, rgba(11,14,26,0.3) var(--r1), rgba(11,14,26,1) var(--r2), rgba(11,14,26,1) 100% )",
        }}
      />
    </main>
  );
}