import { DetailContent } from "../DetailSheet";
import { Clock, Users, AlertTriangle } from "lucide-react";

const INDUSTRY_DATA: Record<string, { headline: string; cards: { icon: string; title: string; stat: string; desc: string; detail: DetailContent }[] }> = {
  retail: {
    headline: "Retail Hiring is Broken",
    cards: [
      {
        icon: "clock", title: "Time to Hire", stat: "34 days", desc: "Average time to fill a retail position in the Caribbean",
        detail: { title: "Slow Hiring Costs Revenue", description: "Every unfilled position means lost sales floor coverage, longer queues, and burned-out existing staff.", bullets: ["Peak season positions go unfilled for weeks", "Manual screening of 50+ CVs per role", "Scheduling interviews across multiple locations is a nightmare", "No way to verify candidate reliability upfront"], stat: "34 days avg" }
      },
      {
        icon: "users", title: "Turnover Rate", stat: "67%", desc: "Annual staff turnover in Caribbean retail",
        detail: { title: "The Revolving Door Problem", description: "High turnover drains your training budget and destroys team morale.", bullets: ["Cost of replacing one retail employee: 2-3 months salary", "New hires take 90 days to reach full productivity", "Customers notice inconsistent service quality", "Your best people leave because they're carrying the team"], stat: "67% annually" }
      },
      {
        icon: "alert", title: "Bad Hires", stat: "1 in 3", desc: "New hires leave within 90 days",
        detail: { title: "The Bad Hire Tax", description: "Without proper vetting, you're gambling with every hire — and the house always wins.", bullets: ["No standardized way to assess soft skills", "References are unreliable and time-consuming", "Gut feeling hiring leads to mismatches", "The real cost: damaged customer relationships"], stat: "1 in 3 leave in 90 days" }
      }
    ]
  },
  hospitality: {
    headline: "Hospitality Staffing is in Crisis",
    cards: [
      { icon: "clock", title: "Seasonal Gaps", stat: "42 days", desc: "Average time to staff for peak season", detail: { title: "Missing the Season", description: "When tourist season hits and you're still hiring, revenue walks out the door.", bullets: ["Peak demand requires 2-3x normal staffing", "Trained hospitality workers are scarce", "Language and service skills are hard to verify", "Late hires miss critical onboarding windows"], stat: "42 days" } },
      { icon: "users", title: "No-Show Rate", stat: "28%", desc: "Of scheduled interviews are no-shows", detail: { title: "The Ghost Candidate Problem", description: "More than a quarter of your interview slots are wasted on candidates who never show up.", bullets: ["Hours spent coordinating schedules", "Managers pulled from operations for interviews", "No way to gauge commitment before investing time", "Repeat the cycle with new candidates"], stat: "28% no-shows" } },
      { icon: "alert", title: "Training Waste", stat: "$2,400", desc: "Lost per bad hire in training costs", detail: { title: "Wasted Training Investment", description: "Every bad hire burns through your training budget with nothing to show for it.", bullets: ["Orientation, uniform, safety certifications", "Shadow shifts pull productive staff off the floor", "Service quality dips during training periods", "Some leave before training is even complete"], stat: "$2,400 per bad hire" } }
    ]
  },
  tech: {
    headline: "Tech Talent is Hard to Find",
    cards: [
      { icon: "clock", title: "Time to Fill", stat: "52 days", desc: "Average for technical roles in the region", detail: { title: "Technical Roles Stay Open Too Long", description: "Every day a dev seat is empty, projects slip and deadlines move.", bullets: ["Small candidate pool in the Caribbean", "Competing with remote international offers", "Technical assessments are time-consuming to administer", "Skills claims are hard to verify without testing"], stat: "52 days avg" } },
      { icon: "users", title: "Skills Mismatch", stat: "45%", desc: "Of tech hires lack claimed skills", detail: { title: "Resume Inflation is Real", description: "Nearly half of tech hires can't deliver on the skills listed in their CV.", bullets: ["Self-reported skills are unreliable", "No standardized technical certification", "Interview coding tests are stressful and artificial", "You only discover gaps after onboarding"], stat: "45% mismatch rate" } },
      { icon: "alert", title: "Poaching Risk", stat: "6 mo", desc: "Average tenure before a counter-offer", detail: { title: "You Train, They Leave", description: "Invest in development only to lose your people to higher bidders.", bullets: ["International remote work is always recruiting", "Salary expectations escalate rapidly", "No loyalty mechanism beyond compensation", "You become a training ground for competitors"], stat: "6 month avg tenure" } }
    ]
  },
  healthcare: {
    headline: "Healthcare Staffing Needs Precision",
    cards: [
      { icon: "clock", title: "Credential Checks", stat: "3 weeks", desc: "Average verification time for healthcare credentials", detail: { title: "Verification Bottlenecks", description: "Healthcare demands rigorous credential verification that slows every hire.", bullets: ["License verification across jurisdictions", "Background checks are mandatory and slow", "Certification expiry tracking is manual", "One missed check = massive liability"], stat: "3 weeks avg" } },
      { icon: "users", title: "Staff Shortages", stat: "18%", desc: "Of positions remain unfilled", detail: { title: "Critical Gaps in Care", description: "Nearly 1 in 5 healthcare positions sits empty, straining existing staff and patients.", bullets: ["Burnout among existing staff accelerates turnover", "Patient-to-staff ratios suffer", "Overtime costs spiral upward", "Quality of care declines measurably"], stat: "18% vacancy rate" } },
      { icon: "alert", title: "Compliance Risk", stat: "High", desc: "Regulatory exposure from improper vetting", detail: { title: "Regulatory Exposure", description: "Inadequate hiring processes put your facility at serious regulatory risk.", bullets: ["Fines for non-compliant staffing", "Audit findings that damage reputation", "Insurance implications of unverified credentials", "Patient safety is non-negotiable"], stat: "High risk" } }
    ]
  },
  finance: {
    headline: "Finance Hiring Demands Trust",
    cards: [
      { icon: "clock", title: "Screening Time", stat: "28 days", desc: "Average screening and vetting cycle", detail: { title: "Thorough Vetting Takes Time", description: "Financial roles require deeper background checks that extend timelines significantly.", bullets: ["Credit history verification", "Regulatory fitness assessments", "Reference checks with previous employers", "Compliance training requirements before start"], stat: "28 days avg" } },
      { icon: "users", title: "Talent Pool", stat: "Limited", desc: "Qualified financial professionals in-region", detail: { title: "A Shallow Talent Pool", description: "The Caribbean's financial sector competes for a small pool of qualified professionals.", bullets: ["CPA/ACCA qualified candidates are scarce", "International firms recruit aggressively", "Salary expectations exceed local market rates", "Relocation assistance expectations are high"], stat: "Very limited pool" } },
      { icon: "alert", title: "Fraud Risk", stat: "Critical", desc: "Inadequate vetting increases exposure", detail: { title: "The Cost of a Bad Financial Hire", description: "One wrong hire in finance can mean fraud, regulatory penalties, or worse.", bullets: ["Embezzlement and financial crime risk", "Regulatory fines can be existential", "Reputational damage is irreversible", "Customer trust evaporates instantly"], stat: "Critical exposure" } }
    ]
  },
  other: {
    headline: "Your Hiring Challenge",
    cards: [
      { icon: "clock", title: "Time Wasted", stat: "40+ hrs", desc: "Spent per hire on manual screening", detail: { title: "Manual Screening Eats Your Time", description: "Without automation, every hire costs dozens of hours in manual work.", bullets: ["Reading through unqualified CVs", "Phone screening candidates one by one", "Coordinating interview schedules", "Following up on references manually"], stat: "40+ hours per hire" } },
      { icon: "users", title: "Quality Gap", stat: "Low", desc: "Confidence in candidate quality", detail: { title: "You Can't Trust What You Can't Verify", description: "Without standardized assessment, hiring is guesswork.", bullets: ["No consistent way to compare candidates", "Interviews only reveal what candidates want to show", "Skills testing is ad-hoc or nonexistent", "You rely on gut feeling more than data"], stat: "Low confidence" } },
      { icon: "alert", title: "Cost per Hire", stat: "$4,700", desc: "Average total cost per new hire", detail: { title: "The Hidden Cost of Hiring", description: "When you add up every expense, each hire is a significant investment.", bullets: ["Job advertising across multiple platforms", "HR staff time for screening and interviews", "Onboarding and training materials", "Lost productivity during ramp-up period"], stat: "$4,700 average" } }
    ]
  }
};

const IconMap = { clock: Clock, users: Users, alert: AlertTriangle };

interface ProblemSlideProps {
  industry: string;
  openDetail: (content: DetailContent) => void;
}

export function ProblemSlide({ industry, openDetail }: ProblemSlideProps) {
  const data = INDUSTRY_DATA[industry] || INDUSTRY_DATA.other;

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-[120px]">
      <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em] mb-4">
        The Problem
      </p>
      <h2 className="text-[56px] font-bold text-foreground font-['Urbanist'] mb-4 leading-tight text-center">
        {data.headline}
      </h2>
      <p className="text-lg text-muted-foreground mb-16 text-center max-w-[700px]">
        Caribbean businesses face unique staffing challenges. Here's what hiring looks like today.
      </p>

      <div className="flex gap-8 w-full max-w-[1400px]">
        {data.cards.map((card, i) => {
          const Icon = IconMap[card.icon as keyof typeof IconMap];
          return (
            <button
              key={i}
              onClick={() => openDetail(card.detail)}
              className="flex-1 bg-[hsl(var(--lansa-muted))] rounded-2xl p-10 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--lansa-blue))] flex items-center justify-center mb-6">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">{card.title}</p>
              <p className="text-[42px] font-black text-foreground font-['Urbanist'] mb-3 leading-none">{card.stat}</p>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <p className="text-xs text-[hsl(var(--lansa-blue))] mt-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click for details →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
