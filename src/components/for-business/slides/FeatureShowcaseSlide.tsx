import { DetailContent } from "../DetailSheet";
import { Wand2, Compass, BarChart3, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Wand2, title: "Job Posting Wizard",
    desc: "Create compelling job listings in under 5 minutes with guided templates.",
    detail: {
      title: "Job Posting Wizard",
      description: "Our intelligent posting flow makes creating job listings fast and effective.",
      bullets: [
        "Industry-specific templates pre-fill common requirements so you start ahead",
        "Smart skills tagging automatically matches your listing with certified candidates",
        "Set salary range, location, work mode, and contract type in a few taps",
        "Preview exactly how candidates will see your listing before publishing",
        "Edit and update live listings anytime — changes reflect instantly",
        "Duplicate successful listings for similar roles with one click"
      ],
      stat: "< 5 min to post"
    }
  },
  {
    icon: Compass, title: "Smart Discovery",
    desc: "Swipe through matched, verified candidates ranked by fit score.",
    detail: {
      title: "Smart Candidate Discovery",
      description: "A curated feed of pre-certified candidates, ranked by how well they match your role.",
      bullets: [
        "AI-powered matching considers skills, location, availability, and certification results",
        "Every candidate in your feed is Lansa Certified — no unverified profiles",
        "Swipe right to shortlist, left to pass — simple and decisive",
        "View candidate 90-day goals to gauge ambition and alignment",
        "Save promising candidates to custom shortlists for later review",
        "Filter by certification sector, availability, and location"
      ],
      stat: "80% faster screening"
    }
  },
  {
    icon: BarChart3, title: "Hiring Analytics",
    desc: "Track pipeline health, response rates, and time-to-hire metrics.",
    detail: {
      title: "Hiring Analytics Dashboard",
      description: "Real-time visibility into your hiring funnel's performance.",
      bullets: [
        "Track time-to-hire across all active positions",
        "Monitor candidate response rates and engagement",
        "See which listings attract the most qualified candidates",
        "Pipeline view: see where candidates are in your process",
        "Compare hiring metrics month-over-month",
        "Export reports for leadership and board presentations"
      ],
      stat: "Real-time data"
    }
  },
  {
    icon: Users, title: "Team Management",
    desc: "Collaborate with your hiring team through shared organization access.",
    detail: {
      title: "Team & Organization Management",
      description: "Built for teams, not just individual recruiters.",
      bullets: [
        "Invite team members to your organization with role-based permissions",
        "Shared candidate shortlists — no more forwarding CVs via email",
        "Activity log shows who viewed, shortlisted, or contacted candidates",
        "Organization branding on your listings builds employer trust",
        "Manage multiple active job listings from one dashboard",
        "Centralized billing and subscription management"
      ],
      stat: "Unlimited seats"
    }
  }
];

interface FeatureShowcaseSlideProps {
  openDetail: (content: DetailContent) => void;
}

export function FeatureShowcaseSlide({ openDetail }: FeatureShowcaseSlideProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-[120px]">
      <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em] mb-4">
        Platform Features
      </p>
      <h2 className="text-[52px] font-bold text-foreground font-['Urbanist'] mb-4 leading-tight">
        Everything You Need to Hire
      </h2>
      <p className="text-lg text-muted-foreground mb-14 text-center max-w-[600px]">
        From posting to onboarding, Lansa streamlines every step of your hiring process.
      </p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-[1200px]">
        {FEATURES.map((feat, i) => (
          <button
            key={i}
            onClick={() => openDetail(feat.detail)}
            className="flex items-start gap-6 bg-[hsl(var(--lansa-muted))] rounded-2xl p-8 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-[hsl(var(--lansa-blue))] flex items-center justify-center shrink-0">
              <feat.icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground font-['Urbanist'] mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              <p className="text-xs text-[hsl(var(--lansa-blue))] mt-3 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                See full details →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
