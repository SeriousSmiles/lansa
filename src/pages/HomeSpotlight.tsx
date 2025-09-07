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

    // Masonry layout function
    const layoutMasonry = () => {
      if (!gridRef.current) return;
      
      const container = gridRef.current;
      const cards = container.querySelectorAll('[data-masonry-item]');
      const cardWidth = 400;
      const cardGap = 24; // 24px gap between cards
      const containerPadding = 24; // 24px padding on sides
      
      // Calculate number of columns based on container width
      const containerWidth = container.offsetWidth - (containerPadding * 2);
      const cols = Math.floor((containerWidth + cardGap) / (cardWidth + cardGap));
      const actualCols = Math.max(1, cols);
      
      // Initialize column heights
      const columnHeights = new Array(actualCols).fill(0);
      
      // Set container to relative positioning
      container.style.position = 'relative';
      container.style.minHeight = '100vh';
      
      cards.forEach((card: any, index) => {
        // Find the shortest column
        const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
        
        // Calculate position
        const x = shortestCol * (cardWidth + cardGap) + containerPadding;
        const y = columnHeights[shortestCol];
        
        // Position the card
        card.style.position = 'absolute';
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.width = `${cardWidth}px`;
        card.style.height = '500px';
        
        // Update column height
        columnHeights[shortestCol] += 500 + cardGap;
      });
      
      // Set container height to tallest column
      const maxHeight = Math.max(...columnHeights);
      container.style.height = `${maxHeight + containerPadding}px`;
    };

    // Initial layout
    setTimeout(layoutMasonry, 100);
    
    // Relayout on resize
    window.addEventListener('resize', layoutMasonry);

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
      window.removeEventListener('resize', layoutMasonry);
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
          className="w-full h-full overflow-hidden"
        >
          {TESTIMONIALS.concat(TESTIMONIALS, TESTIMONIALS).map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              data-masonry-item
              className="rounded-[10px] bg-white/4 backdrop-blur-[3px] border border-white/8 p-6 select-none
                         flex flex-col justify-between shadow-2xl shadow-black/20"
            >
              {/* Quote text at top - left aligned */}
              <div className="flex-1 flex items-start pt-4">
                <blockquote className="text-base leading-relaxed text-white/90 font-medium text-left w-full">
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
          ))}
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