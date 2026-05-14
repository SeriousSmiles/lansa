import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const INDUSTRIES = [
  "Hospitality",
  "Finance",
  "Tech & Digital",
  "Healthcare",
  "Logistics",
  "Retail",
  "Education",
  "Tourism",
  "Construction",
];

export const TrustStrip = () => {
  return (
    <section className="relative bg-[hsl(40_33%_94%)] border-y border-[#191f71]/10 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center gap-6">
        <div className="flex items-center gap-2 shrink-0 text-[#191f71]/70">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-[0.18em] font-urbanist font-bold whitespace-nowrap">
            Trusted across
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden mask-fade-x">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          >
            {[...INDUSTRIES, ...INDUSTRIES].map((label, i) => (
              <span
                key={i}
                className="text-sm md:text-base font-urbanist font-semibold text-[#191f71]/55"
              >
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
      <style>{`
        .mask-fade-x {
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
      `}</style>
    </section>
  );
};
