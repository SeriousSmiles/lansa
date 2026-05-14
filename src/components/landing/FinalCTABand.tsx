import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PillButton } from "./_shared";
import bg from "@/assets/landing/people/p8-finalcta-hero.jpg";

export const FinalCTABand = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full overflow-hidden bg-[#191f71] text-white">
      <div className="absolute inset-0">
        <img
          src={bg}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-left opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#191f71]/40 via-[#191f71]/70 to-[#191f71]" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10 py-28 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="md:max-w-[640px] md:ml-auto"
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5">
            Your next move
          </p>
          <h2 className="font-urbanist font-black tracking-[-0.02em] text-[44px]/[0.85] sm:text-[56px]/[0.85] md:text-[80px]/[0.85]">
            Bo ta ribe lista?
            <br />
            <span className="text-primary">Let's go.</span>
          </h2>
          <p className="mt-6 font-public-sans text-base md:text-lg text-white/75 max-w-lg">
            Build your profile, take the certification, get found. The platform
            does the heavy lifting — you just stay you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton variant="orange" onClick={() => navigate("/signup")}>
              Create my profile
            </PillButton>
            <PillButton variant="white" onClick={() => navigate("/pricing")}>
              See pricing
            </PillButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};