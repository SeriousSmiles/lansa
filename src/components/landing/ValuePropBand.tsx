import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Band, Display, Eyebrow, Lede, PillButton, ImageFrame } from "./_shared";
import photo from "@/assets/landing/people/p1-couch-phone.jpg";

export const ValuePropBand = () => {
  const navigate = useNavigate();
  return (
    <Band tone="white">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 order-2 md:order-1"
        >
          <Eyebrow>For professionals</Eyebrow>
          <Display>
            Bo ta bon.
            <br />
            <span className="text-primary">Now show it.</span>
          </Display>
          <Lede className="mt-6 max-w-xl text-[#0d0d0d]/70">
            Lansa turns your story, skills and certifications into a profile
            employers actually want to see — and connects you to the right ones.
          </Lede>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton variant="dark" onClick={() => navigate("/signup")}>
              Start free
            </PillButton>
            <PillButton variant="outline" onClick={() => navigate("/login")}>
              I already have an account
            </PillButton>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="md:col-span-5 order-1 md:order-2"
        >
          <ImageFrame src={photo} alt="Young professional smiling at her phone" />
        </motion.div>
      </div>
    </Band>
  );
};