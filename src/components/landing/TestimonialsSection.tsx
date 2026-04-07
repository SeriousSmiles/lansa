import { useRef, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TESTIMONIALS } from "@/data/testimonials";

gsap.registerPlugin(ScrollTrigger);

const SELECTED = TESTIMONIALS.slice(0, 8);

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < count ? "fill-amber-400 text-amber-400" : "text-white/20"}
      />
    ))}
  </div>
);

const TestimonialCard = ({
  t,
}: {
  t: (typeof TESTIMONIALS)[0];
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    const rotateX = dy * -8;
    const rotateY = dx * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Glare shifts opposite to tilt for realistic light reflection
    const glareX = 50 - rotateY * 2.5;
    const glareY = 50 + rotateX * 2.5;

    glare.style.opacity = "1";
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glare) {
      glare.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={cardRef}
      className="testimonial-card relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-lg cursor-default will-change-transform"
      style={{ transformStyle: "preserve-3d", perspective: "800px" }}
    >
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* Avatar */}
      <div className="mb-4 overflow-hidden rounded-xl aspect-square">
        <img
          src={t.avatar}
          alt={t.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <Stars count={t.stars} />
      <p className="mt-3 text-white/90 font-public-sans text-sm leading-relaxed">
        "{t.quote}"
      </p>
      <div className="mt-4">
        <p className="font-urbanist font-semibold text-white text-sm">{t.name}</p>
        <p className="text-xs text-white/60 font-public-sans">{t.title}</p>
      </div>
    </div>
  );
};

const shouldOffset = (index: number) => index === 1 || index === 3 || index === 7;

export const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".testimonial-card");
    if (!cards?.length) return;

    gsap.set(cards, { opacity: 0, y: 60, scale: 0.92 });

    const tl = gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        end: "bottom 60%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 md:py-36"
      style={{ backgroundColor: "hsl(215 85% 40%)" }}
    >
      {/* Decorative blur circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-[5%]">
        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto relative z-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70 font-urbanist">
            Real Stories
          </p>
          <p className="mt-4 text-white/70 font-public-sans text-base md:text-lg">
            Starting out can feel uncertain — Lansa makes it feel supported.
          </p>
        </div>

        {/* Large background heading */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-urbanist font-bold text-white/[0.06] leading-none text-center select-none whitespace-nowrap">
            Real Stories
          </h2>
        </div>

        {/* Desktop grid */}
        <div
          ref={gridRef}
          className="hidden md:grid grid-cols-4 gap-6 relative z-10"
          style={{ perspective: "1200px" }}
        >
          {SELECTED.map((t, index) => (
            <div key={t.id} className={shouldOffset(index) ? "mt-12" : ""}>
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>

        {/* Mobile grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden relative z-10">
          {SELECTED.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4"
            >
              <div className="mb-3 overflow-hidden rounded-xl aspect-square">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <Stars count={t.stars} />
              <p className="mt-2 text-white/90 font-public-sans text-xs leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-3">
                <p className="font-urbanist font-semibold text-white text-xs">{t.name}</p>
                <p className="text-[10px] text-white/60 font-public-sans">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
