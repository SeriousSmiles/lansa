import { motion } from "framer-motion";
import { UserPlus, Award, Briefcase } from "lucide-react";
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

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-muted/20 py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <motion.div
          className="mb-16 max-w-2xl"
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

        <div className="flex flex-col gap-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                i % 2 !== 0 ? "md:[direction:rtl]" : ""
              }`}
            >
              <div className={`flex flex-col gap-5 ${i % 2 !== 0 ? "md:[direction:ltr]" : ""}`}>
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-urbanist font-bold text-lg">
                    {step.num}
                  </span>
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-urbanist text-foreground md:text-3xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground font-public-sans text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className={`overflow-hidden rounded-2xl bg-muted ${i % 2 !== 0 ? "md:[direction:ltr]" : ""}`}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
