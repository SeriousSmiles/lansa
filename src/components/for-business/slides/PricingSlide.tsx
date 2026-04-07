import { useState } from "react";
import { DetailContent } from "../DetailSheet";
import { Check, Sparkles } from "lucide-react";

interface PricingSlideProps {
  openDetail: (content: DetailContent) => void;
}

interface CommitmentOption {
  key: string;
  label: string;
  months: number;
  monthly: number;
  total: number;
  savings: number;
  badge?: string;
}

const COMMITMENTS: CommitmentOption[] = [
  { key: "3mo", label: "3 Months", months: 3, monthly: 150, total: 450, savings: 0 },
  { key: "6mo", label: "6 Months", months: 6, monthly: 125, total: 750, savings: 17, badge: "Save 17%" },
  { key: "12mo", label: "12 Months", months: 12, monthly: 100, total: 1200, savings: 33, badge: "Best Value" },
];

const ALL_FEATURES = [
  "Unlimited candidate swipes",
  "Job posting wizard",
  "In-app messaging",
  "Lansa Certified candidates",
  "AI candidate summaries",
  "Priority job listings",
  "Hiring analytics dashboard",
  "Dedicated onboarding support",
];

export function PricingSlide({ openDetail }: PricingSlideProps) {
  const [selected, setSelected] = useState("3mo");
  const plan = COMMITMENTS.find((c) => c.key === selected)!;

  return (
    <div className="w-full min-h-full lg:h-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80)" }}
      />
      <div className="absolute inset-0 bg-[hsl(215,85%,8%)]/95" />

      <div className="relative z-10 min-h-full lg:h-full flex flex-col items-center justify-center px-6 md:px-10 lg:px-[120px] py-8 pb-20 lg:py-0">
        <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-3 lg:mb-4 font-['Urbanist']">
          Commitment Pricing
        </p>
        <h2 className="font-['Urbanist'] mb-2 lg:mb-3 text-center">
          <span className="text-[28px] md:text-[40px] lg:text-[56px] font-extralight text-white leading-[1.1]">Built for Hiring. </span>
          <span className="text-[28px] md:text-[40px] lg:text-[56px] font-black text-white leading-[1.1]">Priced for Growth.</span>
        </h2>
        <p className="text-[13px] lg:text-[16px] text-white/40 font-['Urbanist'] font-light mb-4 lg:mb-6 text-center max-w-[500px]">
          One plan, full access. Choose a commitment — the longer, the more you save.
        </p>

        {/* Open Beta callout */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 lg:mb-10">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--lansa-orange))]" />
          <span className="text-[11px] lg:text-[12px] text-white/50 font-['Urbanist']">
            Open Beta — select pilot companies get free access.{" "}
            <button
              onClick={() => openDetail({
                title: "Open Beta Program",
                description: "We're onboarding a limited number of companies to pilot Lansa for free during our beta phase.",
                bullets: [
                  "Full platform access at no cost during the pilot period",
                  "Direct line to our product team for feedback",
                  "Priority when new features launch",
                  "No commitment required — just real feedback",
                  "Limited spots available — apply now",
                ],
                stat: "Free Pilot"
              })}
              className="text-[hsl(var(--lansa-orange))] underline underline-offset-2"
            >
              Apply
            </button>
          </span>
        </div>

        {/* Commitment picker — 3 columns */}
        <div className="flex gap-3 lg:gap-4 w-full max-w-[700px] mb-6 lg:mb-10">
          {COMMITMENTS.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className={`flex-1 relative rounded-xl lg:rounded-2xl border p-4 lg:p-6 text-center transition-all duration-200 cursor-pointer ${
                selected === c.key
                  ? "bg-white/15 border-[hsl(var(--lansa-blue))]/60 shadow-lg shadow-[hsl(var(--lansa-blue))]/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {c.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[hsl(var(--lansa-orange))] text-white text-[9px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full font-['Urbanist'] whitespace-nowrap">
                  {c.badge}
                </span>
              )}
              <p className={`text-[11px] lg:text-[12px] font-semibold mb-2 font-['Urbanist'] ${
                selected === c.key ? "text-[hsl(var(--lansa-blue))]" : "text-white/40"
              }`}>
                {c.label}
              </p>
              <p className="text-[24px] lg:text-[36px] font-black text-white font-['Urbanist'] leading-none">
                XCG {c.monthly}
              </p>
              <p className="text-[11px] lg:text-[12px] text-white/30 font-['Urbanist'] mt-1">/month</p>
              <p className="text-[10px] lg:text-[11px] text-white/20 font-['Urbanist'] mt-2">
                XCG {c.total.toLocaleString()} total
              </p>
            </button>
          ))}
        </div>

        {/* Features + CTA */}
        <button
          onClick={() => openDetail({
            title: `Lansa for Business — ${plan.label}`,
            description: `Full platform access at XCG ${plan.monthly}/month (XCG ${plan.total.toLocaleString()} total).${plan.savings > 0 ? ` Save ${plan.savings}% vs monthly.` : ''}`,
            bullets: [
              "Unlimited candidate swipes — browse the entire certified talent pool",
              "AI-powered candidate summaries save hours of manual review",
              "Priority job listings appear at the top of candidate feeds",
              "Full hiring analytics dashboard with pipeline tracking",
              "Job posting wizard with templates",
              "In-app messaging with candidates",
              "Dedicated onboarding support for your team",
              "All candidates are Lansa Certified — verified, practical skills",
            ],
            stat: `XCG ${plan.monthly}/mo`
          })}
          className="w-full max-w-[700px] bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-left hover:bg-white/15 transition-all duration-200 cursor-pointer group"
        >
          <p className="text-[13px] lg:text-[15px] font-semibold text-white/60 font-['Urbanist'] mb-4">Everything included:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 mb-6">
            {ALL_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 lg:gap-3">
                <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-emerald-400" />
                <span className="text-[13px] lg:text-[14px] text-white/70 font-['Urbanist']">{f}</span>
              </div>
            ))}
          </div>
          <div className="w-full py-2.5 lg:py-3 rounded-lg bg-[hsl(var(--lansa-blue))] text-center text-[13px] lg:text-[14px] font-semibold text-white font-['Urbanist'] group-hover:opacity-90 transition-opacity">
            Get Started — {plan.label}
          </div>
        </button>
      </div>
    </div>
  );
}
