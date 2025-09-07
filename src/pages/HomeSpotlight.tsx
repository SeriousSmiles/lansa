import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { TESTIMONIALS } from "../data/testimonials";
import Logo from "../components/Logo";
import { useIsMobile } from "../hooks/use-mobile";

/**
 * Single-section homepage with:
 * - Fixed top-center Lansa logo
 * - Welcome block (headline, subtext, Login button to /auth)
 * - Full-viewport testimonials grid
 * - Cursor-follow radial spotlight overlay
 */
export default function HomeSpotlight() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'team'>('opportunities');
  const isMobile = useIsMobile();
  
  // Tab content configuration
  const TAB_CONTENT = {
    opportunities: {
      label: "Seeking opportunities",
      headline: "Get seen for your real value.",
      subtext: "Turn your experience into a clear, hire-ready profile that stands out.",
      buttonText: "Start Building"
    },
    team: {
      label: "Growing your team",
      headline: "Find talent that fits.",
      subtext: "Discover candidates with proven skills and clear career stories.",
      buttonText: "Find Talent"
    }
  };
  
  const currentContent = TAB_CONTENT[activeTab];

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Initialize CSS variables for a more dramatic spotlight effect
    root.style.setProperty("--x", "50vw");
    root.style.setProperty("--y", "50vh");
    root.style.setProperty("--r1", "80px");   // Smaller inner radius for tighter focus
    root.style.setProperty("--r2", "200px"); // Smaller outer radius for thicker fog

    // Responsive grid layout function with mobile optimizations
    const layoutGrid = () => {
      if (!gridRef.current) return;
      
      const container = gridRef.current;
      const cards = container.querySelectorAll('[data-grid-item]');
      
      // Wait for container to have proper dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        requestAnimationFrame(layoutGrid);
        return;
      }
      
      // Responsive card sizing based on device type and orientation
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isLandscape = screenWidth > screenHeight;
      
      let cardWidth: number;
      let cardGap: number;
      let cols: number;
      
      if (screenWidth < 480) {
        // Smartphone
        if (isLandscape) {
          // Smartphone landscape: 2 columns, smaller cards
          cardWidth = 240;
          cardGap = 16;
          cols = 2;
        } else {
          // Smartphone portrait: 1 column, compact cards
          cardWidth = 280;
          cardGap = 16;
          cols = 1;
        }
      } else if (screenWidth < 768) {
        // Large smartphone/small tablet
        cardWidth = isLandscape ? 260 : 300;
        cardGap = 18;
        cols = isLandscape ? 3 : 2;
      } else if (screenWidth < 1024) {
        // Tablet
        cardWidth = 280;
        cardGap = 20;
        cols = isLandscape ? 4 : 3;
      } else {
        // Desktop
        cardWidth = 300;
        cardGap = 20;
        cols = Math.ceil(Math.sqrt(cards.length * 1.5));
      }
      
      const cardCount = cards.length;
      const rows = Math.ceil(cardCount / cols);
      
      // Set container size to accommodate all cards with overflow
      const containerWidth = cols * (cardWidth + cardGap) - cardGap;
      const containerHeight = rows * (isLandscape ? 320 : 380); // Shorter rows on landscape
      
      container.style.position = 'relative';
      container.style.width = `${containerWidth}px`;
      container.style.height = `${containerHeight}px`;
      container.style.left = '50%';
      container.style.top = '50%';
      container.style.transform = 'translate(-50%, -50%)';
      
      cards.forEach((card: any, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = col * (cardWidth + cardGap);
        const y = row * (isLandscape ? 300 : 350) + (cardGap * row);
        
        card.style.position = 'absolute';
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.width = `${cardWidth}px`;
        card.style.height = 'auto';
      });
    };

    // Initial layout with proper timing
    const initLayout = () => {
      if (gridRef.current) {
        layoutGrid();
      } else {
        requestAnimationFrame(initLayout);
      }
    };
    
    // Run layout after DOM is ready
    requestAnimationFrame(initLayout);
    
    // Relayout on resize
    window.addEventListener('resize', layoutGrid);

    const onMove = (e: PointerEvent) => {
      // Update spotlight position
      gsap.to(root, {
        "--x": `${e.clientX}px`,
        "--y": `${e.clientY}px`,
        duration: 0.15,
        ease: "power3.out"
      });

      // Mobile-optimized parallax effect
      if (gridRef.current) {
        const { innerWidth, innerHeight } = window;
        // Reduce parallax intensity on mobile for better performance
        const parallaxIntensity = isMobile ? -60 : -300;
        const xPercent = (e.clientX / innerWidth - 0.5) * parallaxIntensity;
        const yPercent = (e.clientY / innerHeight - 0.5) * parallaxIntensity;
        
        gsap.to(gridRef.current, {
          x: xPercent,
          y: yPercent,
          duration: isMobile ? 0.4 : 0.8, // Faster on mobile
          ease: "power2.out"
        });
      }
    };

    // Desktop pointer tracking (disable on mobile for performance)
    if (!isMobile) {
      window.addEventListener("pointermove", onMove);
    }

    // Mobile and accessibility optimizations
    const preferReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (preferReduced || isMobile) {
      gsap.set(root, { "--x": "50vw", "--y": "38vh", "--r1": "100px", "--r2": "220px" });
    }

    // Mobile touch interactions with haptic feedback simulation
    const onTouchStart = (e: TouchEvent) => {
      if (isMobile && gridRef.current) {
        // Simple haptic feedback via vibration API if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        
        // Update spotlight to touch position
        const touch = e.touches[0];
        gsap.to(root, {
          "--x": `${touch.clientX}px`,
          "--y": `${touch.clientY}px`,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    };

    const onTouchEnd = () => {
      if (isMobile) {
        gsap.to(root, { 
          "--x": "50vw", 
          "--y": "40vh", 
          "--r1": "90px", 
          "--r2": "210px", 
          duration: 0.3, 
          ease: "power2.out" 
        });
        if (gridRef.current) {
          gsap.to(gridRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
        }
      }
    };

    // Add touch event listeners for mobile
    if (isMobile) {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    // Handle orientation changes
    const onOrientationChange = () => {
      if (isMobile) {
        setTimeout(() => {
          layoutGrid();
          // Reset spotlight position after orientation change
          gsap.set(root, { "--x": "50vw", "--y": "40vh" });
        }, 100);
      }
    };
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      if (!isMobile) {
        window.removeEventListener("pointermove", onMove);
      }
      if (isMobile) {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
      }
      window.removeEventListener("orientationchange", onOrientationChange);
      window.removeEventListener('resize', layoutGrid);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0E1A] text-white">
      <Logo />

      {/* Welcome block - responsive positioning */}
      <section
        className="fixed inset-0 z-30 flex justify-center px-4 sm:px-6 pointer-events-none"
        style={{ 
          alignItems: isMobile ? 'center' : 'flex-end', 
          paddingBottom: isMobile ? '0' : '60px' 
        }}
        aria-label="Welcome"
      >
        <div className={`${
          isMobile 
            ? 'w-full max-w-sm mx-auto' 
            : 'max-w-md'
        } text-center pointer-events-auto`}>
          {/* Glass blur container with mobile optimizations */}
          <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl ${
            isMobile ? 'p-4' : 'p-6'
          }`}>
            {/* Tab switcher - enhanced touch targets for mobile */}
            <div className={`flex rounded-xl bg-white/10 p-1 ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <button
                onClick={() => {
                  setActiveTab('opportunities');
                  // Haptic feedback for mobile
                  if (isMobile && 'vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                }}
                className={`flex-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  isMobile ? 'py-3 px-2' : 'py-2 px-3'
                } ${
                  activeTab === 'opportunities'
                    ? 'bg-white text-[#0B0E1A] shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
                style={{ minHeight: isMobile ? '44px' : 'auto' }} // Touch target size
              >
                {TAB_CONTENT.opportunities.label}
              </button>
              <button
                onClick={() => {
                  setActiveTab('team');
                  // Haptic feedback for mobile
                  if (isMobile && 'vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                }}
                className={`flex-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  isMobile ? 'py-3 px-2' : 'py-2 px-3'
                } ${
                  activeTab === 'team'
                    ? 'bg-white text-[#0B0E1A] shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
                style={{ minHeight: isMobile ? '44px' : 'auto' }} // Touch target size
              >
                {TAB_CONTENT.team.label}
              </button>
            </div>
            
            {/* Content - responsive typography */}
            <h1 className={`font-semibold tracking-tight ${
              isMobile 
                ? 'text-xl leading-tight' 
                : 'text-2xl sm:text-3xl md:text-4xl'
            }`}>
              {currentContent.headline}
            </h1>
            <p className={`text-white/80 ${
              isMobile 
                ? 'mt-2 text-sm leading-relaxed' 
                : 'mt-3 text-sm sm:text-base'
            }`}>
              {currentContent.subtext}
            </p>
            <Link
              to="/auth"
              className={`inline-flex items-center justify-center rounded-xl font-medium bg-white text-[#0B0E1A] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 transition-all duration-150 ${
                isMobile 
                  ? 'mt-4 px-8 py-4 text-base w-full' 
                  : 'mt-6 px-6 py-3 text-sm'
              }`}
              style={{ minHeight: isMobile ? '48px' : 'auto' }} // Touch target size
            >
              {currentContent.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials grid (behind the welcome block) */}
      <section
        aria-label="What users say"
        className="pointer-events-none absolute inset-0 z-10"
      >
        <div 
          ref={gridRef}
          className="absolute inset-0"
          style={{ 
            // Prevent initial clustering by setting default positioning
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        >
          {TESTIMONIALS.concat(TESTIMONIALS).map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              data-grid-item
              className={`rounded-[10px] bg-[#151926] backdrop-blur-[3px] border border-white/8 select-none
                         flex flex-col shadow-2xl shadow-black/20 ${
                           isMobile ? 'p-4' : 'p-6'
                         }`}
            >
              {/* Star rating at top */}
              <div className={`flex items-center gap-1 ${isMobile ? 'mb-3' : 'mb-4'}`}>
                {[...Array(5)].map((_, starIndex) => (
                  <svg
                    key={starIndex}
                    className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
                      starIndex < t.stars ? 'text-yellow-400' : 'text-white/20'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Quote text - responsive sizing */}
              <div className={`flex-1 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <blockquote className={`leading-relaxed text-white/90 font-medium text-left ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  "{t.quote}"
                </blockquote>
              </div>
              
              {/* User info at bottom - compact on mobile */}
              <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  className={`rounded-full object-cover border border-white/20 ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  }`}
                />
                <div>
                  <div className={`text-white font-semibold ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>{t.name}</div>
                  <div className={`text-white/70 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  }`}>{t.title}</div>
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