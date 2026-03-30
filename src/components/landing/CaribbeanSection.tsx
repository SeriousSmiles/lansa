import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Building2, Globe } from "lucide-react";
import homepage3 from "@/assets/homepage-3.png";

const stats = [
  { icon: Users, value: "500+", label: "Certified Professionals" },
  { icon: Building2, value: "50+", label: "Partner Businesses" },
  { icon: Globe, value: "12", label: "Caribbean Nations" },
];

export const CaribbeanSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary font-urbanist">
              For Us, By Us
            </p>
            <h2 className="text-3xl font-bold font-urbanist text-foreground md:text-5xl leading-tight">
              Crafted for Caribbean Dreams and Aspirations
            </h2>
            <p className="text-muted-foreground font-public-sans text-base md:text-lg leading-relaxed">
              Lansa gives young professionals across the Caribbean the tools to
              compete — globally. Build an AI-powered profile in minutes, earn
              verified certifications that employers trust, generate a
              professional CV for free, and connect directly with businesses
              looking for talent like you.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative flex flex-col items-center gap-1 rounded-xl border border-primary/15 bg-background py-4 px-2 shadow-sm"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full lansa-gradient-primary" />
                  <s.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="text-2xl font-bold font-urbanist text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground font-public-sans text-center leading-tight">{s.label}</span>
                </motion.div>
              ))}
            </div>

            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/signup")}
                className="font-urbanist font-semibold"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-2xl shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <img
              src={homepage3}
              alt="Young Caribbean professionals collaborating"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
