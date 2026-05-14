import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_LOGOS = [
  "Hotel Group",
  "Bank Co.",
  "Tech Studio",
  "Logistics SA",
  "Retail NV",
  "Tourism Brd",
];

export const CompaniesSoonSection = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-cs]", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });

      gsap.to("[data-shimmer]", {
        backgroundPosition: "200% 0",
        repeat: -1,
        duration: 2.5,
        ease: "none",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative bg-[#191f71] text-white overflow-hidden py-24 md:py-32"
    >
      <div className="pointer-events-none absolute -top-32 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <p
            data-cs
            className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5 inline-flex items-center gap-2"
          >
            <Lock className="h-3.5 w-3.5" /> Companies, incoming
          </p>
          <h2
            data-cs
            className="font-urbanist font-black text-5xl md:text-7xl leading-[0.95] tracking-tight"
          >
            Companies are
            <br />
            <span className="italic font-light">already</span> getting ready.
          </h2>

          <div data-cs className="mt-10 grid grid-cols-3 gap-3">
            {PLACEHOLDER_LOGOS.map((label, i) => (
              <div
                key={i}
                className="relative h-14 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden flex items-center justify-center"
              >
                <span className="text-xs font-urbanist font-semibold text-white/30 select-none blur-sm">
                  {label}
                </span>
                <div
                  data-shimmer
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <div
            data-cs
            className="bg-white/[0.06] backdrop-blur rounded-3xl p-8 md:p-10 border border-white/10"
          >
            <p className="text-xs uppercase tracking-[0.18em] font-urbanist font-bold text-primary mb-3">
              Hiring? Start here.
            </p>
            <h3 className="font-urbanist font-black text-2xl md:text-3xl leading-tight tracking-tight">
              Be among the first 25 employers on Lansa.
            </h3>
            <p className="mt-4 text-sm md:text-base font-public-sans text-white/70 leading-relaxed">
              Get early access to certified Caribbean talent before the public
              launch. Founder pricing locked in.
            </p>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate("/for-business")}
              className="mt-6 w-full font-urbanist font-bold text-base"
            >
              Get listed early <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-xs text-center text-white/40 font-public-sans">
              No payment now · 2-minute application
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
