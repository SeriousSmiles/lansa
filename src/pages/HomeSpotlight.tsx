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
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    rootRef.current = root as unknown as HTMLElement;

    // Initialize CSS variables
    root.style.setProperty("--x", "50vw");
    root.style.setProperty("--y", "50vh");
    root.style.setProperty("--r1", "140px");
    root.style.setProperty("--r2", "340px");

    const onMove = (e: PointerEvent) => {
      gsap.set(root, {
        "--x": `${e.clientX}px`,
        "--y": `${e.clientY}px`,
        duration: 0.18,
        ease: "power3.out"
      });
    };

    // Desktop pointer tracking
    window.addEventListener("pointermove", onMove);

    // Mobile: center the spotlight over the welcome block for clarity
    const preferReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (preferReduced) {
      gsap.set(root, { "--x": "50vw", "--y": "38vh", "--r1": "160px", "--r2": "360px" });
    }

    // Basic touch behavior: re-center near the CTA after initial tap
    const onTouchEnd = () => {
      gsap.to(root, { "--x": "50vw", "--y": "40vh", duration: 0.3, ease: "power2.out" });
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
        <div className="grid h-full w-full content-center gap-3 px-3
                        [grid-template-columns:repeat(2,minmax(0,1fr))]
                        sm:[grid-template-columns:repeat(3,minmax(0,1fr))]
                        md:[grid-template-columns:repeat(4,minmax(0,1fr))]
                        lg:[grid-template-columns:repeat(6,minmax(0,1fr))]">
          {TESTIMONIALS.concat(TESTIMONIALS).map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="rounded-2xl bg-white/3 backdrop-blur-[2px] border border-white/5 p-3 md:p-4 select-none"
            >
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
                  draggable={false}
                />
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold truncate">{t.name}</h3>
                  <p className="text-xs md:text-sm text-white/70 truncate">{t.title}</p>
                </div>
              </div>
              <blockquote className="mt-3 md:mt-4 text-xs md:text-sm text-white/80 leading-snug">
                "{t.quote}"
              </blockquote>
            </article>
          ))}
        </div>
      </section>

      {/* Spotlight overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient( circle at var(--x) var(--y), rgba(11,14,26,0) 0, rgba(11,14,26,0) var(--r1), rgba(11,14,26,0.70) var(--r2), rgba(11,14,26,0.85) 100% )",
        }}
      />
    </main>
  );
}