import { useRef, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TESTIMONIALS } from "@/data/testimonials";

gsap.registerPlugin(ScrollTrigger);

const SELECTED = TESTIMONIALS.slice(0, 8);

// Scattered absolute positions for desktop cards (top%, left%, width in px, optional rotate deg)
const DESKTOP_CARD_LAYOUT: {
  top: string;
  left: string;
  width: string;
  rotate?: number;
}[] = [
  { top: "4%", left: "3%", width: "280px", rotate: -1.5 },
  { top: "8%", left: "72%", width: "290px", rotate: 1.2 },
  { top: "22%", left: "38%", width: "275px", rotate: -0.8 },
  { top: "30%", left: "6%", width: "285px", rotate: 1 },
  { top: "38%", left: "68%", width: "280px", rotate: -1.2 },
  { top: "52%", left: "25%", width: "290px", rotate: 0.6 },
  { top: "60%", left: "62%", width: "275px", rotate: -0.5 },
  { top: "72%", left: "8%", width: "285px", rotate: 1.5 },
];

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

const TestimonialCard = ({ t }: { t: (typeof TESTIMONIALS)[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0-1
    const y = (e.clientY - rect.top) / rect.height; // 0-1

    const rotateY = (x - 0.5) * 16; // -8 to 8
    const rotateX = (0.5 - y) * 16; // -8 to 8

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Fixed light source at top-left: glare moves WITH the tilt toward the light
    const glareX = 30 + rotateY * 2;
    const glareY = 30 - rotateX * 2;

    glare.style.opacity = "1";
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glare) glare.style.opacity = "0";
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
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
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
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-4">
        <p className="font-urbanist font-semibold text-white text-sm">{t.name}</p>
        <p className="text-xs text-white/60 font-public-sans">{t.title}</p>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = stageRef.current?.querySelectorAll(".testimonial-card");
    if (!cards?.length) return;

    gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });

    const tl = gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
        end: "60% 60%",
        scrub: 1,
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
      className="relative overflow-hidden"
      style={{ backgroundColor: "hsl(215 85% 40%)" }}
    >
      {/* Decorative blur circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/3 left-2/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-2/3 left-1/4 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      {/* ===== DESKTOP: tall scroll stage with absolute cards ===== */}
      <div className="hidden md:block relative" style={{ height: "380vh" }}>
        {/* Sticky heading — stays centered while user scrolls */}
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none z-0">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 font-urbanist">
              Real Stories
            </p>
            <h2 className="text-[12rem] lg:text-[16rem] font-urbanist font-bold text-white/[0.06] leading-none select-none whitespace-nowrap">
              Real Stories
            </h2>
            <p className="mt-4 text-white/50 font-public-sans text-base max-w-lg mx-auto">
              Starting out can feel uncertain — Lansa makes it feel supported.
            </p>
          </div>
        </div>

        {/* Absolute card field */}
        <div
          ref={stageRef}
          className="absolute inset-0 z-10"
          style={{ perspective: "1200px" }}
        >
          {SELECTED.map((t, i) => {
            const pos = DESKTOP_CARD_LAYOUT[i];
            return (
              <div
                key={t.id}
                className="absolute"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  transform: pos.rotate ? `rotate(${pos.rotate}deg)` : undefined,
                }}
              >
                <TestimonialCard t={t} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== MOBILE: simple stacked grid ===== */}
      <div className="md:hidden py-20 px-[5%]">
        <div className="text-center mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70 font-urbanist">
            Real Stories
          </p>
          <p className="mt-2 text-white/70 font-public-sans text-base">
            Starting out can feel uncertain — Lansa makes it feel supported.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {SELECTED.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4"
            >
              <div className="mb-3 overflow-hidden rounded-xl aspect-square">
                <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <Stars count={t.stars} />
              <p className="mt-2 text-white/90 font-public-sans text-xs leading-relaxed">
                &ldquo;{t.quote}&rdquo;
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
