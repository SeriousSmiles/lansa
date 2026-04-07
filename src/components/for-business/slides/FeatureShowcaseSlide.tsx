import { DetailContent } from "../DetailSheet";

const FEATURES = [
  {
    title: "Job Posting", titleBold: "Wizard",
    desc: "Create compelling job listings in under 5 minutes with guided templates.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    detail: {
      title: "Job Posting Wizard",
      description: "Our intelligent posting flow makes creating job listings fast and effective.",
      bullets: [
        "Industry-specific templates pre-fill common requirements",
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
    title: "Smart", titleBold: "Discovery",
    desc: "Swipe through matched, verified candidates ranked by fit score.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
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
    title: "Hiring", titleBold: "Analytics",
    desc: "Track pipeline health, response rates, and time-to-hire metrics.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
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
    title: "Team", titleBold: "Management",
    desc: "Collaborate with your hiring team through shared organization access.",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80",
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
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="pt-14 px-[120px] mb-6">
        <p className="text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-3 font-['Urbanist']">
          Platform Features
        </p>
        <h2 className="font-['Urbanist']">
          <span className="text-[48px] font-extralight text-foreground leading-[1.1]">Everything You Need to </span>
          <span className="text-[48px] font-black text-foreground leading-[1.1]">Hire</span>
        </h2>
      </div>

      {/* Alternating rows */}
      <div className="flex-1 flex flex-col px-[120px] pb-10 gap-3">
        {FEATURES.map((feat, i) => {
          const photoLeft = i % 2 === 0;
          return (
            <button
              key={i}
              onClick={() => openDetail(feat.detail)}
              className="flex-1 flex rounded-xl overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-300"
              style={{ flexDirection: photoLeft ? "row" : "row-reverse" }}
            >
              {/* Photo side */}
              <div className="w-[35%] relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${feat.image})` }}
                />
              </div>
              {/* Text side */}
              <div className="w-[65%] bg-[hsl(var(--lansa-muted))] flex items-center justify-center px-10 group-hover:bg-[hsl(215,20%,95%)] transition-colors duration-300">
                <div className="text-center">
                  <h3 className="font-['Urbanist'] mb-1.5">
                    <span className="text-[28px] font-extralight text-foreground">{feat.title} </span>
                    <span className="text-[28px] font-black text-foreground">{feat.titleBold}</span>
                  </h3>
                  <p className="text-[14px] text-muted-foreground font-['Urbanist'] font-light leading-relaxed max-w-[400px]">
                    {feat.desc}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--lansa-orange))] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-['Urbanist']">
                    See full details →
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
