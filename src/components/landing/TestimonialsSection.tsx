import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "I went from not having a CV to getting interview calls in two weeks. Lansa made it effortless.",
    name: "Keisha Williams",
    role: "Marketing Graduate, Trinidad",
    stars: 5,
  },
  {
    quote: "The certification gave me something concrete to show employers. It changed how they looked at me.",
    name: "Andre Joseph",
    role: "IT Support Specialist, Jamaica",
    stars: 5,
  },
  {
    quote: "I was skeptical at first, but after getting certified I had three employers reach out to me directly.",
    name: "Dwayne Mitchell",
    role: "Electrician, St. Lucia",
    stars: 5,
  },
  {
    quote: "Lansa's AI wrote a better profile for me in five minutes than I could have written in a week.",
    name: "Anika Persaud",
    role: "Recent Graduate, Guyana",
    stars: 4,
  },
  {
    quote: "We hired two certified candidates through Lansa. The quality of applicants was noticeably higher.",
    name: "Simone Grant",
    role: "HR Manager, Trinidad",
    stars: 5,
  },
  {
    quote: "The whole experience felt like someone actually cared about helping me get started in my career.",
    name: "Renee Baptiste",
    role: "Customer Service, Curaçao",
    stars: 5,
  },
  {
    quote: "As a small business owner, I finally found a platform where I can discover real local talent without the noise.",
    name: "Marlon Clarke",
    role: "Restaurant Owner, Barbados",
    stars: 5,
  },
  {
    quote: "Finally a platform that understands what young Caribbean professionals actually need.",
    name: "Tariq Abdullah",
    role: "Graphic Designer, Suriname",
    stars: 4,
  },
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

const springConfig = { stiffness: 150, damping: 20 };

const TestimonialCard = ({ t }: { t: Testimonial }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      rotateX.set((dy / (rect.height / 2)) * -8);
      rotateY.set((dx / (rect.width / 2)) * 8);
      glareX.set(((e.clientX - rect.left) / rect.width) * 100);
      glareY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [rotateX, rotateY, glareX, glareY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
    setIsHovered(false);
  }, [rotateX, rotateY, glareX, glareY]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={(e) => {
        setIsHovered(true);
        handleMouseMove(e);
      }}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
      className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg will-change-transform cursor-default"
    >
      {/* Glare overlay */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
          }}
        />
      )}

      <Stars count={t.stars} />
      <p className="mt-4 text-white/90 font-public-sans text-sm leading-relaxed">
        "{t.quote}"
      </p>
      <div className="mt-4">
        <p className="font-urbanist font-semibold text-white text-sm">{t.name}</p>
        <p className="text-xs text-white/60 font-public-sans">{t.role}</p>
      </div>
    </motion.div>
  );
};

const shouldOffset = (index: number) => index === 1 || index === 3 || index === 7;

export const TestimonialsSection = () => {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: "hsl(215 85% 55%)" }}
    >
      {/* Decorative blur circles for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-[5%]">
        {/* Header text */}
        <div className="mb-14 text-center max-w-2xl mx-auto relative z-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70 font-urbanist">
            Real Stories
          </p>
          <p className="mt-4 text-white/70 font-public-sans text-base md:text-lg">
            Starting out can feel uncertain — Lansa makes it feel supported.
          </p>
        </div>

        {/* Large background heading behind cards */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-urbanist font-bold text-white/[0.06] leading-none text-center select-none whitespace-nowrap">
            Real Stories
          </h2>
        </div>

        {/* Desktop: staggered 4-col grid */}
        <div className="hidden md:grid grid-cols-4 gap-6 relative z-10">
          {testimonials.map((t, index) => (
            <div key={t.name} className={shouldOffset(index) ? "mt-12" : ""}>
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>

        {/* Mobile: 2-col simple grid, no tilt */}
        <div className="grid grid-cols-2 gap-4 md:hidden relative z-10">
          {testimonials.slice(0, 6).map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5"
            >
              <Stars count={t.stars} />
              <p className="mt-3 text-white/90 font-public-sans text-xs leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-3">
                <p className="font-urbanist font-semibold text-white text-xs">{t.name}</p>
                <p className="text-[10px] text-white/60 font-public-sans">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
