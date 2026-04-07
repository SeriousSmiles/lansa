import { DetailContent } from "../DetailSheet";

const INDUSTRY_IMAGES: Record<string, string> = {
  retail: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=1200&q=80",
  hospitality: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  healthcare: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
  finance: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80",
  other: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
};

const INDUSTRY_DATA: Record<string, {
  headlineThin: string;
  headlineBold: string;
  subtitle: string;
  cards: { stat: string; label: string; desc: string; detail: DetailContent }[];
}> = {
  retail: {
    headlineThin: "Retail Hiring is",
    headlineBold: "Broken",
    subtitle: "Your sales floor can't wait 34 days for the right person.",
    cards: [
      { stat: "34", label: "days to hire", desc: "Average time to fill a retail position in the Caribbean",
        detail: { title: "Slow Hiring Costs Revenue", description: "Every unfilled position means lost sales floor coverage, longer queues, and burned-out existing staff.", bullets: ["Peak season positions go unfilled for weeks", "Manual screening of 50+ CVs per role", "Scheduling interviews across multiple locations", "No way to verify candidate reliability upfront"], stat: "34 days avg" } },
      { stat: "67%", label: "annual turnover", desc: "Staff turnover rate across Caribbean retail",
        detail: { title: "The Revolving Door Problem", description: "High turnover drains your training budget and destroys team morale.", bullets: ["Cost of replacing one employee: 2-3 months salary", "New hires take 90 days to reach full productivity", "Customers notice inconsistent service quality", "Your best people leave because they're carrying the team"], stat: "67% annually" } },
      { stat: "1 in 3", label: "leave in 90 days", desc: "New hires who don't make it past probation",
        detail: { title: "The Bad Hire Tax", description: "Without proper vetting, you're gambling with every hire.", bullets: ["No standardized way to assess soft skills", "References are unreliable and time-consuming", "Gut feeling hiring leads to mismatches", "The real cost: damaged customer relationships"], stat: "1 in 3 leave" } },
    ],
  },
  hospitality: {
    headlineThin: "Hospitality Staffing is",
    headlineBold: "in Crisis",
    subtitle: "Guest expectations don't pause while you're short-staffed.",
    cards: [
      { stat: "42", label: "days to staff", desc: "Average time to staff for peak season", detail: { title: "Missing the Season", description: "When tourist season hits and you're still hiring, revenue walks out the door.", bullets: ["Peak demand requires 2-3x normal staffing", "Trained hospitality workers are scarce", "Language and service skills are hard to verify", "Late hires miss critical onboarding windows"], stat: "42 days" } },
      { stat: "28%", label: "no-show rate", desc: "Scheduled interviews that are no-shows", detail: { title: "The Ghost Candidate Problem", description: "More than a quarter of your interview slots are wasted.", bullets: ["Hours spent coordinating schedules", "Managers pulled from operations", "No way to gauge commitment before investing time", "Repeat the cycle with new candidates"], stat: "28% no-shows" } },
      { stat: "$2.4K", label: "per bad hire", desc: "Lost in training costs per unsuccessful hire", detail: { title: "Wasted Training Investment", description: "Every bad hire burns through your training budget.", bullets: ["Orientation, uniform, safety certifications", "Shadow shifts pull productive staff off the floor", "Service quality dips during training", "Some leave before training is complete"], stat: "$2,400 per bad hire" } },
    ],
  },
  tech: {
    headlineThin: "Tech Talent is",
    headlineBold: "Vanishing",
    subtitle: "Your projects can't ship when your seats are empty.",
    cards: [
      { stat: "52", label: "days to fill", desc: "Average for technical roles in the region", detail: { title: "Technical Roles Stay Open Too Long", description: "Every day a dev seat is empty, projects slip.", bullets: ["Small candidate pool in the Caribbean", "Competing with remote international offers", "Technical assessments are time-consuming", "Skills claims are hard to verify without testing"], stat: "52 days avg" } },
      { stat: "45%", label: "skills mismatch", desc: "Tech hires that lack claimed skills", detail: { title: "Resume Inflation is Real", description: "Nearly half of tech hires can't deliver on claimed CV skills.", bullets: ["Self-reported skills are unreliable", "No standardized technical certification", "Interview coding tests are artificial", "You only discover gaps after onboarding"], stat: "45% mismatch" } },
      { stat: "6 mo", label: "avg tenure", desc: "Before a counter-offer pulls them away", detail: { title: "You Train, They Leave", description: "Invest in development only to lose your people to higher bidders.", bullets: ["International remote work is always recruiting", "Salary expectations escalate rapidly", "No loyalty mechanism beyond compensation", "You become a training ground for competitors"], stat: "6 month avg" } },
    ],
  },
  healthcare: {
    headlineThin: "Healthcare Hiring Needs",
    headlineBold: "Precision",
    subtitle: "Patient care can't wait for compliance paperwork.",
    cards: [
      { stat: "3 wk", label: "credential checks", desc: "Average verification time for healthcare credentials", detail: { title: "Verification Bottlenecks", description: "Healthcare demands rigorous credential verification.", bullets: ["License verification across jurisdictions", "Background checks are mandatory and slow", "Certification expiry tracking is manual", "One missed check = massive liability"], stat: "3 weeks avg" } },
      { stat: "18%", label: "positions unfilled", desc: "Healthcare positions remaining vacant", detail: { title: "Critical Gaps in Care", description: "Nearly 1 in 5 positions sits empty.", bullets: ["Burnout among existing staff accelerates turnover", "Patient-to-staff ratios suffer", "Overtime costs spiral upward", "Quality of care declines measurably"], stat: "18% vacancy rate" } },
      { stat: "High", label: "compliance risk", desc: "Regulatory exposure from improper vetting", detail: { title: "Regulatory Exposure", description: "Inadequate hiring puts your facility at serious risk.", bullets: ["Fines for non-compliant staffing", "Audit findings that damage reputation", "Insurance implications of unverified credentials", "Patient safety is non-negotiable"], stat: "High risk" } },
    ],
  },
  finance: {
    headlineThin: "Finance Hiring Demands",
    headlineBold: "Trust",
    subtitle: "One wrong hire can cost you more than a salary.",
    cards: [
      { stat: "28", label: "days screening", desc: "Average screening and vetting cycle", detail: { title: "Thorough Vetting Takes Time", description: "Financial roles require deeper background checks.", bullets: ["Credit history verification", "Regulatory fitness assessments", "Reference checks with previous employers", "Compliance training requirements"], stat: "28 days avg" } },
      { stat: "Scarce", label: "talent pool", desc: "Qualified financial professionals in-region", detail: { title: "A Shallow Talent Pool", description: "The Caribbean's financial sector competes for a small pool.", bullets: ["CPA/ACCA qualified candidates are scarce", "International firms recruit aggressively", "Salary expectations exceed local market", "Relocation assistance expectations are high"], stat: "Very limited" } },
      { stat: "Critical", label: "fraud risk", desc: "Inadequate vetting increases exposure", detail: { title: "The Cost of a Bad Financial Hire", description: "One wrong hire in finance can mean fraud or regulatory penalties.", bullets: ["Embezzlement and financial crime risk", "Regulatory fines can be existential", "Reputational damage is irreversible", "Customer trust evaporates instantly"], stat: "Critical" } },
    ],
  },
  other: {
    headlineThin: "Your Hiring Challenge is",
    headlineBold: "Real",
    subtitle: "Every unfilled role is a missed opportunity.",
    cards: [
      { stat: "40+", label: "hours per hire", desc: "Spent on manual screening per position", detail: { title: "Manual Screening Eats Your Time", description: "Without automation, every hire costs dozens of hours.", bullets: ["Reading through unqualified CVs", "Phone screening candidates one by one", "Coordinating interview schedules", "Following up on references manually"], stat: "40+ hours" } },
      { stat: "Low", label: "confidence", desc: "In candidate quality without verification", detail: { title: "You Can't Trust What You Can't Verify", description: "Without standardized assessment, hiring is guesswork.", bullets: ["No consistent way to compare candidates", "Interviews only reveal what candidates want to show", "Skills testing is ad-hoc or nonexistent", "You rely on gut feeling more than data"], stat: "Low confidence" } },
      { stat: "$4.7K", label: "cost per hire", desc: "Average total cost per new hire", detail: { title: "The Hidden Cost of Hiring", description: "When you add up every expense, each hire is significant.", bullets: ["Job advertising across multiple platforms", "HR staff time for screening and interviews", "Onboarding and training materials", "Lost productivity during ramp-up"], stat: "$4,700 average" } },
    ],
  },
};

interface ProblemSlideProps {
  industry: string;
  openDetail: (content: DetailContent) => void;
}

export function ProblemSlide({ industry, openDetail }: ProblemSlideProps) {
  const data = INDUSTRY_DATA[industry] || INDUSTRY_DATA.other;
  const image = INDUSTRY_IMAGES[industry] || INDUSTRY_IMAGES.other;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Photo */}
      <div className="h-[35vh] md:h-[35%] lg:h-full lg:w-[55%] relative shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-black/20 via-transparent to-black/60" />
        {/* Overlay stat callout */}
        <div className="absolute bottom-4 left-4 lg:bottom-16 lg:left-12 z-10">
          <p className="text-white/50 text-[11px] lg:text-[13px] font-['Urbanist'] uppercase tracking-[0.2em] mb-1 lg:mb-2">The Problem</p>
          <div className="bg-black/40 backdrop-blur-md rounded-xl lg:rounded-2xl px-4 py-3 lg:px-8 lg:py-6 border border-white/10">
            <p className="text-[36px] lg:text-[64px] font-black text-white font-['Urbanist'] leading-none">{data.cards[0].stat}</p>
            <p className="text-white/60 text-[12px] lg:text-[15px] font-['Urbanist'] mt-0.5 lg:mt-1">{data.cards[0].label}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white flex flex-col justify-center px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-12 lg:w-[45%]">
        <h2 className="font-['Urbanist'] mb-2 lg:mb-3">
          <span className="text-[28px] md:text-[40px] lg:text-[60px] font-extralight text-foreground leading-[1.1] block">{data.headlineThin}</span>
          <span className="text-[36px] md:text-[48px] lg:text-[72px] font-black text-foreground leading-[1.0] block">{data.headlineBold}</span>
        </h2>
        <p className="text-[14px] lg:text-[17px] text-muted-foreground font-['Urbanist'] font-light mb-6 lg:mb-12 max-w-[420px] leading-relaxed">
          {data.subtitle}
        </p>

        {/* Stat cards */}
        <div className="space-y-2 lg:space-y-4">
          {data.cards.map((card, i) => (
            <button
              key={i}
              onClick={() => openDetail(card.detail)}
              className="w-full flex items-center gap-4 lg:gap-6 text-left group cursor-pointer hover:bg-[hsl(var(--lansa-muted))] rounded-xl p-3 lg:p-4 -ml-3 lg:-ml-4 transition-all duration-200"
            >
              <div className="shrink-0">
                <p className="text-[24px] lg:text-[36px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist'] leading-none">{card.stat}</p>
                <p className="text-[10px] lg:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5 lg:mt-1">{card.label}</p>
              </div>
              <div className="flex-1 border-l border-border pl-4 lg:pl-6">
                <p className="text-[13px] lg:text-[14px] text-muted-foreground leading-relaxed">{card.desc}</p>
                <p className="text-[12px] text-[hsl(var(--lansa-orange))] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
