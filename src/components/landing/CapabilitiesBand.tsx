import { motion } from "framer-motion";
import { FileText, ScrollText, BadgeCheck, Search, type LucideIcon } from "lucide-react";
import { Band, Eyebrow } from "./_shared";
 import photo from "@/assets/landing/people/ddbd09a7-ec4b-4dc1-a3b6-72d61f5c0485.png";

type Tile = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const TILES: readonly Tile[] = [
  {
    icon: FileText,
    title: "AI Profile Builder",
    body: "Guided prompts turn your real story into a complete, professional profile in minutes.",
  },
  {
    icon: ScrollText,
    title: "Resume Studio",
    body: "Designer-quality resumes in one click — exported as PDF, ready to send immediately.",
  },
  {
    icon: BadgeCheck,
    title: "Lansa Certification",
    body: "Sector exam, verified badge, and lifetime visibility on your high-intent profile.",
  },
  {
    icon: Search,
    title: "Smart Discovery",
    body: "Companies search certified profiles. You get matched directly, never buried in a pile.",
  },
] as const;

export const CapabilitiesBand = () => {
  return (
    <Band tone="blue">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-stretch">
        {/* Left: editorial column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col gap-12"
        >
          <div className="space-y-6">
            <Eyebrow tone="white">Built for momentum</Eyebrow>
            <h2 className="font-urbanist font-black text-white tracking-[-0.02em] text-[44px]/[0.9] sm:text-[56px]/[0.9] lg:text-[72px]/[0.9]">
              Everything you need.
              <br />
              Nothing you don't.
            </h2>
          </div>

          {/* Visual anchor */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-1 bg-gradient-to-tr from-primary/30 to-transparent opacity-60 blur-3xl rounded-full"
            />
            <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all duration-500 hover:border-white/20">
              <img
                src={photo}
                alt="Hands holding a phone with the Lansa app"
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </motion.div>

        {/* Right: tile grid — matches left column height */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 lg:h-full lg:auto-rows-fr">
          {TILES.map((t, i) => {
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                className="group h-full bg-white/5 border border-white/10 p-8 md:p-10 rounded-[2rem] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                  <t.icon strokeWidth={2.5} className="w-7 h-7 text-[#191f71]" />
                </div>
                <h3 className="font-urbanist font-extrabold text-white text-2xl mb-4 tracking-tight">
                  {t.title}
                </h3>
                <p className="font-public-sans text-white/55 leading-relaxed text-base md:text-lg">
                  {t.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Band>
  );
};