import { motion } from "framer-motion";
import { FileText, ScrollText, BadgeCheck, Search } from "lucide-react";
import { Band, Display, Eyebrow, ImageFrame } from "./_shared";
import photo from "@/assets/landing/people/p5-hands-phone.jpg";

const TILES = [
  {
    icon: FileText,
    title: "AI Profile Builder",
    body: "Guided prompts turn your real story into a complete profile in minutes.",
  },
  {
    icon: ScrollText,
    title: "Resume Studio",
    body: "Designer-quality resumes in one click — exported as PDF, ready to send.",
  },
  {
    icon: BadgeCheck,
    title: "Lansa Certification",
    body: "Sector exam, verified badge, lifetime visibility on your profile.",
  },
  {
    icon: Search,
    title: "Smart Discovery",
    body: "Companies search certified profiles. You get matched, not buried.",
  },
] as const;

export const CapabilitiesBand = () => {
  return (
    <Band tone="blue">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5 md:sticky md:top-28"
        >
          <Eyebrow tone="white">Built for momentum</Eyebrow>
          <Display className="text-white">
            Everything you
            <br />
            need. Nothing
            <br />
            you don't.
          </Display>
          <div className="mt-10 hidden md:block">
            <ImageFrame
              src={photo}
              alt="Hands holding a phone with the Lansa app"
              ratio="3/4"
            />
          </div>
        </motion.div>
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-5 md:gap-6">
          {TILES.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-3xl bg-white/[0.06] border border-white/10 p-7 md:p-8 backdrop-blur-sm hover:bg-white/[0.1] transition-colors"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-5">
                <t.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-urbanist font-black text-2xl md:text-3xl leading-tight tracking-tight text-white">
                {t.title}
              </h3>
              <p className="mt-3 font-public-sans text-base text-white/70 leading-relaxed">
                {t.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Band>
  );
};