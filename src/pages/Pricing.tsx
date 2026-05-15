import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CircleCheck, X, ShieldCheck, Award, Sparkles, ArrowUpRight } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SEOHead } from "@/components/SEOHead";
import { Band, Display, Eyebrow, Lede, PillButton } from "@/components/landing/_shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ───── Data ───── */

const professionalFeatures = [
  "AI-powered professional profile",
  "Free CV generation & PDF download",
  "Job discovery feed",
  "In-app messaging with employers",
  "Mentor educational content",
];

interface CommitmentPlan {
  key: string;
  label: string;
  months: number;
  monthly: number;
  total: number;
  savings: number;
  badge?: string;
}

const commitmentPlans: CommitmentPlan[] = [
  { key: "3mo", label: "3 Months", months: 3, monthly: 150, total: 450, savings: 0 },
  { key: "6mo", label: "6 Months", months: 6, monthly: 125, total: 750, savings: 17, badge: "Save 17%" },
  { key: "12mo", label: "12 Months", months: 12, monthly: 100, total: 1200, savings: 33, badge: "Best Value" },
];

const businessFeatures = [
  "Unlimited candidate swipes",
  "Job posting wizard",
  "In-app messaging",
  "Browse Lansa Certified candidates",
  "AI candidate summaries",
  "Priority job listings",
  "Hiring analytics dashboard",
  "Dedicated onboarding support",
];

interface CompRow { feature: string; included: boolean | string; }

const professionalComparison: CompRow[] = [
  { feature: "AI Profile Generation", included: true },
  { feature: "CV Download (PDF)", included: true },
  { feature: "Certification Exams", included: "XCG 25 / exam" },
  { feature: "Job Discovery Feed", included: true },
  { feature: "In-app Messaging", included: true },
  { feature: "Mentor Content", included: true },
];

const businessComparison: CompRow[] = [
  { feature: "Candidate Swipes", included: "Unlimited" },
  { feature: "Job Posting Wizard", included: true },
  { feature: "In-app Messaging", included: true },
  { feature: "Browse Certified Candidates", included: true },
  { feature: "AI Candidate Summaries", included: true },
  { feature: "Priority Listings", included: true },
  { feature: "Hiring Analytics", included: true },
  { feature: "Dedicated Support", included: true },
];

const faqs = [
  {
    q: "Is Lansa really free for professionals?",
    a: "Yes. Creating your profile, generating your CV, discovering jobs, and messaging are all completely free. The only cost is XCG 25 per certification exam, which includes 2 attempts. Certification is what gets you in front of employers — it's the gateway to opportunity.",
  },
  {
    q: "What is XCG?",
    a: "XCG stands for Caribbean Guilder (also known as ANG — Antilliaanse Gulden), the official currency of Curaçao and Sint Maarten. All Lansa pricing is displayed in XCG.",
  },
  {
    q: "How does the business commitment model work?",
    a: "Employers choose a commitment period: 3, 6, or 12 months. The longer the commitment, the lower the monthly rate. All plans include the full feature set — unlimited swipes, AI summaries, analytics, and more.",
  },
  {
    q: "Is there a free plan for employers?",
    a: "There is no free tier for employers. However, we're currently in open beta and offering select pilot companies free access for a limited time. Contact us to learn if you qualify.",
  },
  {
    q: "What does 'Lansa Certified' mean?",
    a: "Lansa Certified means a candidate has passed one or more industry-specific exams on our platform. It gives employers confidence that the person has verified, practical skills.",
  },
  {
    q: "Can I cancel my business subscription?",
    a: "Your subscription runs for the duration of your chosen commitment period (3, 6, or 12 months). You can choose not to renew at the end of your term. No auto-renewal surprises.",
  },
];

/* ───── Helpers ───── */

const Cell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string")
    return <span className="font-public-sans text-sm font-semibold text-[#191f71]">{value}</span>;
  return value ? (
    <CircleCheck className="mx-auto h-5 w-5 text-primary" />
  ) : (
    <X className="mx-auto h-5 w-5 text-[#0d0d0d]/20" />
  );
};

/* ───── Cards ───── */

const ProfessionalCard = ({ onAction }: { onAction: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.5 }}
    className="mx-auto max-w-2xl"
  >
    <div className="relative rounded-[2.5rem] bg-white border border-[#191f71]/10 p-8 md:p-12 shadow-[0_40px_80px_-40px_rgba(25,31,113,0.25)]">
      <span className="absolute -top-3.5 left-10 rounded-full bg-[#191f71] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white font-urbanist">
        Always free
      </span>

      <div className="mb-8">
        <p className="font-urbanist font-bold text-[11px] uppercase tracking-[0.22em] text-primary mb-3">
          For professionals
        </p>
        <h3 className="font-urbanist font-black text-[#191f71] text-5xl md:text-6xl tracking-[-0.02em] leading-[0.95]">
          XCG 0
        </h3>
        <p className="mt-3 font-public-sans text-[#0d0d0d]/60 text-base">
          Build your profile, find jobs, and connect with employers — at no cost.
        </p>
      </div>

      <div className="mb-8 flex items-start gap-3 rounded-2xl bg-[hsl(40_33%_96%)] px-5 py-4">
        <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <span className="font-public-sans text-sm text-[#0d0d0d]/75">
          Certification exams: <span className="font-semibold text-[#191f71]">XCG 25 per exam</span> — 2 attempts included.
        </span>
      </div>

      <ul className="grid gap-4 mb-10">
        {professionalFeatures.map((f) => (
          <li key={f} className="flex items-start gap-3 font-public-sans text-[15px] text-[#0d0d0d]/80">
            <CircleCheck className="h-5 w-5 mt-0.5 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <PillButton variant="dark" onClick={onAction}>
        Get started free
        <ArrowUpRight className="ml-2 h-5 w-5" />
      </PillButton>
    </div>
  </motion.div>
);

const BusinessCard = ({ onAction }: { onAction: () => void }) => {
  const [selected, setSelected] = useState("3mo");
  const plan = commitmentPlans.find((p) => p.key === selected)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl"
    >
      {/* Open beta strip */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-full bg-[hsl(40_33%_96%)] px-5 py-3 text-center">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-urbanist font-bold text-xs uppercase tracking-[0.18em] text-[#191f71]">
          Open beta
        </span>
        <span className="font-public-sans text-sm text-[#0d0d0d]/70">
          Select pilot companies are using Lansa free for a limited time.
        </span>
        <button
          onClick={onAction}
          className="font-public-sans text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Apply
        </button>
      </div>

      <div className="relative rounded-[2.5rem] bg-white border border-[#191f71]/10 p-8 md:p-12 shadow-[0_40px_80px_-40px_rgba(25,31,113,0.25)]">
        <span className="absolute -top-3.5 left-10 rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white font-urbanist">
          For employers
        </span>

        {/* Commitment selector */}
        <div className="mb-8 grid grid-cols-3 gap-2 md:gap-3">
          {commitmentPlans.map((cp) => {
            const active = selected === cp.key;
            return (
              <button
                key={cp.key}
                onClick={() => setSelected(cp.key)}
                className={`relative rounded-2xl border-2 px-3 py-4 text-center transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-[#191f71]/10 bg-white hover:border-[#191f71]/30"
                }`}
              >
                {cp.badge && (
                  <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold font-urbanist text-white ${
                    cp.key === "12mo" ? "bg-[#191f71]" : "bg-primary"
                  }`}>
                    {cp.badge}
                  </span>
                )}
                <span className={`block font-urbanist font-bold text-xs uppercase tracking-[0.14em] mb-1 ${
                  active ? "text-primary" : "text-[#0d0d0d]/50"
                }`}>
                  {cp.label}
                </span>
                <span className="block font-urbanist font-black text-2xl text-[#191f71]">
                  XCG {cp.monthly}
                </span>
                <span className="block font-public-sans text-[11px] text-[#0d0d0d]/50">/month</span>
              </button>
            );
          })}
        </div>

        {/* Headline price */}
        <div className="mb-8 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-urbanist font-black text-[#191f71] text-6xl md:text-7xl tracking-[-0.02em] leading-none">
              XCG {plan.monthly}
            </span>
            <span className="font-public-sans text-[#0d0d0d]/60 text-base">/month</span>
          </div>
          <p className="mt-3 font-public-sans text-sm text-[#0d0d0d]/60">
            XCG {plan.total.toLocaleString()} total for {plan.months} months
            {plan.savings > 0 && (
              <span className="ml-2 font-semibold text-primary">· Save {plan.savings}%</span>
            )}
          </p>
        </div>

        <ul className="mb-10 grid gap-3 md:grid-cols-2">
          {businessFeatures.map((f) => (
            <li key={f} className="flex items-start gap-3 font-public-sans text-[15px] text-[#0d0d0d]/80">
              <CircleCheck className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <PillButton variant="orange" onClick={onAction}>
          Get started — {plan.label}
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </PillButton>
      </div>
    </motion.div>
  );
};

/* ───── Page ───── */

const Pricing = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"pro" | "biz">("pro");
  const rows = view === "pro" ? professionalComparison : businessComparison;

  return (
    <div className="min-h-screen bg-[hsl(40_33%_96%)]">
      <SEOHead
        title="Lansa Pricing — Plans for Professionals & Employers"
        description="Free for professionals. Commitment-based plans for Caribbean employers. Transparent XCG pricing built for Curaçao."
        canonical="https://www.lansa.online/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <LandingNavbar />

      {/* Hero — blue band */}
      <Band tone="blue" className="pt-32 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow tone="white">Simple pricing</Eyebrow>
          <h1 className="font-urbanist font-black text-white tracking-[-0.02em] text-[44px]/[0.9] sm:text-[64px]/[0.9] md:text-[88px]/[0.88]">
            Free for talent.
            <br />
            <span className="text-primary">Built for business.</span>
          </h1>
          <Lede className="mx-auto mt-6 max-w-xl text-white/70">
            Professionals use Lansa free. Employers invest in access to certified, verified Caribbean talent.
          </Lede>

          {/* Tab switcher */}
          <div className="mt-10 inline-flex rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
            <button
              onClick={() => setView("pro")}
              className={`rounded-full px-6 py-3 font-urbanist font-semibold text-sm transition-colors ${
                view === "pro"
                  ? "bg-white text-[#191f71]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              For professionals
            </button>
            <button
              onClick={() => setView("biz")}
              className={`rounded-full px-6 py-3 font-urbanist font-semibold text-sm transition-colors ${
                view === "biz"
                  ? "bg-primary text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              For employers
            </button>
          </div>
        </div>
      </Band>

      {/* Plan card — cream/white band */}
      <Band tone={view === "pro" ? "cream" : "white"}>
        <AnimatePresence mode="wait">
          {view === "pro" ? (
            <ProfessionalCard key="pro" onAction={() => navigate("/signup")} />
          ) : (
            <BusinessCard key="biz" onAction={() => navigate("/signup")} />
          )}
        </AnimatePresence>
      </Band>

      {/* Feature comparison */}
      <Band tone={view === "pro" ? "white" : "cream"}>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>What's included</Eyebrow>
          <Display className="text-[36px]/[0.95] sm:text-[48px]/[0.95] md:text-[64px]/[0.95]">
            Every feature,
            <br />
            no fine print.
          </Display>

          <div className="mt-12 overflow-hidden rounded-[2rem] bg-white border border-[#191f71]/10">
            <div className="grid grid-cols-[1fr_140px] bg-[#191f71] px-6 py-5">
              <span className="font-urbanist font-bold text-white text-sm uppercase tracking-[0.16em]">
                Feature
              </span>
              <span className="text-center font-urbanist font-bold text-white text-sm uppercase tracking-[0.16em]">
                Included
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.ul
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {rows.map((row, i) => (
                  <li
                    key={row.feature}
                    className={`grid grid-cols-[1fr_140px] items-center px-6 py-5 ${
                      i % 2 === 0 ? "bg-white" : "bg-[hsl(40_33%_98%)]"
                    }`}
                  >
                    <span className="font-public-sans text-[15px] text-[#0d0d0d]/85">
                      {row.feature}
                    </span>
                    <Cell value={row.included} />
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </Band>

      {/* Trust strip — orange band */}
      <Band tone="orange">
        <div className="mx-auto max-w-3xl text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#191f71]" strokeWidth={2} />
          <h2 className="mt-6 font-urbanist font-black text-[#0d0d0d] tracking-[-0.02em] text-[36px]/[0.95] sm:text-[48px]/[0.95] md:text-[64px]/[0.95]">
            Every candidate
            <br />
            is Lansa Certified.
          </h2>
          <Lede className="mx-auto mt-6 max-w-xl text-[#0d0d0d]/75">
            Our certification system means employers only connect with verified, qualified talent —
            so both sides start with confidence.
          </Lede>
          <div className="mt-8 flex justify-center">
            <PillButton variant="dark" onClick={() => navigate("/signup")}>
              Create your free account
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </PillButton>
          </div>
        </div>
      </Band>

      {/* FAQ — cream band */}
      <Band tone="cream">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Questions</Eyebrow>
          <Display className="text-[36px]/[0.95] sm:text-[48px]/[0.95] md:text-[64px]/[0.95]">
            Frequently asked.
          </Display>

          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="overflow-hidden rounded-2xl border border-[#191f71]/10 bg-white px-6"
              >
                <AccordionTrigger className="py-5 text-left font-urbanist font-bold text-[#191f71] text-base hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 font-public-sans text-[15px] leading-relaxed text-[#0d0d0d]/70">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Band>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
