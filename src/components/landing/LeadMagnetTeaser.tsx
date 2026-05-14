import { motion } from "framer-motion";
import { Gauge, Sparkles } from "lucide-react";

export const LeadMagnetTeaser = () => {
  return (
    <section className="bg-[hsl(40_33%_94%)] py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#191f71] via-[#191f71] to-[#2a3399] text-white p-10 md:p-16"
        >
          <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary/30 blur-3xl" />
          <div className="relative grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <p className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Coming soon · Free
              </p>
              <h2 className="font-urbanist font-black text-4xl md:text-6xl leading-[0.95] tracking-tight">
                Know your worth
                <br />
                <span className="italic font-light">in 60 seconds.</span>
              </h2>
              <p className="mt-5 text-base md:text-lg font-public-sans text-white/75 leading-relaxed max-w-xl">
                A free Curaçao salary &amp; market-fit calculator. Tell us your
                role, get a real benchmark and the next move to make. No
                signup, no fluff.
              </p>
            </div>
            <div className="md:col-span-5">
              <div className="relative rounded-2xl bg-white/[0.06] border border-white/10 p-6 md:p-8 backdrop-blur">
                <Gauge className="h-10 w-10 text-primary mb-4" />
                <div className="space-y-3">
                  <div className="h-3 w-3/4 rounded-full bg-white/10" />
                  <div className="h-3 w-1/2 rounded-full bg-white/10" />
                  <div className="h-3 w-2/3 rounded-full bg-white/10" />
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-xs font-urbanist font-bold text-primary uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  In development
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
