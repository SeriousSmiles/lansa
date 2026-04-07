import { DetailContent } from "../DetailSheet";
import { Building2, Coffee, Wrench, Monitor } from "lucide-react";

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
    <div className="w-full h-full flex overflow-hidden">
      {/* Left — Photo */}
      <div className="w-[45%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,85%,12%)]/30 to-[hsl(215,85%,12%)]" />
        
        {/* Floating badge */}
        <div className="absolute bottom-16 right-12 z-10 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/10">
          <p className="text-[48px] font-black text-white font-['Urbanist'] leading-none">100%</p>
          <p className="text-white/60 text-[14px] font-['Urbanist'] mt-1">Pre-verified talent</p>
        </div>
      </div>

      {/* Right — Content on dark bg */}
      <div className="w-[55%] bg-gradient-to-br from-[hsl(215,85%,12%)] to-[hsl(215,70%,8%)] flex flex-col justify-center px-16 py-12 relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[hsl(215,85%,55%)] opacity-[0.04] -top-[100px] -right-[100px]" />

        <p className="text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-6 font-['Urbanist']">
          The Lansa Difference
        </p>
        <h2 className="font-['Urbanist'] mb-3">
          <span className="text-[52px] font-extralight text-white leading-[1.1] block">Every Candidate is</span>
          <span className="text-[60px] font-black text-white leading-[1.0] block">Lansa Certified</span>
        </h2>
        <div className="w-16 h-[2px] bg-[hsl(var(--lansa-orange))] mb-8" />
        <p className="text-[16px] text-white/50 font-['Urbanist'] font-light mb-12 max-w-[440px] leading-relaxed">
          Before any candidate appears in your feed, they've passed a rigorous, sector-specific certification exam. No exceptions.
        </p>

        {/* Sector grid 2x2 */}
        <div className="grid grid-cols-2 gap-4 max-w-[520px]">
          {SECTORS.map((sector, i) => (
            <button
              key={i}
              onClick={() => openDetail(sector.detail)}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${sector.color}20` }}
              >
                <sector.icon className="h-5 w-5" style={{ color: sector.color }} />
              </div>
              <h3 className="text-[18px] font-bold text-white font-['Urbanist'] mb-1">{sector.title}</h3>
              <p className="text-[12px] text-white/40 leading-relaxed">{sector.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
