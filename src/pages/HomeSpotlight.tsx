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

    // Mobile/Tablet detection (anything under 1024px width)
    const isMobileOrTablet = window.innerWidth < 1024;

    if (isMobileOrTablet) {
      // Static spotlight for mobile/tablet - positioned below welcome content
      root.style.setProperty("--x", "50vw");
      root.style.setProperty("--y", "65vh"); // Position below welcome content
      root.style.setProperty("--r1", window.innerWidth < 768 ? "120px" : "160px");
      root.style.setProperty("--r2", window.innerWidth < 768 ? "250px" : "320px");
    } else {
      // Desktop: Initialize dynamic spotlight
      root.style.setProperty("--x", "50vw");
      root.style.setProperty("--y", "50vh");
      root.style.setProperty("--r1", "80px");
      root.style.setProperty("--r2", "200px");
    }

    // Layout function for mobile/tablet vs desktop
    const layoutGrid = () => {
      if (!gridRef.current) return;
      
      const container = gridRef.current;
      const cards = container.querySelectorAll('[data-grid-item]');
      
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        requestAnimationFrame(layoutGrid);
        return;
      }
      
      const screenWidth = window.innerWidth;
      
      if (screenWidth < 1024) {
        // Mobile/Tablet: Single column scrollable layout
        const cardWidth = Math.min(360, screenWidth - 32);
        const cardGap = screenWidth < 768 ? 60 : 16; // 60px gap for mobile, 16px for tablet
        
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = 'auto';
        container.style.left = '0';
        container.style.top = '0';
        container.style.transform = 'none';
        container.style.padding = '16px';
        container.style.paddingTop = '320px'; // Reduced padding for better scroll
        container.style.paddingBottom = '80px';
        
        cards.forEach((card: any, index) => {
          card.style.position = 'relative';
          card.style.left = 'auto';
          card.style.top = 'auto';
          card.style.width = '100%';
          card.style.maxWidth = `${cardWidth}px`;
          card.style.marginLeft = 'auto';
          card.style.marginRight = 'auto';
          card.style.marginBottom = `${cardGap}px`;
          card.style.height = 'auto';
        });
      } else {
        // Desktop: Grid layout with dynamic positioning
        const cardWidth = 300;
        const cardGap = 20;
        const cols = Math.ceil(Math.sqrt(cards.length * 1.5));
        const cardCount = cards.length;
        const rows = Math.ceil(cardCount / cols);
        
        const containerWidth = cols * (cardWidth + cardGap) - cardGap;
        const containerHeight = rows * 380;
        
        container.style.position = 'relative';
        container.style.width = `${containerWidth}px`;
        container.style.height = `${containerHeight}px`;
        container.style.left = '50%';
        container.style.top = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.padding = '0';
        container.style.paddingTop = '0';
        
        cards.forEach((card: any, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          const x = col * (cardWidth + cardGap);
          const y = row * 350 + (cardGap * row);
          
          card.style.position = 'absolute';
          card.style.left = `${x}px`;
          card.style.top = `${y}px`;
          card.style.width = `${cardWidth}px`;
          card.style.height = 'auto';
          card.style.margin = '0';
        });
      }
    };

    // Initial layout
    const initLayout = () => {
      if (gridRef.current) {
        layoutGrid();
      } else {
        requestAnimationFrame(initLayout);
      }
    };
    
    requestAnimationFrame(initLayout);
    window.addEventListener('resize', layoutGrid);

    // Desktop-only pointer tracking with parallax
    const onMove = (e: PointerEvent) => {
      if (window.innerWidth >= 1024) {
        // Update spotlight position
        gsap.to(root, {
          "--x": `${e.clientX}px`,
          "--y": `${e.clientY}px`,
          duration: 0.15,
          ease: "power3.out"
        });

        // Parallax effect for desktop
        if (gridRef.current) {
          const { innerWidth, innerHeight } = window;
          const xPercent = (e.clientX / innerWidth - 0.5) * -300;
          const yPercent = (e.clientY / innerHeight - 0.5) * -300;
          
          gsap.to(gridRef.current, {
            x: xPercent,
            y: yPercent,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      }
    };

    // Only add pointer tracking for desktop
    if (window.innerWidth >= 1024) {
      window.addEventListener("pointermove", onMove);
    }

    // Handle resize to switch between mobile/desktop layouts
    const onResize = () => {
      const isMobileOrTabletNow = window.innerWidth < 1024;
      
      if (isMobileOrTabletNow) {
        // Switch to static mobile layout
        root.style.setProperty("--x", "50vw");
        root.style.setProperty("--y", "65vh");
        root.style.setProperty("--r1", window.innerWidth < 768 ? "120px" : "160px");
        root.style.setProperty("--r2", window.innerWidth < 768 ? "250px" : "320px");
        
        // Reset any parallax transforms
        if (gridRef.current) {
          gsap.set(gridRef.current, { x: 0, y: 0 });
        }
      } else {
        // Switch to dynamic desktop layout
        root.style.setProperty("--r1", "80px");
        root.style.setProperty("--r2", "200px");
      }
      
      layoutGrid();
    };
    
    window.addEventListener('resize', onResize);

    return () => {
      if (window.innerWidth >= 1024) {
        window.removeEventListener("pointermove", onMove);
      }
      window.removeEventListener('resize', layoutGrid);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#191F71] text-white" style={{ 
      overflowX: 'hidden',
      overflowY: window.innerWidth < 1024 ? 'auto' : 'hidden',
      WebkitOverflowScrolling: 'touch', // Smooth scroll momentum on iOS
      scrollBehavior: 'smooth'
    }}>
      <Logo />

      {/* Welcome block - responsive positioning */}
      <section
        className="fixed inset-0 z-30 flex justify-center px-4 sm:px-6 pointer-events-none"
        style={{ 
          alignItems: window.innerWidth < 1024 ? 'flex-start' : (isMobile ? 'center' : 'flex-end'),
          paddingTop: window.innerWidth < 1024 ? '100px' : '0', // Reduced from 120px
          paddingBottom: window.innerWidth < 1024 ? '0' : (isMobile ? '0' : '60px')
        }}
        aria-label="Welcome"
      >
        <div className={`${
          isMobile 
            ? 'w-full max-w-sm mx-auto' 
            : 'max-w-md'
        } text-center pointer-events-auto`}>
          {/* Glass blur container with mobile optimizations */}
          <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${
            isMobile ? 'p-4' : 'p-6'
          }`}>
            {/* Tab switcher - enhanced touch targets for mobile */}
            <div className={`flex rounded-xl bg-white/15 p-1 ${isMobile ? 'mb-4' : 'mb-6'}`}>
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
                    ? 'bg-white text-[#191F71] shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
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
                    ? 'bg-white text-[#191F71] shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
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
              className={`inline-flex items-center justify-center rounded-xl font-medium bg-white text-[#191F71] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 transition-all duration-150 ${
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
        className={window.innerWidth < 1024 ? "relative z-10" : "pointer-events-none absolute inset-0 z-10"}
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
              className={`rounded-[10px] bg-[#2A3284] backdrop-blur-[3px] border border-white/15 select-none
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
            "radial-gradient( circle at var(--x) var(--y), rgba(25,31,113,0) 0, rgba(25,31,113,0.3) var(--r1), rgba(25,31,113,1) var(--r2), rgba(25,31,113,1) 100% )",
        }}
      />
    </main>
  );
}