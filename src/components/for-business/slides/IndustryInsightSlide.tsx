import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RotateCcw, AlertCircle } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

type FieldType = "slider" | "select" | "text";

interface Field {
  key: string;
  label: string;
  type: FieldType;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface IndustryConfig {
  image: string;
  fields: Field[];
}

interface AIInsight {
  headline_stat: string;
  headline_label: string;
  analysis: string;
  recommendation: string;
}

/* ──────────────────────── industry configs ───────────────────── */

const INDUSTRY_CONFIG: Record<string, IndustryConfig> = {
  retail: {
    image: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=1200&q=80",
    fields: [
      { key: "hires_per_year", label: "How many staff do you hire per year?", type: "slider", sliderMin: 5, sliderMax: 200, sliderStep: 5, sliderUnit: "hires" },
      { key: "avg_hourly_wage", label: "Average hourly wage ($)", type: "slider", sliderMin: 10, sliderMax: 40, sliderStep: 1, sliderUnit: "$/hr" },
      { key: "turnover_stage", label: "When do most new hires leave?", type: "select", options: [
        { label: "First week", value: "first_week" }, { label: "First month", value: "first_month" },
        { label: "First 90 days", value: "first_90_days" }, { label: "After 90 days", value: "after_90_days" },
      ]},
      { key: "screening_method", label: "Current screening method?", type: "select", options: [
        { label: "Interviews only", value: "interviews" }, { label: "References", value: "references" },
        { label: "Skills tests", value: "skills_tests" }, { label: "None", value: "none" },
      ]},
    ],
  },
  hospitality: {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    fields: [
      { key: "peak_months", label: "When is your peak season?", type: "select", options: [
        { label: "Summer (Jun–Aug)", value: "summer" }, { label: "Winter (Dec–Feb)", value: "winter" },
        { label: "Spring (Mar–May)", value: "spring" }, { label: "Year-round", value: "year_round" },
      ]},
      { key: "positions_to_fill", label: "Positions to fill per season", type: "slider", sliderMin: 5, sliderMax: 100, sliderStep: 5, sliderUnit: "roles" },
      { key: "lead_time_weeks", label: "How far ahead do you start hiring?", type: "select", options: [
        { label: "2 weeks", value: "2" }, { label: "4 weeks", value: "4" },
        { label: "6 weeks", value: "6" }, { label: "8+ weeks", value: "8+" },
      ]},
      { key: "biggest_pain", label: "Biggest staffing challenge?", type: "select", options: [
        { label: "No-shows on day 1", value: "no_shows" }, { label: "Skill mismatch", value: "skill_mismatch" },
        { label: "Last-minute quits", value: "last_minute_quits" }, { label: "Training time", value: "training_time" },
      ]},
    ],
  },
  tech: {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
    fields: [
      { key: "team_size", label: "Current engineering team size", type: "slider", sliderMin: 2, sliderMax: 200, sliderStep: 1, sliderUnit: "engineers" },
      { key: "cv_match_pct", label: "What % of hires match their CV claims?", type: "slider", sliderMin: 10, sliderMax: 100, sliderStep: 5, sliderUnit: "%" },
      { key: "primary_roles", label: "Primary roles you're hiring for?", type: "select", options: [
        { label: "Frontend", value: "frontend" }, { label: "Backend", value: "backend" },
        { label: "Fullstack", value: "fullstack" }, { label: "Data / ML", value: "data" },
        { label: "DevOps / Infra", value: "devops" },
      ]},
      { key: "vetting_method", label: "How do you vet candidates now?", type: "select", options: [
        { label: "Take-home projects", value: "take_home" }, { label: "Live coding", value: "live_coding" },
        { label: "CV review only", value: "cv_only" }, { label: "Agency", value: "agency" },
      ]},
    ],
  },
  healthcare: {
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80",
    fields: [
      { key: "facility_type", label: "Type of facility?", type: "select", options: [
        { label: "Hospital", value: "hospital" }, { label: "Clinic / GP", value: "clinic" },
        { label: "Aged care", value: "aged_care" }, { label: "Allied health", value: "allied_health" },
      ]},
      { key: "verification_time", label: "How long does credential verification take?", type: "select", options: [
        { label: "A few days", value: "days" }, { label: "1 week", value: "1wk" },
        { label: "2 weeks", value: "2wk" }, { label: "3+ weeks", value: "3wk" },
      ]},
      { key: "positions_per_quarter", label: "Positions to fill per quarter", type: "slider", sliderMin: 1, sliderMax: 50, sliderStep: 1, sliderUnit: "roles" },
      { key: "compliance_concern", label: "Compliance concern level?", type: "select", options: [
        { label: "Low", value: "low" }, { label: "Moderate", value: "moderate" },
        { label: "High", value: "high" }, { label: "Critical", value: "critical" },
      ]},
    ],
  },
  finance: {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    fields: [
      { key: "candidates_per_hire", label: "Candidates screened per hire", type: "slider", sliderMin: 5, sliderMax: 150, sliderStep: 5, sliderUnit: "candidates" },
      { key: "time_to_fill_weeks", label: "Average time-to-fill (weeks)", type: "slider", sliderMin: 1, sliderMax: 16, sliderStep: 1, sliderUnit: "weeks" },
      { key: "seniority_level", label: "Primary seniority level hiring?", type: "select", options: [
        { label: "Junior / Graduate", value: "junior" }, { label: "Mid-level", value: "mid" },
        { label: "Senior", value: "senior" }, { label: "Executive", value: "exec" },
      ]},
      { key: "screening_bottleneck", label: "Biggest screening bottleneck?", type: "select", options: [
        { label: "Too many applicants", value: "volume" }, { label: "Low quality", value: "quality" },
        { label: "Compliance checks", value: "compliance" }, { label: "Speed", value: "speed" },
      ]},
    ],
  },
  other: {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    fields: [
      { key: "company_size", label: "Company size?", type: "select", options: [
        { label: "1–10", value: "1-10" }, { label: "11–50", value: "11-50" },
        { label: "51–200", value: "51-200" }, { label: "200+", value: "200+" },
      ]},
      { key: "hires_per_year", label: "How many hires per year?", type: "slider", sliderMin: 1, sliderMax: 100, sliderStep: 1, sliderUnit: "hires" },
      { key: "biggest_frustration", label: "Biggest hiring frustration?", type: "select", options: [
        { label: "Takes too long", value: "time" }, { label: "Low quality candidates", value: "quality" },
        { label: "High turnover", value: "turnover" }, { label: "Too expensive", value: "cost" },
      ]},
      { key: "roles_hiring", label: "What roles are you hiring for?", type: "text", placeholder: "e.g. Sales reps, customer support, warehouse staff" },
    ],
  },
};

/* ──────────────────────── static fallbacks ───────────────────── */

const FALLBACK_INSIGHTS: Record<string, AIInsight> = {
  retail: { headline_stat: "$4,700", headline_label: "average cost per bad hire", analysis: "Retail turnover costs are among the highest — 1 in 3 new hires leave within 90 days.", recommendation: "Lansa's certification cuts early turnover to 1 in 10 by pre-verifying candidate fit before you invest in onboarding." },
  hospitality: { headline_stat: "42 days", headline_label: "average time to fill", analysis: "Most hospitality businesses start hiring too late and scramble to fill positions with whoever is available.", recommendation: "Lansa's pre-certified talent pool drops average fill time to 5 days — start 2 weeks out and still be fully staffed." },
  tech: { headline_stat: "94%", headline_label: "employer satisfaction with Lansa hires", analysis: "Only 55% of tech hires match their CV claims in practice. The gap between promise and performance is expensive.", recommendation: "Lansa Certified developers are pre-tested on real-world skills — stop guessing, start verifying." },
  healthcare: { headline_stat: "28 shifts", headline_label: "left uncovered per slow verification", analysis: "Manual credential verification creates dangerous staffing gaps during critical periods.", recommendation: "Lansa pre-verifies credentials before candidates enter the pool — they arrive deployment-ready, day one." },
  finance: { headline_stat: "75 hrs", headline_label: "wasted screening per quarter", analysis: "Finance teams screen far more candidates than necessary because they lack reliable pre-qualification.", recommendation: "Lansa shows you only certified, pre-ranked matches — most businesses hire within 5 candidate reviews." },
  other: { headline_stat: "Free", headline_label: "to start with Lansa", analysis: "The average business spends too long on unqualified applicants and high turnover.", recommendation: "Start with Lansa for free — 10 swipes/month, full job posting wizard, and access to the certified talent pool." },
};

/* ──────────────────────── component ─────────────────────────── */

type Phase = "collecting" | "loading" | "result" | "error";

interface IndustryInsightSlideProps {
  industry: string;
}

export function IndustryInsightSlide({ industry }: IndustryInsightSlideProps) {
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.other;

  // Initialise form values
  const [formValues, setFormValues] = useState<Record<string, string | number>>(() => {
    const init: Record<string, string | number> = {};
    for (const f of config.fields) {
      if (f.type === "slider") init[f.key] = Math.round(((f.sliderMin || 0) + (f.sliderMax || 100)) / 2);
      else init[f.key] = "";
    }
    return init;
  });
  const [phase, setPhase] = useState<Phase>("collecting");
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const setField = (key: string, value: string | number) =>
    setFormValues((prev) => ({ ...prev, [key]: value }));

  const allFilled = config.fields.every((f) => {
    const v = formValues[f.key];
    return v !== "" && v !== undefined;
  });

  const handleAnalyze = async () => {
    setPhase("loading");
    setIsFallback(false);
    try {
      const { data, error } = await supabase.functions.invoke("b2b-industry-insight", {
        body: { industry, inputs: formValues },
      });
      if (error || !data?.headline_stat) throw new Error(error?.message || "Invalid response");
      setInsight(data as AIInsight);
      setPhase("result");
    } catch (e) {
      console.error("AI insight error:", e);
      setInsight(FALLBACK_INSIGHTS[industry] || FALLBACK_INSIGHTS.other);
      setIsFallback(true);
      setPhase("result");
    }
  };

  const handleReset = () => {
    setPhase("collecting");
    setInsight(null);
    setIsFallback(false);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Photo panel — desktop only */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${config.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-[hsl(215,85%,12%)]/90" />
        <div className="absolute bottom-16 left-12 z-10">
          <p className="text-white/30 text-[13px] font-['Urbanist'] uppercase tracking-[0.25em] mb-2">Your Industry</p>
          <p className="text-[56px] font-black text-white/10 font-['Urbanist'] leading-none capitalize">{industry}</p>
        </div>
      </div>

      {/* Interactive area */}
      <div className="flex-1 bg-gradient-to-br from-[hsl(215,85%,12%)] to-[hsl(215,70%,8%)] flex flex-col justify-center px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-10 relative overflow-y-auto lg:w-[55%]">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[hsl(var(--lansa-orange))] opacity-[0.03] -bottom-[100px] -right-[50px]" />

        <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-3 lg:mb-5 font-['Urbanist']">
          {phase === "result" ? "Your Insight" : "Hiring Intelligence"}
        </p>
        <h2 className="font-['Urbanist'] mb-5 lg:mb-8">
          <span className="text-[22px] md:text-[28px] lg:text-[36px] font-extralight text-white leading-[1.2] block">
            {phase === "result" ? "Here's what we found" : "Tell us about your"}
          </span>
          <span className="text-[28px] md:text-[36px] lg:text-[44px] font-black text-white leading-[1.0] block">
            {phase === "result" ? "for your business" : "Hiring Situation"}
          </span>
        </h2>

        {/* ─── COLLECTING ─── */}
        {phase === "collecting" && (
          <div className="space-y-4 lg:space-y-5 max-w-[560px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
              {config.fields.map((field) => (
                <FieldInput key={field.key} field={field} value={formValues[field.key]} onChange={(v) => setField(field.key, v)} />
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!allFilled}
              className="flex items-center gap-2 px-8 py-3.5 lg:px-10 lg:py-4 bg-[hsl(var(--lansa-orange))] text-white rounded-xl text-[14px] lg:text-[16px] font-bold font-['Urbanist'] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[hsl(14,90%,60%)]/20"
            >
              <Sparkles className="w-4 h-4" />
              Analyze My Situation
            </button>
          </div>
        )}

        {/* ─── LOADING ─── */}
        {phase === "loading" && (
          <div className="max-w-[480px] space-y-6 animate-pulse">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[hsl(var(--lansa-orange))] animate-spin" />
              <p className="text-[16px] lg:text-[18px] text-white/80 font-['Urbanist'] font-medium">
                Lansa AI is analyzing your hiring data…
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-white/5 rounded-lg" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-20 bg-white/5 rounded-lg" />
              <div className="h-16 bg-white/5 rounded-lg" />
            </div>
          </div>
        )}

        {/* ─── RESULT ─── */}
        {phase === "result" && insight && (
          <div className="space-y-4 lg:space-y-5 max-w-[520px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isFallback && (
              <div className="flex items-center gap-2 text-[12px] text-white/40 font-['Urbanist'] bg-white/5 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5" />
                AI temporarily unavailable — showing industry benchmark
              </div>
            )}

            <p className="text-[48px] lg:text-[72px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist'] leading-none">
              {insight.headline_stat}
            </p>
            <p className="text-[13px] lg:text-[14px] text-white/40 font-['Urbanist'] uppercase tracking-[0.15em] font-semibold -mt-1">
              {insight.headline_label}
            </p>

            <div className="w-12 h-[2px] bg-[hsl(var(--lansa-orange))]" />

            <p className="text-[14px] lg:text-[16px] text-white/70 font-['Urbanist'] font-light leading-relaxed">
              {insight.analysis}
            </p>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-[11px] text-[hsl(var(--lansa-orange))] font-['Urbanist'] uppercase tracking-[0.2em] font-bold mb-1.5">
                How Lansa helps
              </p>
              <p className="text-[13px] lg:text-[15px] text-white/80 font-['Urbanist'] font-light leading-relaxed">
                {insight.recommendation}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[12px] lg:text-[13px] text-white/30 font-['Urbanist'] hover:text-white/50 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Try different values
              </button>
              {!isFallback && (
                <span className="flex items-center gap-1 text-[11px] text-white/20 font-['Urbanist']">
                  <Sparkles className="w-3 h-3" />
                  Powered by Lansa AI
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── field input ────────────────────────── */

function FieldInput({ field, value, onChange }: { field: Field; value: string | number; onChange: (v: string | number) => void }) {
  if (field.type === "slider") {
    return (
      <div className="space-y-1.5">
        <label className="text-[12px] lg:text-[13px] text-white/50 font-['Urbanist'] font-medium leading-tight block">
          {field.label}
        </label>
        <div className="relative w-full h-6 flex items-center">
          <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--lansa-orange))] rounded-full transition-all duration-100"
              style={{ width: `${((Number(value) - (field.sliderMin || 0)) / ((field.sliderMax || 100) - (field.sliderMin || 0))) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={field.sliderMin}
            max={field.sliderMax}
            step={field.sliderStep}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute w-6 h-6 rounded-full bg-[hsl(var(--lansa-orange))] shadow-[0_0_10px_rgba(255,140,50,0.5)] border-2 border-white/30 pointer-events-none transition-all duration-100"
            style={{ left: `calc(${((Number(value) - (field.sliderMin || 0)) / ((field.sliderMax || 100) - (field.sliderMin || 0))) * 100}% - 12px)` }}
          />
        </div>
        <div className="flex justify-between text-white/30 text-[11px] font-['Urbanist']">
          <span>{field.sliderMin}</span>
          <span className="text-[18px] lg:text-[22px] font-black text-white font-['Urbanist']">{value}</span>
          <span>{field.sliderMax} {field.sliderUnit}</span>
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <label className="text-[12px] lg:text-[13px] text-white/50 font-['Urbanist'] font-medium leading-tight block">
          {field.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] lg:text-[13px] font-['Urbanist'] font-medium transition-all duration-200 border",
                value === opt.value
                  ? "bg-[hsl(var(--lansa-orange))] text-white border-transparent"
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // text
  return (
    <div className="space-y-1.5 lg:col-span-2">
      <label className="text-[12px] lg:text-[13px] text-white/50 font-['Urbanist'] font-medium leading-tight block">
        {field.label}
      </label>
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] lg:text-[14px] text-white font-['Urbanist'] placeholder:text-white/25 focus:outline-none focus:border-[hsl(var(--lansa-orange))]/50 transition-colors"
      />
    </div>
  );
}
