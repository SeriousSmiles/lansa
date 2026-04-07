import { DetailContent } from "../DetailSheet";

const STEPS = [
  {
    num: "01", title: "Post", titleBold: "Your Role",
    desc: "Create a job listing in under 5 minutes with our guided wizard.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    detail: {
      title: "Job Posting Wizard",
      description: "Our smart posting flow asks the right questions so you attract the right candidates.",
      bullets: [
        "Industry-specific templates pre-fill common requirements",
        "Skills tagging matches you with certified candidates automatically",
        "Set salary range, location, and work mode in seconds",
        "Preview your listing as candidates will see it",
        "Publish instantly — no approval queue",
      ],
      stat: "< 5 minutes"
    }
  },
  {
    num: "02", title: "Browse", titleBold: "Talent",
    desc: "Swipe through pre-verified, Lansa Certified candidates matched to your role.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    detail: {
      title: "Smart Candidate Discovery",
      description: "Every candidate you see has already passed a sector-specific certification exam.",
      bullets: [
        "AI-powered matching ranks candidates by fit score",
        "View certification results, skills, and 90-day goals",
        "Swipe right to shortlist, left to pass — it's that simple",
        "Save candidates to revisit later",
        "No more reading through 50 unqualified CVs",
      ],
      stat: "Seconds to match"
    }
  },
  {
    num: "03", title: "Hire", titleBold: "with Confidence",
    desc: "Connect directly with candidates who fit. Start a conversation instantly.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    detail: {
      title: "Direct Connection",
      description: "When you find someone great, you're one tap away from starting a conversation.",
      bullets: [
        "Built-in messaging — no email tag needed",
        "Share job details and next steps in-app",
        "Track candidate status through your pipeline",
        "Schedule interviews directly from the chat",
        "Both parties are notified in real-time",
      ],
      stat: "1-tap connect"
    }
  }
];

interface HowItWorksSlideProps {
  openDetail: (content: DetailContent) => void;
}

export function HowItWorksSlide({ openDetail }: HowItWorksSlideProps) {
  return (
    <div className="w-full h-full bg-[hsl(215,20%,97%)] flex flex-col">
      {/* Header */}
      <div className="pt-8 px-6 md:px-12 lg:pt-16 lg:px-[120px] mb-4 lg:mb-8">
        <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-2 lg:mb-4 font-['Urbanist']">
          How It Works
        </p>
        <h2 className="font-['Urbanist']">
          <span className="text-[32px] md:text-[40px] lg:text-[52px] font-extralight text-foreground leading-[1.1]">Three Steps. </span>
          <span className="text-[32px] md:text-[40px] lg:text-[52px] font-black text-foreground leading-[1.1]">That's It.</span>
        </h2>
      </div>

      {/* Steps — photo cards */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 px-6 md:px-12 lg:px-[120px] pb-6 lg:pb-16">
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => openDetail(step.detail)}
            className="flex-1 relative rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer group min-h-[200px] lg:min-h-0"
          >
            {/* Background photo */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${step.image})` }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />

            {/* Watermark number */}
            <div className="absolute top-2 right-4 lg:top-4 lg:right-6 z-10">
              <span className="text-[80px] lg:text-[140px] font-extralight text-white/[0.06] font-['Urbanist'] leading-none select-none">
                {step.num}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end items-center text-center p-5 lg:p-8">
              <p className="text-[hsl(var(--lansa-orange))] text-[11px] lg:text-[13px] font-bold tracking-widest mb-2 lg:mb-3 font-['Urbanist']">
                STEP {step.num}
              </p>
              <h3 className="font-['Urbanist'] mb-2 lg:mb-3">
                <span className="text-[22px] lg:text-[32px] font-extralight text-white leading-tight block">{step.title}</span>
                <span className="text-[22px] lg:text-[32px] font-black text-white leading-tight block">{step.titleBold}</span>
              </h3>
              <p className="text-white/60 text-[13px] lg:text-[14px] font-['Urbanist'] leading-relaxed max-w-[300px]">{step.desc}</p>
              <p className="text-[hsl(var(--lansa-orange))] text-[12px] font-semibold mt-3 lg:mt-4 opacity-0 group-hover:opacity-100 transition-opacity font-['Urbanist']">
                Learn more →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
