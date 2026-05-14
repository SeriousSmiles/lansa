import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const QUOTES = [
  {
    pap: "Bo no ta pèrdí.",
    sub: "I stopped feeling invisible. My profile got a real reply within a week.",
    name: "Shanaya",
    title: "Hospitality, Willemstad",
  },
  {
    pap: "Awor mi tin un plan.",
    sub: "The certification gave me something tangible to show. It changed every conversation.",
    name: "Damian",
    title: "Logistics, Curaçao",
  },
  {
    pap: "Mi profil ta mi.",
    sub: "It feels like the platform actually understands where I'm coming from.",
    name: "Kayla",
    title: "Finance graduate",
  },
];

export const QuoteTestimonials = () => {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-quote]", {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-[hsl(40_33%_94%)] py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-5">
            Real voices
          </p>
          <h2 className="font-urbanist font-black text-[#191f71] text-5xl md:text-6xl leading-[0.95] tracking-tight">
            Curaçao,
            <br />
            <span className="italic font-light">talking back.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {QUOTES.map((q, i) => (
            <article
              key={i}
              data-quote
              className="relative bg-white rounded-3xl p-8 md:p-10 border border-[#191f71]/10 overflow-hidden min-h-[340px] flex flex-col justify-between"
            >
              <h3
                className="font-urbanist font-black text-4xl md:text-5xl leading-[0.95] tracking-tight text-[#191f71] relative"
                style={{
                  textShadow:
                    "3px 3px 0 hsl(14 90% 60% / 0.85)",
                }}
              >
                {q.pap}
              </h3>
              <div>
                <p className="text-base font-public-sans text-[#191f71]/75 leading-relaxed mb-5">
                  &ldquo;{q.sub}&rdquo;
                </p>
                <div className="border-t border-[#191f71]/10 pt-4">
                  <p className="font-urbanist font-bold text-[#191f71] text-sm">
                    {q.name}
                  </p>
                  <p className="text-xs font-public-sans text-[#191f71]/55 mt-0.5">
                    {q.title}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
