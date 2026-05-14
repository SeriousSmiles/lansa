import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import celebrate from "@/assets/landing/campaign-celebrate.jpg";

export const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative bg-[hsl(40_33%_94%)] overflow-hidden pt-24 md:pt-32 pb-0">
      <div className="mx-auto max-w-[1200px] px-6 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7 pb-12 md:pb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="font-urbanist font-black text-[#191f71] text-5xl md:text-7xl lg:text-8xl leading-[0.92] tracking-tight"
          >
            Bo ta buskando
            <br />
            <span className="italic font-light">bo</span> kaminda.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl font-public-sans text-[#191f71]/70 max-w-lg"
          >
            Lansa ta yuda. Build your profile, get certified, get found — free
            to start, today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate("/signup")}
              className="font-urbanist font-bold text-base px-8"
            >
              Get started — free
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/login")}
              className="font-urbanist font-bold text-base text-[#191f71] hover:bg-[#191f71]/5"
            >
              Sign in
            </Button>
          </motion.div>
        </div>

        <div className="md:col-span-5 relative h-[420px] md:h-[560px]">
          <img
            src={celebrate}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top md:object-center"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 70%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
};
