import { motion } from "framer-motion";
import {
  UserCircle2,
  FileText,
  Award,
  Radar,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CAPS = [
  {
    icon: UserCircle2,
    eyebrow: "Profile Builder",
    title: "Your story, sharpened.",
    body: "AI-guided prompts turn your experience into a profile employers actually read.",
    accent: "hsl(14 90% 60%)",
    bg: "hsl(14 90% 96%)",
  },
  {
    icon: FileText,
    eyebrow: "Resume Studio",
    title: "A CV that gets opened.",
    body: "Pick a template, drop in your story, export a print-ready PDF — free, every time.",
    accent: "hsl(215 85% 55%)",
    bg: "hsl(215 60% 96%)",
  },
  {
    icon: Award,
    eyebrow: "Certification",
    title: "Validated, not vouched.",
    body: "Sit a 15-question sector exam. Pass, and your profile carries a badge employers filter on.",
    accent: "#191f71",
    bg: "hsl(232 60% 96%)",
  },
  {
    icon: Radar,
    eyebrow: "Get Discovered",
    title: "Be in the room.",
    body: "Certified profiles surface in employer feeds. They reach out. You decide.",
    accent: "hsl(14 90% 60%)",
    bg: "hsl(40 50% 94%)",
  },
];

export const CapabilitiesSection = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[hsl(40_33%_94%)] py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5">
            What you actually get
          </p>
          <h2 className="font-urbanist font-black text-[#191f71] text-5xl md:text-6xl leading-[0.95] tracking-tight">
            Real tools.
            <br />
            <span className="italic font-light">Built for</span> getting hired.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {CAPS.map((c, i) => (
            <motion.button
              key={c.eyebrow}
              type="button"
              onClick={() => navigate("/signup")}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative text-left overflow-hidden rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-between border border-[#191f71]/8 transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(25,31,113,0.35)]"
              style={{ backgroundColor: c.bg }}
            >
              {/* Accent sweep on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 80% 0%, ${c.accent}22, transparent 60%)`,
                }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: c.accent }}
                >
                  <c.icon className="h-7 w-7 text-white" />
                </div>
                <ArrowUpRight
                  className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  style={{ color: c.accent }}
                />
              </div>
              <div className="relative">
                <p
                  className="text-xs uppercase tracking-[0.18em] font-urbanist font-bold mb-3"
                  style={{ color: c.accent }}
                >
                  {c.eyebrow}
                </p>
                <h3 className="font-urbanist font-black text-3xl md:text-4xl text-[#191f71] leading-tight tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-4 text-base font-public-sans text-[#191f71]/70 leading-relaxed max-w-md">
                  {c.body}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
