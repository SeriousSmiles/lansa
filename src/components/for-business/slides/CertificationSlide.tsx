import { DetailContent } from "../DetailSheet";
import { Building2, Coffee, Wrench, Monitor, ShieldCheck } from "lucide-react";

const SECTORS = [
  {
    icon: Building2, title: "Office", color: "hsl(215,85%,55%)",
    desc: "Communication, organization, professionalism",
    detail: {
      title: "Office Sector Certification",
      description: "Assesses core professional skills required in administrative and corporate environments.",
      bullets: [
        "Written communication and email etiquette",
        "Time management and task prioritization",
        "Professional presentation and conduct",
        "Digital literacy and common office tools",
        "Problem-solving in workplace scenarios",
        "Interpersonal skills and teamwork readiness"
      ]
    }
  },
  {
    icon: Coffee, title: "Service", color: "hsl(14,90%,60%)",
    desc: "Customer handling, conflict resolution, service etiquette",
    detail: {
      title: "Service Sector Certification",
      description: "Evaluates customer-facing skills critical to hospitality, retail, and service roles.",
      bullets: [
        "Customer greeting and first-impression management",
        "Complaint handling and de-escalation techniques",
        "Upselling and product knowledge application",
        "Multitasking under pressure",
        "Cultural sensitivity and diverse customer interactions",
        "Cash handling and POS familiarity"
      ]
    }
  },
  {
    icon: Wrench, title: "Technical", color: "hsl(160,84%,39%)",
    desc: "Safety awareness, process adherence, practical skills",
    detail: {
      title: "Technical Sector Certification",
      description: "Tests practical knowledge and safety awareness for hands-on technical roles.",
      bullets: [
        "Workplace safety protocols and hazard identification",
        "Tool and equipment familiarity",
        "Process documentation and following procedures",
        "Quality control awareness",
        "Basic troubleshooting methodology",
        "Team coordination on physical tasks"
      ]
    }
  },
  {
    icon: Monitor, title: "Digital", color: "hsl(270,70%,55%)",
    desc: "Digital tools, data handling, remote work readiness",
    detail: {
      title: "Digital Sector Certification",
      description: "Verifies digital competency for remote, hybrid, and tech-adjacent roles.",
      bullets: [
        "Cloud tools and collaboration platforms",
        "Data entry accuracy and spreadsheet skills",
        "Basic cybersecurity awareness",
        "Remote work communication standards",
        "Project management tool familiarity",
        "Digital document creation and formatting"
      ]
    }
  }
];

interface CertificationSlideProps {
  openDetail: (content: DetailContent) => void;
}

export function CertificationSlide({ openDetail }: CertificationSlideProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[hsl(215,85%,12%)] to-[hsl(215,70%,8%)] flex flex-col items-center justify-center px-[120px] relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[hsl(215,85%,55%)] opacity-[0.05] -top-[100px] -right-[100px]" />

      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="h-6 w-6 text-[hsl(var(--lansa-orange))]" />
        <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em]">
          The Lansa Difference
        </p>
      </div>
      <h2 className="text-[52px] font-bold text-white font-['Urbanist'] mb-4 leading-tight text-center">
        Every Candidate is Lansa Certified
      </h2>
      <p className="text-lg text-white/60 mb-16 text-center max-w-[700px]">
        Before any candidate appears in your feed, they've passed a rigorous, sector-specific certification exam. No exceptions.
      </p>

      <div className="grid grid-cols-4 gap-6 w-full max-w-[1400px]">
        {SECTORS.map((sector, i) => (
          <button
            key={i}
            onClick={() => openDetail(sector.detail)}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: `${sector.color}20` }}
            >
              <sector.icon className="h-8 w-8" style={{ color: sector.color }} />
            </div>
            <h3 className="text-2xl font-bold text-white font-['Urbanist'] mb-2">{sector.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{sector.desc}</p>
            <p className="text-xs text-[hsl(var(--lansa-orange))] mt-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View assessment areas →
            </p>
          </button>
        ))}
      </div>

      <p className="mt-12 text-white/30 text-sm text-center">
        Certification is free for candidates and mandatory before they enter the talent pool.
      </p>
    </div>
  );
}
