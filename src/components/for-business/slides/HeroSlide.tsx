import AnimatedLogo from "@/components/AnimatedLogo";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  { id: "retail", label: "Retail" },
  { id: "hospitality", label: "Hospitality" },
  { id: "tech", label: "Tech" },
  { id: "healthcare", label: "Healthcare" },
  { id: "finance", label: "Finance" },
  { id: "other", label: "Other" },
];

interface HeroSlideProps {
  industry: string;
  setIndustry: (id: string) => void;
}

export function HeroSlide({ industry, setIndustry }: HeroSlideProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[hsl(215,85%,12%)] via-[hsl(215,85%,20%)] to-[hsl(215,70%,10%)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-[hsl(215,85%,55%)] opacity-[0.04] -top-[200px] -right-[200px]" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[hsl(14,90%,60%)] opacity-[0.03] -bottom-[200px] -left-[100px]" />

      <AnimatedLogo size={120} className="mb-10" />

      <h1 className="text-[72px] font-black text-white font-['Urbanist'] tracking-tight leading-none mb-4">
        LANSA FOR BUSINESS
      </h1>
      <p className="text-[28px] text-white/70 font-light font-['Urbanist'] mb-16">
        Verified Talent. Smarter Hiring. Built for the Caribbean.
      </p>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-white/40 uppercase tracking-[0.2em] font-semibold">
          Select your industry
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setIndustry(ind.id)}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200",
                industry === ind.id
                  ? "bg-[hsl(var(--lansa-orange))] text-white shadow-lg shadow-[hsl(14,90%,60%)]/20"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      <p className="absolute bottom-12 text-white/30 text-sm">
        Press → or click Next to continue
      </p>
    </div>
  );
}
