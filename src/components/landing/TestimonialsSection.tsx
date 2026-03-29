import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

const leftColumn: Testimonial[] = [
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
    quote: "As a small business owner, I finally found a platform where I can discover real local talent without the noise.",
    name: "Marlon Clarke",
    role: "Restaurant Owner, Barbados",
    stars: 5,
  },
  {
    quote: "Lansa's AI wrote a better profile for me in five minutes than I could have written in a week.",
    name: "Anika Persaud",
    role: "Recent Graduate, Guyana",
    stars: 4,
  },
];

const rightColumn: Testimonial[] = [
  {
    quote: "I was skeptical at first, but after getting certified I had three employers reach out to me directly.",
    name: "Dwayne Mitchell",
    role: "Electrician, St. Lucia",
    stars: 5,
  },
  {
    quote: "The whole experience felt like someone actually cared about helping me get started in my career.",
    name: "Renee Baptiste",
    role: "Customer Service, Curaçao",
    stars: 5,
  },
  {
    quote: "We hired two certified candidates through Lansa. The quality of applicants was noticeably higher.",
    name: "Simone Grant",
    role: "HR Manager, Trinidad",
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
        className={i < count ? "fill-primary text-primary" : "text-border"}
      />
    ))}
  </div>
);

const TestimonialCard = ({ t }: { t: Testimonial }) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <Stars count={t.stars} />
    <p className="mt-4 text-foreground font-public-sans text-sm leading-relaxed">
      "{t.quote}"
    </p>
    <div className="mt-4">
      <p className="font-urbanist font-semibold text-foreground text-sm">{t.name}</p>
      <p className="text-xs text-muted-foreground font-public-sans">{t.role}</p>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section ref={sectionRef} className="bg-background py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-[5%]">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold font-urbanist text-foreground md:text-5xl leading-tight">
            Everyone Took Their Step 1 — Once
          </h2>
          <p className="mt-4 text-muted-foreground font-public-sans text-base md:text-lg">
            Starting out can feel uncertain — Lansa makes it feel supported.
          </p>
        </div>

        {/* Desktop: two parallax columns */}
        <div className="hidden md:grid grid-cols-2 gap-6">
          <motion.div style={{ y: leftY }} className="flex flex-col gap-6">
            {leftColumn.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </motion.div>
          <motion.div style={{ y: rightY }} className="flex flex-col gap-6">
            {rightColumn.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </motion.div>
        </div>

        {/* Mobile: single column */}
        <div className="flex flex-col gap-5 md:hidden">
          {[...leftColumn.slice(0, 2), ...rightColumn.slice(0, 2)].map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};
