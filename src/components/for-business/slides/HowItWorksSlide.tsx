import { DetailContent } from "../DetailSheet";
import { FileText, Search, Handshake } from "lucide-react";

const STEPS = [
  {
    icon: FileText, num: "01", title: "Post",
    desc: "Create a job listing in under 5 minutes with our guided wizard.",
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
    icon: Search, num: "02", title: "Browse",
    desc: "Swipe through pre-verified, Lansa Certified candidates matched to your role.",
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
    icon: Handshake, num: "03", title: "Match",
    desc: "Connect directly with candidates who fit. Start a conversation instantly.",
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
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-[120px]">
      <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em] mb-4">
        How It Works
      </p>
      <h2 className="text-[56px] font-bold text-foreground font-['Urbanist'] mb-4 leading-tight">
        Three Steps. That's It.
      </h2>
      <p className="text-lg text-muted-foreground mb-20 text-center max-w-[600px]">
        5 minutes to post. Seconds to match. No agencies, no job boards, no guesswork.
      </p>

      <div className="flex gap-6 w-full max-w-[1400px] items-start">
        {STEPS.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="absolute" style={{ left: `${(i + 1) * 33.3}%`, top: "50%", width: "100px" }}>
              </div>
            )}
            <button
              onClick={() => openDetail(step.detail)}
              className="w-full bg-gradient-to-b from-[hsl(var(--lansa-muted))] to-white rounded-2xl p-10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--lansa-blue))] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              <p className="text-xs font-bold text-[hsl(var(--lansa-blue))] mb-2 tracking-widest">{step.num}</p>
              <h3 className="text-[32px] font-bold text-foreground font-['Urbanist'] mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              <p className="text-xs text-[hsl(var(--lansa-orange))] mt-6 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
