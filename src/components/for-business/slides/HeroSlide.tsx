import { useState } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  {
    id: "retail",
    label: "Retail",
    tagline: "Hire verified talent that delivers real customer experiences.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    tagline: "Find service-ready professionals who elevate guest satisfaction.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  },
  {
    id: "tech",
    label: "Tech",
    tagline: "Access certified developers and digital talent across the Caribbean.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    tagline: "Connect with qualified healthcare workers you can trust.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
  },
  {
    id: "finance",
    label: "Finance",
    tagline: "Recruit detail-oriented professionals for your financial operations.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
  },
  {
    id: "other",
    label: "Other",
    tagline: "Whatever your industry, find the right people with Lansa.",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
  },
];

interface HeroSlideProps {
  industry: string;
  setIndustry: (id: string) => void;
}

export function HeroSlide({ industry, setIndustry }: HeroSlideProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = hoveredId;

  const handleSelect = (id: string) => {
    setIndustry(id);
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-row">
      {/* Branding overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center pt-8 pointer-events-none">
        <div className="flex items-center gap-4">
          <AnimatedLogo size={48} />
          <span className="text-[28px] font-black text-white font-['Urbanist'] tracking-tight drop-shadow-lg">
            LANSA FOR BUSINESS
          </span>
        </div>
      </div>

      {/* Bottom instruction */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-6 pointer-events-none">
        <p className="text-white/40 text-sm font-['Urbanist'] tracking-wide">
          Select your industry to continue →
        </p>
      </div>

      {/* Column strips */}
      {INDUSTRIES.map((ind) => {
        const isActive = activeId === ind.id;
        const isSelected = industry === ind.id;

        return (
          <div
            key={ind.id}
            onClick={() => handleSelect(ind.id)}
            onMouseEnter={() => setHoveredId(ind.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative cursor-pointer overflow-hidden transition-all duration-500 ease-in-out",
              isActive ? "flex-[3.5]" : "flex-1"
            )}
          >
            {/* Background image */}
            <div
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105",
                isActive ? "grayscale-0 scale-100" : "grayscale"
              )}
              style={{ backgroundImage: `url(${ind.image})` }}
            />

            {/* Dark overlay */}
            <div
              className={cn(
                "absolute inset-0 transition-all duration-500",
                isActive
                  ? "bg-gradient-to-t from-black/80 via-black/30 to-black/10"
                  : "bg-gradient-to-t from-black/80 via-black/50 to-black/30"
              )}
            />

            {/* Selected indicator — orange bottom bar */}
            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[hsl(14,90%,60%)] z-10" />
            )}

            {/* Vertical divider lines */}
            <div className="absolute top-0 right-0 w-px h-full bg-white/10 z-10" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 px-6">
              {/* Collapsed state — vertical title */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                  isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <h2
                  className="text-white/90 font-['Urbanist'] font-black text-[28px] tracking-[0.15em] uppercase"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    letterSpacing: "0.15em",
                  }}
                >
                  {ind.label}
                </h2>
              </div>

              {/* Expanded state — full content */}
              <div
                className={cn(
                  "flex flex-col items-start gap-5 transition-all duration-500 w-full max-w-[400px]",
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6 pointer-events-none"
                )}
              >
                <h2 className="text-white font-['Urbanist'] font-black text-[52px] leading-none tracking-tight">
                  {ind.label}
                </h2>
                <p className="text-white/70 font-['Urbanist'] text-[18px] leading-relaxed">
                  {ind.tagline}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(ind.id);
                  }}
                  className={cn(
                    "px-8 py-3.5 rounded-full text-[15px] font-bold font-['Urbanist'] tracking-wide transition-all duration-200",
                    isSelected
                      ? "bg-[hsl(14,90%,60%)] text-white shadow-lg shadow-[hsl(14,90%,60%)]/30"
                      : "bg-white/15 text-white border border-white/30 hover:bg-[hsl(14,90%,60%)] hover:border-transparent hover:shadow-lg hover:shadow-[hsl(14,90%,60%)]/30"
                  )}
                >
                  {isSelected ? "✓ Selected" : "Select Industry"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
