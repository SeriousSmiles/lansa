import { useState, useEffect, useCallback } from "react";
import { Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";
import { SlideRenderer } from "./SlideRenderer";
import { SlideSidebar } from "./SlideSidebar";
import { DetailSheet, DetailContent } from "./DetailSheet";
import { HeroSlide } from "./slides/HeroSlide";
import { ProblemSlide } from "./slides/ProblemSlide";
import { HowItWorksSlide } from "./slides/HowItWorksSlide";
import { CertificationSlide } from "./slides/CertificationSlide";
import { FeatureShowcaseSlide } from "./slides/FeatureShowcaseSlide";
import { FunnelSlide } from "./slides/FunnelSlide";
import { PricingSlide } from "./slides/PricingSlide";
import { CTASlide } from "./slides/CTASlide";

const TOTAL_SLIDES = 8;

export function PresentationShell() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [industry, setIndustry] = useState("retail");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContent, setDetailContent] = useState<DetailContent | null>(null);

  const openDetail = useCallback((content: DetailContent) => {
    setDetailContent(content);
    setDetailOpen(true);
  }, []);

  const goNext = useCallback(() => setCurrentSlide((p) => Math.min(p + 1, TOTAL_SLIDES - 1)), []);
  const goPrev = useCallback(() => setCurrentSlide((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, isFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const renderSlide = () => {
    const props = { openDetail };
    switch (currentSlide) {
      case 0: return <HeroSlide industry={industry} setIndustry={setIndustry} />;
      case 1: return <ProblemSlide industry={industry} {...props} />;
      case 2: return <HowItWorksSlide {...props} />;
      case 3: return <CertificationSlide {...props} />;
      case 4: return <FeatureShowcaseSlide {...props} />;
      case 5: return <FunnelSlide />;
      case 6: return <PricingSlide {...props} />;
      case 7: return <CTASlide />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[hsl(215,20%,96%)] flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-border flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-accent transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect y="2" width="16" height="1.5" rx=".75" fill="currentColor"/>
              <rect y="7" width="16" height="1.5" rx=".75" fill="currentColor"/>
              <rect y="12" width="16" height="1.5" rx=".75" fill="currentColor"/>
            </svg>
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>
        </div>
        <span className="text-sm font-bold font-['Urbanist'] text-[hsl(var(--lansa-blue))]">
          LANSA FOR BUSINESS
        </span>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-accent transition-colors"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden">
        <SlideSidebar
          currentSlide={currentSlide}
          onSelectSlide={setCurrentSlide}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Canvas */}
        <div className="absolute inset-0">
          <SlideRenderer>
            {renderSlide()}
          </SlideRenderer>
        </div>

        {/* Nav buttons */}
        {currentSlide > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 bottom-6 z-20 bg-white/90 backdrop-blur border border-border rounded-full p-3 shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {currentSlide < TOTAL_SLIDES - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 bottom-6 z-20 bg-[hsl(var(--lansa-blue))] text-white rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <DetailSheet open={detailOpen} onOpenChange={setDetailOpen} content={detailContent} />
    </div>
  );
}
