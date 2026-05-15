import { motion } from "framer-motion";
import { Band, Eyebrow, ImageFrame } from "./_shared";
import photo from "@/assets/landing/people/p6-friends-phone.jpg";

export const TestimonialBand = () => {
  return (
    <Band tone="white">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7"
        >
          <Eyebrow>Real stories</Eyebrow>
          <blockquote className="font-urbanist font-black text-[36px] md:text-[56px] leading-[1.02] tracking-[-0.02em] text-secondary">
            <span className="text-primary">"</span>I made my Lansa profile on a
            Sunday. By Wednesday a hotel group reached out. I didn't even know
            they were hiring.<span className="text-primary">"</span>
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center font-urbanist font-black text-primary">
              S
            </div>
            <div>
              <p className="font-urbanist font-bold text-[#0d0d0d]">
                Shaniqua R.
              </p>
              <p className="font-public-sans text-sm text-[#0d0d0d]/60">
                Hospitality · Willemstad
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="md:col-span-5"
        >
          <ImageFrame src={photo} alt="Two friends celebrating an opportunity" />
        </motion.div>
      </div>
    </Band>
  );
};