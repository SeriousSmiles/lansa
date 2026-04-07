import { useState } from "react";
import { cn } from "@/lib/utils";

const INDUSTRY_CONFIG: Record<string, {
  image: string;
  question: string;
  inputType: "slider" | "select";
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  selectOptions?: { label: string; value: string }[];
  calculateInsight: (value: number | string) => { bigStat: string; description: string };
}> = {
  retail: {
    image: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=1200&q=80",
    question: "How many staff do you hire per year?",
    inputType: "slider",
    sliderMin: 5,
    sliderMax: 100,
    sliderStep: 5,
    sliderUnit: "hires",
    calculateInsight: (value) => {
      const cost = Math.round(Number(value) * 4700 * 0.33);
      return {
        bigStat: `$${cost.toLocaleString()}`,
        description: `At ${value} hires/year, you're losing an estimated $${cost.toLocaleString()} annually to bad hires. 1 in 3 retail employees leave within 90 days — Lansa's certification cuts early turnover to just 1 in 10.`,
      };
    },
  },
  hospitality: {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    question: "How many weeks before peak season do you start hiring?",
    inputType: "select",
    selectOptions: [
      { label: "2 weeks", value: "2" },
      { label: "4 weeks", value: "4" },
      { label: "6 weeks", value: "6" },
      { label: "8+ weeks", value: "8" },
    ],
    calculateInsight: (value) => {
      const fillRates: Record<string, number> = { "2": 35, "4": 58, "6": 74, "8": 89 };
      const rate = fillRates[String(value)] || 58;
      return {
        bigStat: `${rate}%`,
        description: `Hotels that start ${value} weeks out fill only ${rate}% of positions on time. With Lansa, average fill time drops from 42 to 5 days — start 2 weeks out and still be fully staffed.`,
      };
    },
  },
  tech: {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
    question: "What % of your tech hires match their CV claims?",
    inputType: "slider",
    sliderMin: 20,
    sliderMax: 100,
    sliderStep: 5,
    sliderUnit: "%",
    calculateInsight: (value) => {
      const gap = Number(value) - 55;
      const sentiment = gap > 0 ? "You're above the industry average of 55%, but there's still room to improve." : "That's below the industry average of 55% — and even the average is concerning.";
      return {
        bigStat: "94%",
        description: `${sentiment} Lansa Certified developers are pre-tested on real-world skills — employers report a 94% satisfaction rate on skill match. Stop guessing, start verifying.`,
      };
    },
  },
  healthcare: {
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80",
    question: "How long does your credential verification take?",
    inputType: "select",
    selectOptions: [
      { label: "A few days", value: "days" },
      { label: "1 week", value: "1wk" },
      { label: "2 weeks", value: "2wk" },
      { label: "3+ weeks", value: "3wk" },
    ],
    calculateInsight: (value) => {
      const shifts: Record<string, number> = { days: 3, "1wk": 14, "2wk": 28, "3wk": 42 };
      const s = shifts[String(value)] || 14;
      return {
        bigStat: `${s} shifts`,
        description: `Your current verification timeline leaves approximately ${s} shifts uncovered per new hire. Lansa pre-verifies credentials before candidates enter the talent pool — they arrive deployment-ready, day one.`,
      };
    },
  },
  finance: {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    question: "How many candidates do you screen per hire?",
    inputType: "slider",
    sliderMin: 10,
    sliderMax: 100,
    sliderStep: 5,
    sliderUnit: "candidates",
    calculateInsight: (value) => {
      const hours = Math.round(Number(value) * 0.75);
      return {
        bigStat: `${hours} hrs`,
        description: `At ${value} candidates per hire, you're spending ~${hours} hours screening. Lansa shows you only certified, pre-ranked matches — most businesses hire within 5 candidate reviews.`,
      };
    },
  },
  other: {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    question: "What's your biggest hiring frustration?",
    inputType: "select",
    selectOptions: [
      { label: "Takes too long", value: "time" },
      { label: "Low quality candidates", value: "quality" },
      { label: "High turnover", value: "turnover" },
      { label: "Too expensive", value: "cost" },
    ],
    calculateInsight: (value) => {
      const insights: Record<string, { bigStat: string; description: string }> = {
        time: { bigStat: "5 days", description: "The average Lansa hire takes just 3-7 days from posting to offer. Our certified candidate pool means zero time wasted on unqualified applicants." },
        quality: { bigStat: "94%", description: "94% of employers report satisfaction with Lansa Certified hires. Every candidate has passed a rigorous, sector-specific assessment before you ever see them." },
        turnover: { bigStat: "1 in 10", description: "Lansa Certified hires show just 1 in 10 early departure rate, compared to the industry average of 1 in 3. Certification reveals true fit, not just interview polish." },
        cost: { bigStat: "Free", description: "Start with Lansa for free — 10 swipes per month, full job posting wizard, and access to the same certified talent pool. No hidden fees, no agencies, no job board subscriptions." },
      };
      return insights[String(value)] || insights.quality;
    },
  },
};

interface IndustryInsightSlideProps {
  industry: string;
}

export function IndustryInsightSlide({ industry }: IndustryInsightSlideProps) {
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.other;
  const [sliderValue, setSliderValue] = useState(
    config.inputType === "slider" ? Math.round(((config.sliderMin || 0) + (config.sliderMax || 100)) / 2) : 0
  );
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const currentValue = config.inputType === "slider" ? sliderValue : selectValue;
  const insight = currentValue !== null ? config.calculateInsight(currentValue) : null;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Atmospheric photo — hidden on mobile */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-[hsl(215,85%,12%)]/90" />
        
        {/* Decorative text */}
        <div className="absolute bottom-16 left-12 z-10">
          <p className="text-white/30 text-[13px] font-['Urbanist'] uppercase tracking-[0.25em] mb-2">Your Industry</p>
          <p className="text-[56px] font-black text-white/10 font-['Urbanist'] leading-none capitalize">{industry}</p>
        </div>
      </div>

      {/* Interactive area */}
      <div className="flex-1 bg-gradient-to-br from-[hsl(215,85%,12%)] to-[hsl(215,70%,8%)] flex flex-col justify-center px-6 py-8 md:px-10 md:py-10 lg:px-16 lg:py-12 relative overflow-hidden lg:w-[55%]">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[hsl(var(--lansa-orange))] opacity-[0.03] -bottom-[100px] -right-[50px]" />

        <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-4 lg:mb-6 font-['Urbanist']">
          Your Insight
        </p>
        <h2 className="font-['Urbanist'] mb-6 lg:mb-10">
          <span className="text-[26px] md:text-[32px] lg:text-[40px] font-extralight text-white leading-[1.2] block">Let's find your</span>
          <span className="text-[32px] md:text-[40px] lg:text-[48px] font-black text-white leading-[1.0] block">Hidden Cost</span>
        </h2>

        {!revealed ? (
          <div className="space-y-6 lg:space-y-8 max-w-[480px]">
            <p className="text-[15px] lg:text-[18px] text-white/70 font-['Urbanist'] font-light leading-relaxed">
              {config.question}
            </p>

            {config.inputType === "slider" ? (
              <div className="space-y-3 lg:space-y-4">
                <input
                  type="range"
                  min={config.sliderMin}
                  max={config.sliderMax}
                  step={config.sliderStep}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--lansa-orange))] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-white/40 text-[12px] lg:text-[13px] font-['Urbanist']">
                  <span>{config.sliderMin} {config.sliderUnit}</span>
                  <span className="text-[24px] lg:text-[28px] font-black text-white font-['Urbanist']">{sliderValue}</span>
                  <span>{config.sliderMax} {config.sliderUnit}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {config.selectOptions?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectValue(opt.value)}
                    className={cn(
                      "px-4 py-3 lg:px-6 lg:py-4 rounded-xl text-[14px] lg:text-[15px] font-['Urbanist'] font-medium transition-all duration-200 border",
                      selectValue === opt.value
                        ? "bg-[hsl(var(--lansa-orange))] text-white border-transparent"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleReveal}
              disabled={config.inputType === "select" && !selectValue}
              className="px-8 py-3.5 lg:px-10 lg:py-4 bg-[hsl(var(--lansa-orange))] text-white rounded-xl text-[15px] lg:text-[16px] font-bold font-['Urbanist'] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[hsl(14,90%,60%)]/20"
            >
              Reveal My Insight →
            </button>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6 max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-[48px] lg:text-[80px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist'] leading-none">
              {insight?.bigStat}
            </p>
            <div className="w-12 h-[2px] bg-[hsl(var(--lansa-orange))]" />
            <p className="text-[14px] lg:text-[16px] text-white/70 font-['Urbanist'] font-light leading-relaxed">
              {insight?.description}
            </p>
            <button
              onClick={() => setRevealed(false)}
              className="text-[12px] lg:text-[13px] text-white/30 font-['Urbanist'] hover:text-white/50 transition-colors mt-2 lg:mt-4"
            >
              ← Try different values
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
