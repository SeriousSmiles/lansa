import { motion, useScroll, useTransform, useMotionValue, MotionValue } from "framer-motion";
import { UserPlus, Award, Briefcase, ArrowRight } from "lucide-react";
import { useRef } from "react";
import homepage5 from "@/assets/homepage-5.png";
import homepage6 from "@/assets/homepage-6.png";
import homepage7 from "@/assets/homepage-7.png";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Build Your Profile",
    description:
      "Sign up for free, answer a few guided questions, and let our AI craft your professional profile and CV instantly — no writing experience needed. In under five minutes, you'll have a polished profile ready to share with employers.",
    image: homepage5,
  },
  {
    num: "02",
    icon: Award,
    title: "Get Certified",
    description:
      "Take industry-specific certification exams that validate your real-world skills. Earn Lansa Certified credentials that set you apart and give employers the confidence to reach out first.",
    image: homepage6,
  },
  {
    num: "03",
    icon: Briefcase,
    title: "Connect & Get Hired",
    description:
      "Employers browse certified talent, match with candidates who fit their needs, and reach out directly through the platform. No middlemen, no gatekeeping — just real opportunities.",
    image: homepage7,
  },
];

const useCalculateScales = (totalSections: number, scrollYProgress: MotionValue<number>) => {
  const scales: MotionValue<number>[] = [];
  for (let index = 0; index < totalSections; index++) {
    const sectionFraction = 1 / totalSections;
    const start = sectionFraction * index;
    const end = sectionFraction * (index + 1);
    if (index < totalSections - 1) {
      scales.push(useTransform(scrollYProgress, [start, end], [1, 0.8]));
    } else {
      scales.push(useMotionValue(1));
    }
  }
  return scales;
};

export const HowItWorksSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end 60%"],
  });

  const scales = useCalculateScales(steps.length, scrollYProgress);

  return (
    <section id="how-it-works" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-[5%] py-20 md:py-28">
        <motion.div
          className="mb-8 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary font-urbanist">
            Simple by Design
          </p>
          <h2 className="text-3xl font-bold font-urbanist text-foreground md:text-5xl leading-tight">
            From Sign-Up to Hired —{" "}
            <span className="text-primary">In Three Steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground font-public-sans text-base md:text-lg leading-relaxed">
            We removed every barrier between you and your next opportunity. No résumé writers, no expensive courses, no waiting — just clear steps forward.
          </p>
        </motion.div>
      </div>

      {/* Scroll-driven stacking container */}
      <div ref={containerRef} className="relative">
        {steps.map((step, index) => (
          <FeatureCard
            key={step.num}
            step={step}
            index={index}
            scale={scales[index]}
          />
        ))}
      </div>
    </section>
  );
};

const FeatureCard = ({
  step,
  index,
  scale,
}: {
  step: (typeof steps)[0];
  index: number;
  scale: MotionValue<number>;
}) => {
  const isEven = index % 2 === 0;
  const Icon = step.icon;

  return (
    <div className="sticky top-0 flex min-h-screen items-center justify-center px-[5%] py-10 md:py-0">
      <motion.div
        style={{ scale }}
        className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12),0_2px_12px_-4px_rgba(0,0,0,0.06)]"
      >
        <div
          className={`grid min-h-[70vh] items-center gap-8 p-8 md:grid-cols-2 md:gap-12 md:p-16 ${
            !isEven ? "md:[direction:rtl]" : ""
          }`}
        >
          {/* Text */}
          <div className={`flex flex-col gap-5 ${!isEven ? "md:[direction:ltr]" : ""}`}>
            <div className="flex items-center gap-4">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full lansa-gradient-primary text-primary-foreground font-urbanist font-bold text-lg shadow-lg">
                {step.num}
              </span>
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold font-urbanist text-foreground md:text-4xl">
              {step.title}
            </h3>
            <p className="text-muted-foreground font-public-sans text-base leading-relaxed md:text-lg">
              {step.description}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary font-urbanist hover:underline"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Image */}
          <div className={`overflow-hidden rounded-2xl ${!isEven ? "md:[direction:ltr]" : ""}`}>
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-auto object-cover aspect-[4/3] rounded-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
