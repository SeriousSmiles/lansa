import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import manifesto from "@/assets/illustrations/manifesto.webp";
import buildArt from "@/assets/illustrations/build.webp";
import certifyArt from "@/assets/illustrations/certify.webp";
import discoverArt from "@/assets/illustrations/discover.webp";
import iProfile from "@/assets/illustrations/i-profile.webp";
import iResume from "@/assets/illustrations/i-resume.webp";
import iCert from "@/assets/illustrations/i-cert.webp";
import iDiscover from "@/assets/illustrations/i-discover.webp";
import welcome from "@/assets/illustrations/welcome.webp";
import feed from "@/assets/illustrations/feed.webp";
import learning from "@/assets/illustrations/learning.webp";
import hiring from "@/assets/illustrations/hiring.webp";
import jobs from "@/assets/illustrations/jobs.webp";
import inbox from "@/assets/illustrations/inbox.webp";
import p2 from "@/assets/landing/people/p2-cafe-laptop.jpg";
import p3 from "@/assets/landing/people/p3-desk-certificate.jpg";
import p4 from "@/assets/landing/people/p4-videocall.jpg";
import p7 from "@/assets/landing/people/p7-blazer-laptop.jpg";

/* ---------- 1. Giant word-by-word manifesto ---------- */
const MANIFESTO =
  "Bo ta bon. You have the skills, the story and the drive. Lansa makes sure the right people finally see it.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [18, 0]);
  const accent = /^(bon\.|see|it\.)$/i.test(word);
  return (
    <motion.span style={{ opacity, y }} className={`inline-block mr-[0.22em] ${accent ? "text-primary" : ""}`}>
      {word}
    </motion.span>
  );
}

export function ManifestoScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = MANIFESTO.split(" ");
  const artY = useTransform(scrollYProgress, [0, 1], ["10%", "-25%"]);
  const artRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const art2Y = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);

  if (reduce) {
    return (
      <section className="bg-background px-6 py-28">
        <p className="lx-story-giant mx-auto max-w-6xl text-dashboard-ink">{MANIFESTO}</p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[260vh] bg-background" aria-label="Why Lansa">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-6 md:px-12">
        <motion.img
          src={manifesto}
          alt=""
          aria-hidden
          style={{ y: artY, rotate: artRotate }}
          className="pointer-events-none absolute -right-16 top-[8%] w-[46vw] max-w-[560px] rounded-[3rem] opacity-90 md:right-[2%]"
        />
        <motion.img
          src={feed}
          alt=""
          aria-hidden
          style={{ y: art2Y }}
          className="pointer-events-none absolute -left-10 bottom-[-10%] hidden w-[22vw] max-w-[280px] rounded-[40%] opacity-70 md:block"
        />
        <p className="lx-story-giant relative z-10 mx-auto max-w-6xl text-dashboard-ink">
          {words.map((w, i) => {
            const start = i / words.length;
            return <Word key={i} word={w} progress={scrollYProgress} range={[start * 0.85, start * 0.85 + 0.12]} />;
          })}
        </p>
      </div>
    </section>
  );
}

/* ---------- 2. Sticky chapters with layered parallax art ---------- */
const CHAPTERS = [
  {
    n: "01",
    kicker: "Build",
    title: "Tell your real story.",
    body: "Lansa's guided builder turns your background — even an untraditional one — into a profile that lands.",
    art: buildArt,
    photo: p2,
  },
  {
    n: "02",
    kicker: "Get certified",
    title: "Prove what you know.",
    body: "Take a Lansa Certification in your sector. Pass once and the badge follows your profile everywhere.",
    art: certifyArt,
    photo: p3,
  },
  {
    n: "03",
    kicker: "Get discovered",
    title: "The right employer comes to you.",
    body: "Certified, verified profiles surface to companies on Lansa. They start the conversation — you stay in control.",
    art: discoverArt,
    photo: p4,
  },
] as const;

function Chapter({ c, index }: { c: (typeof CHAPTERS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });
  const numY = useTransform(smooth, [0, 1], ["30%", "-60%"]);
  const artY = useTransform(smooth, [0, 1], ["25%", "-25%"]);
  const artScale = useTransform(smooth, [0, 0.5, 1], [0.85, 1, 0.92]);
  const photoY = useTransform(smooth, [0, 1], ["60%", "-50%"]);
  const photoRotate = useTransform(smooth, [0, 1], [8, -6]);
  const textY = useTransform(smooth, [0, 0.5, 1], [80, 0, -40]);
  const textOpacity = useTransform(smooth, [0.1, 0.35, 0.75, 0.95], [0, 1, 1, 0.2]);
  const flip = index % 2 === 1;

  return (
    <div ref={ref} className="relative grid min-h-[110svh] items-center gap-10 py-20 md:grid-cols-12">
      <motion.span
        aria-hidden
        style={{ y: numY }}
        className={`lx-story-number pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary/10 ${flip ? "right-0" : "left-0"}`}
      >
        {c.n}
      </motion.span>
      <div className={`relative md:col-span-6 ${flip ? "md:order-2" : ""}`}>
        <motion.img src={c.art} alt="" aria-hidden style={{ y: artY, scale: artScale }} className="relative z-0 mx-auto w-[82%] max-w-[520px] rounded-[2.5rem]" />
        <motion.img
          src={c.photo}
          alt=""
          aria-hidden
          loading="lazy"
          style={{ y: photoY, rotate: photoRotate }}
          className={`absolute bottom-[6%] z-10 w-[36%] max-w-[200px] rounded-3xl border-4 border-background object-cover shadow-2xl aspect-[3/4] ${flip ? "left-[4%]" : "right-[4%]"}`}
        />
      </div>
      <motion.div style={{ y: textY, opacity: textOpacity }} className={`relative z-10 md:col-span-6 ${flip ? "md:order-1" : ""}`}>
        <p className="mb-4 font-urbanist text-sm font-bold uppercase tracking-[0.25em] text-secondary">
          {c.n} · {c.kicker}
        </p>
        <h3 className="lx-story-title text-dashboard-ink">{c.title}</h3>
        <p className="mt-6 max-w-lg font-public-sans text-lg leading-relaxed text-muted-foreground md:text-xl">{c.body}</p>
      </motion.div>
    </div>
  );
}

export function ChapterStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <section ref={ref} className="relative overflow-hidden bg-background px-6 md:px-12" aria-labelledby="how-lansa-works">
      <div className="mx-auto max-w-7xl pt-16">
        <h2 id="how-lansa-works" className="lx-story-giant max-w-4xl text-dashboard-ink">
          Three steps. <span className="text-primary">One honest shortcut.</span>
        </h2>
      </div>
      <div className="sticky top-0 z-20 mx-auto mt-10 h-1 max-w-7xl overflow-hidden rounded-full bg-muted">
        <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-primary" />
      </div>
      <div className="mx-auto max-w-7xl">
        {CHAPTERS.map((c, i) => (
          <Chapter key={c.n} c={c} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ---------- 3. Horizontal marquee + capability cards ---------- */
const TILES = [
  { icon: iProfile, title: "AI Profile Builder", body: "Guided prompts turn your story into a complete profile in minutes.", art: welcome },
  { icon: iResume, title: "Resume Studio", body: "Designer-quality resumes, exported as PDF, ready to send.", art: jobs },
  { icon: iCert, title: "Lansa Certification", body: "A sector exam and a verified badge employers trust.", art: learning },
  { icon: iDiscover, title: "Smart Discovery", body: "Companies find certified profiles. Real conversations follow.", art: inbox },
] as const;

export function CapabilitiesStory() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["5%", "-45%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-45%", "5%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-dashboard-ink py-24 text-dashboard-on-ink md:py-36">
      <div aria-hidden className="pointer-events-none select-none space-y-2">
        <motion.p style={{ x: x1 }} className="lx-story-marquee whitespace-nowrap">
          Build · Certify · Get discovered · Build · Certify · Get discovered ·
        </motion.p>
        <motion.p style={{ x: x2 }} className="lx-story-marquee lx-story-marquee--outline whitespace-nowrap">
          People first · Careers that move · People first · Careers that move ·
        </motion.p>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="lx-story-title">
            Everything you need. <span className="text-primary">Nothing you don't.</span>
          </h2>
          <motion.img
            src={p7}
            alt="Young professional in a blazer working on a laptop"
            loading="lazy"
            style={{ y: photoY }}
            className="mt-10 aspect-[4/5] w-full max-w-md rounded-[2.5rem] object-cover shadow-2xl"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {TILES.map((t, i) => (
            <motion.article
              key={t.title}
              initial={{ opacity: 0, y: 60, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-[2rem] bg-background p-7 text-dashboard-ink ${i % 2 ? "sm:mt-12" : ""}`}
            >
              <img src={t.art} alt="" aria-hidden loading="lazy" className="mx-auto -mt-2 mb-4 h-36 w-36 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
              <img src={t.icon} alt="" aria-hidden loading="lazy" className="mb-3 h-14 w-14" />
              <h3 className="font-urbanist text-2xl font-extrabold tracking-tight">{t.title}</h3>
              <p className="mt-2 font-public-sans leading-relaxed text-muted-foreground">{t.body}</p>
            </motion.article>
          ))}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="group flex min-h-[64px] items-center justify-between rounded-full bg-primary px-8 py-5 font-urbanist text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:col-span-2"
          >
            Start free
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
