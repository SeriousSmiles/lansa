import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Band, Display, Eyebrow, Lede, PillButton, ImageFrame } from "./_shared";
import photo from "@/assets/landing/people/p7-blazer-laptop.jpg";

export const CompaniesSoonBand = () => {
  const navigate = useNavigate();
  return (
    <Band tone="orange">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7"
        >
          <Eyebrow tone="dark">For employers</Eyebrow>
          <Display>
            Looking for
            <br />
            real talent?
          </Display>
          <Lede className="mt-6 max-w-xl text-[#0d0d0d]/75">
            We're onboarding the first wave of companies on Lansa. Be one of the
            founding employers — get featured access to certified candidates the
            day we go public.
          </Lede>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PillButton variant="dark" onClick={() => navigate("/for-business")}>
              Get listed early
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </PillButton>
            <span className="font-public-sans text-sm text-[#0d0d0d]/70">
              Free for the first 50 organizations.
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="md:col-span-5"
        >
          <ImageFrame
            src={photo}
            alt="Hiring manager reviewing certified candidates"
          />
        </motion.div>
      </div>
    </Band>
  );
};