import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confused from "@/assets/landing/campaign-confused.png";
import thumbsup from "@/assets/landing/campaign-thumbsup.png";

gsap.registerPlugin(ScrollTrigger);

export const ProblemPromiseSection = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-pp-reveal]", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });

      // Crossfade confused → thumbs up as section scrolls
      gsap.to("[data-img-confused]", {
        opacity: 0,
        x: -60,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 40%",
          end: "bottom 60%",
          scrub: true,
        },
      });
      gsap.fromTo(
        "[data-img-thumbs]",
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 40%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );

      // Bubble draw-in
      const bubble = ref.current?.querySelector<SVGPathElement>("[data-bubble]");
      if (bubble) {
        const len = bubble.getTotalLength();
        gsap.set(bubble, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(bubble, {
          strokeDashoffset: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 60%",
            end: "top 20%",
            scrub: true,
          },
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative bg-[hsl(40_33%_94%)] overflow-hidden py-24 md:py-40"
    >
      {/* Cut-out figures break out of container */}
      <div className="pointer-events-none absolute inset-0">
        <img
          data-img-confused
          src={confused}
          alt=""
          className="absolute -left-[6%] bottom-0 w-[55%] max-w-[640px] hidden md:block"
        />
        <img
          data-img-thumbs
          src={thumbsup}
          alt=""
          className="absolute -right-[4%] bottom-0 w-[50%] max-w-[600px] opacity-0 hidden md:block"
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6">
        <div className="md:ml-[40%] max-w-xl">
          <p
            data-pp-reveal
            className="text-xs uppercase tracking-[0.22em] font-urbanist font-bold text-primary mb-6"
          >
            Realidat vs Ekspektashon
          </p>
          <h2
            data-pp-reveal
            className="font-urbanist font-black text-[#191f71] text-5xl md:text-7xl leading-[0.95] tracking-tight"
          >
            Bo no ta
            <br />
            <span className="relative inline-block">
              pèrdí.
              <span className="absolute -inset-x-2 bottom-1 -z-10 h-3 bg-primary/30" />
            </span>
          </h2>
          <p
            data-pp-reveal
            className="mt-6 text-lg md:text-xl font-public-sans text-[#191f71]/75 leading-relaxed"
          >
            Sending CV after CV into silence. Watching opportunities go to
            people who simply knew the right person. That ends here.
          </p>
          <p
            data-pp-reveal
            className="mt-4 text-base md:text-lg font-public-sans text-[#191f71]/60"
          >
            Lansa puts you on the map — with a profile employers can find,
            certifications they trust, and a path you can actually walk.
          </p>
        </div>

        {/* Mobile cut-out */}
        <div className="md:hidden mt-10 -mx-6">
          <img src={thumbsup} alt="" className="w-full" />
        </div>
      </div>

      {/* Sketchy speech bubble */}
      <svg
        className="hidden md:block absolute top-10 right-[6%] w-[280px] h-[140px] pointer-events-none"
        viewBox="0 0 280 140"
        fill="none"
      >
        <path
          data-bubble
          d="M40 60 Q20 30 60 25 Q90 5 140 18 Q190 8 220 28 Q260 30 250 70 Q270 110 220 110 L100 115 Q70 130 60 100 Q15 95 40 60 Z"
          stroke="hsl(14 90% 60%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="140"
          y="75"
          textAnchor="middle"
          className="font-urbanist"
          fill="hsl(14 90% 60%)"
          fontSize="18"
          fontStyle="italic"
          fontWeight="600"
        >
          Mi ta bai hanja
        </text>
        <text
          x="140"
          y="98"
          textAnchor="middle"
          className="font-urbanist"
          fill="hsl(14 90% 60%)"
          fontSize="18"
          fontStyle="italic"
          fontWeight="600"
        >
          trabou awe!
        </text>
      </svg>
    </section>
  );
};
