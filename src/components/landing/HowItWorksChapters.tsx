import { motion } from "framer-motion";
import { Band, Display, Eyebrow, Lede, ImageFrame } from "./_shared";
import p2 from "@/assets/landing/people/p2-cafe-laptop.jpg";
import p3 from "@/assets/landing/people/p3-desk-certificate.jpg";
import p4 from "@/assets/landing/people/p4-videocall.jpg">

const STEPS = [
  {
    number: "01",
    eyebrow: "Build",
    title: (
      <>
        Tell your real
        <br />
        professional story.
      </>
    ),
    body:
      "Skip the resume gymnastics. Lansa's guided builder turns your background — even if it's untraditional — into a profile that lands.",
    image: p2,
    alt: "Young professional working on his laptop in a bright café",
  },
  {
    number: "02",
    eyebrow: "Get certified",
    title: (
      <>
        Prove what you
        <br />
        already know.
      </>
    ),
    body:
      "Take a 25-minute Lansa Certification in your sector. Pass it once, and the badge follows your profile everywhere employers look.",
    image: p3,
    alt: "Young woman receiving her Lansa certification at her desk",
  },
  {
    number: "03",
    eyebrow: "Get discovered",
    title: (
      <>
        The right employer
        <br />
        comes to you.
      </>
    ),
    body:
      "Certified profiles surface first. Companies on Lansa see you, save you, and start the conversation. You stay in control.",
    image: p4,
    alt: "Young man on a friendly video call with a recruiter",
  },
] as const;

export const HowItWorksChapters = () => {
  return (
    <Band tone="cream">
      <div className="max-w-[700px] mb-16 md:mb-24">
        <Eyebrow>How Lansa works</Eyebrow>
        <Display>
          Three steps. One
          <br />
          honest shortcut.
        </Display>
      </div>
      <div className="space-y-24 md:space-y-32">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className={`grid md:grid-cols-12 gap-10 md:gap-16 items-center ${
              i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="md:col-span-5">
              <ImageFrame src={step.image} alt={step.alt} />
            </div>
            <div className="md:col-span-7">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-urbanist font-black text-5xl md:text-6xl text-primary leading-none">
                  {step.number}
                </span>
                <Eyebrow>{step.eyebrow}</Eyebrow>
              </div>
              <h3 className="font-urbanist font-black text-[36px] md:text-[56px] leading-[0.95] tracking-[-0.02em]">
                {step.title}
              </h3>
              <Lede className="mt-5 max-w-xl text-[#0d0d0d]/70">
                {step.body}
              </Lede>
            </div>
          </motion.div>
        ))}
      </div>
    </Band>
  );
};