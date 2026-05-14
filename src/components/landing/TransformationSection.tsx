import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STEPS = [
  {
    num: "01",
    kicker: "Build",
    title: "A profile that speaks for you.",
    body: "Answer a few guided prompts. Our AI shapes your story, your strengths, and your CV — instantly. No blank page. No guessing.",
    accent: "hsl(14 90% 60%)",
  },
  {
    num: "02",
    kicker: "Certify",
    title: "Proof employers actually trust.",
    body: "Take a sector exam built for the Caribbean market. Earn a Lansa Certified badge that puts you above the unverified pile.",
    accent: "hsl(215 85% 55%)",
  },
  {
    num: "03",
    kicker: "Get found",
    title: "Companies reach out to you.",
    body: "Once you're certified, employers see you in their discovery feed and start the conversation. No more chasing — be chosen.",
    accent: "#191f71",
  },
];

export const TransformationSection = () => {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-trans-reveal]", {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        const num = el.querySelector("[data-step-num]");
        if (num) {
          gsap.fromTo(
            num,
            { y: 80 },
            {
              y: -80,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative bg-[#191f71] text-white overflow-hidden py-28 md:py-40">
      {/* Ambient orange glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl mb-20 md:mb-28">
          <p
            data-trans-reveal
            className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5"
          >
            The Lansa transformation
          </p>
          <h2
            data-trans-reveal
            className="font-urbanist font-black text-5xl md:text-7xl leading-[0.95] tracking-tight"
          >
            From invisible
            <br />
            <span className="italic font-light">to</span> in demand.
          </h2>
        </div>

        <div className="space-y-24 md:space-y-40">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              data-step
              className="relative grid md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-5 relative overflow-hidden h-[200px] md:h-[280px]">
                <span
                  data-step-num
                  className="absolute inset-x-0 -top-6 font-urbanist font-black leading-none select-none text-[12rem] md:text-[18rem]"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `2px ${s.accent}`,
                  }}
                >
                  {s.num}
                </span>
              </div>
              <div className="md:col-span-7">
                <p
                  className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold mb-4"
                  style={{ color: s.accent }}
                >
                  {s.kicker}
                </p>
                <h3 className="font-urbanist font-black text-3xl md:text-5xl leading-tight tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-5 text-base md:text-lg font-public-sans text-white/70 leading-relaxed max-w-xl">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
