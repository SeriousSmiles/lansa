import { useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, Clock, Heart, MessageCircle, Search, Sparkles, X, Briefcase, Users, TrendingUp } from "lucide-react";
import iProfile from "@/assets/illustrations/i-profile.webp";
import iResume from "@/assets/illustrations/i-resume.webp";
import iCert from "@/assets/illustrations/i-cert.webp";
import iDiscover from "@/assets/illustrations/i-discover.webp";
import p1 from "@/assets/landing/people/p1-couch-phone.jpg";
import p2 from "@/assets/landing/people/p2-cafe-laptop.jpg";
import p3 from "@/assets/landing/people/p3-desk-certificate.jpg";
import p4 from "@/assets/landing/people/p4-videocall.jpg";
import p5 from "@/assets/landing/people/p5-hands-phone.jpg";
import p6 from "@/assets/landing/people/p6-friends-phone.jpg";
import p7 from "@/assets/landing/people/p7-blazer-laptop.jpg";

/* Illustrative product UI — fictional sample content, for marketing only. */
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-5 text-dashboard-ink shadow-2xl ${className}`}>{children}</div>;
}

/* ---------- 1. Giant word-by-word manifesto over real photos ---------- */
const MANIFESTO = "Bo ta bon. You have the skills, the story and the drive. Lansa makes sure the right people finally see it.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [18, 0]);
  const accent = /^(bon\.|see|it\.)$/i.test(word);
  return <motion.span style={{ opacity, y }} className={`mr-[0.22em] inline-block ${accent ? "text-primary" : ""}`}>{word}</motion.span>;
}

export function ManifestoScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = MANIFESTO.split(" ");
  const aY = useTransform(scrollYProgress, [0, 1], ["15%", "-35%"]);
  const bY = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);
  const aR = useTransform(scrollYProgress, [0, 1], [-5, 4]);
  const notif = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const notifY = useTransform(scrollYProgress, [0.55, 0.75], [30, 0]);

  if (reduce) {
    return <section className="bg-background px-6 py-28"><p className="lx-story-giant mx-auto max-w-6xl text-dashboard-ink">{MANIFESTO}</p></section>;
  }
  return (
    <section ref={ref} className="relative h-[260vh] bg-background" aria-label="Why Lansa">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-6 md:px-12">
        <motion.img src={p6} alt="" aria-hidden style={{ y: aY, rotate: aR }}
          className="pointer-events-none absolute -right-20 top-[10%] aspect-[4/5] w-[44vw] max-w-[440px] rounded-[2.5rem] object-cover opacity-90 shadow-2xl md:right-[3%]" />
        <motion.img src={p1} alt="" aria-hidden style={{ y: bY }}
          className="pointer-events-none absolute -left-8 bottom-[-6%] hidden aspect-square w-[20vw] max-w-[260px] rounded-[2rem] object-cover opacity-80 shadow-xl md:block" />
        <motion.div style={{ opacity: notif, y: notifY }} className="absolute right-[6%] top-[62%] z-20 hidden md:block">
          <Panel className="flex w-72 items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="font-urbanist text-sm font-extrabold">Caribe Logistics is interested</p><p className="text-xs text-muted-foreground">Viewed your profile · just now</p></div>
          </Panel>
        </motion.div>
        <p className="lx-story-giant relative z-10 mx-auto max-w-6xl text-dashboard-ink">
          {words.map((w, i) => { const s = i / words.length; return <Word key={i} word={w} progress={scrollYProgress} range={[s * 0.85, s * 0.85 + 0.12]} />; })}
        </p>
      </div>
    </section>
  );
}

/* ---------- 2. Behind the curtain: photo + live interface per step ---------- */
function BuilderUI({ p }: { p: MotionValue<number> }) {
  const width = useTransform(p, [0.2, 0.6], ["18%", "92%"]);
  const pct = useTransform(p, [0.2, 0.6], [18, 92]);
  const pctText = useTransform(pct, (v) => `${Math.round(v)}%`);
  const rows = ["About you", "Experience · 3 roles", "Skills · Excel, Customer care", "Education"];
  return (
    <Panel className="w-[300px]">
      <div className="flex items-center gap-3">
        <img src={p7} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div><p className="font-urbanist font-extrabold">Shanice Martina</p><p className="text-xs text-muted-foreground">Customer Success · Willemstad</p></div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-bold"><span>Profile strength</span><motion.span className="text-primary">{pctText}</motion.span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><motion.div style={{ width }} className="h-full rounded-full bg-primary" /></div>
      <ul className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <motion.li key={r} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">
            <Check className="h-4 w-4 text-secondary" />{r}
          </motion.li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-2 text-xs text-primary"><Sparkles className="h-4 w-4" />AI suggestion: add your biggest win</div>
    </Panel>
  );
}

function ExamUI({ p }: { p: MotionValue<number> }) {
  const sec = useTransform(p, [0.2, 0.7], [40, 6]);
  const secText = useTransform(sec, (v) => `0:${String(Math.round(v)).padStart(2, "0")}`);
  const badge = useTransform(p, [0.55, 0.7], [0, 1]);
  const opts = ["Escalate immediately", "Acknowledge and clarify the need", "Offer a discount", "Transfer the call"];
  return (
    <Panel className="relative w-[300px]">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground"><span>Hospitality · Q 9 of 15</span><span className="flex items-center gap-1 text-primary"><Clock className="h-3.5 w-3.5" /><motion.span>{secText}</motion.span></span></div>
      <p className="mt-3 font-urbanist font-extrabold leading-snug">A guest is upset about a late booking. What's your first step?</p>
      <div className="mt-3 space-y-2">
        {opts.map((o, i) => (
          <div key={o} className={`rounded-xl border px-3 py-2 text-sm ${i === 1 ? "border-secondary bg-secondary/10 font-semibold text-secondary" : "border-border"}`}>{o}</div>
        ))}
      </div>
      <motion.div style={{ opacity: badge, scale: badge }} className="absolute -right-6 -top-6 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-urbanist text-sm font-extrabold text-primary-foreground shadow-xl">
        <BadgeCheck className="h-4 w-4" />Lansa Certified
      </motion.div>
    </Panel>
  );
}

function DiscoverUI({ p }: { p: MotionValue<number> }) {
  const match = useTransform(p, [0.5, 0.65], [0, 1]);
  const cardX = useTransform(p, [0.35, 0.55], [0, 40]);
  const cardR = useTransform(p, [0.35, 0.55], [0, 8]);
  return (
    <div className="relative w-[280px]">
      <motion.div style={{ x: cardX, rotate: cardR }} className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="relative aspect-[4/5]">
          <img src={p4} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dashboard-ink/90 to-transparent p-4 text-dashboard-on-ink">
            <p className="flex items-center gap-1 font-urbanist text-xl font-extrabold">Jurgen R. <BadgeCheck className="h-5 w-5 text-primary" /></p>
            <p className="text-xs opacity-90">Junior Accountant · Punda</p>
            <div className="mt-2 flex gap-1.5">{["Excel", "Payroll", "Papiamentu"].map((s) => <span key={s} className="rounded-full bg-background/20 px-2 py-0.5 text-[11px]">{s}</span>)}</div>
          </div>
        </div>
        <div className="flex justify-center gap-4 p-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border"><X className="h-5 w-5" /></span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="h-5 w-5" /></span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: match, y: useTransform(match, [0, 1], [20, 0]) }} className="absolute -bottom-8 -left-10">
        <Panel className="flex w-64 items-center gap-3 p-3">
          <MessageCircle className="h-5 w-5 text-secondary" />
          <p className="text-sm"><b className="font-urbanist">It's a match.</b> Say bon dia to Jurgen →</p>
        </Panel>
      </motion.div>
    </div>
  );
}

const CHAPTERS = [
  { n: "01", kicker: "Build", title: "Tell your real story.", body: "Guided prompts and gentle AI turn your background — even an untraditional one — into a profile that lands.", photo: p2, UI: BuilderUI },
  { n: "02", kicker: "Get certified", title: "Prove what you know.", body: "A timed sector exam. Pass once and the verified badge follows your profile everywhere employers look.", photo: p3, UI: ExamUI },
  { n: "03", kicker: "Get discovered", title: "The right employer comes to you.", body: "Certified, verified profiles surface to companies. They show interest — you decide when to talk.", photo: p5, UI: DiscoverUI },
] as const;

function Chapter({ c, index }: { c: (typeof CHAPTERS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const s = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });
  const numY = useTransform(s, [0, 1], ["30%", "-60%"]);
  const photoY = useTransform(s, [0, 1], ["12%", "-12%"]);
  const photoScale = useTransform(s, [0, 0.5, 1], [1.15, 1, 1.05]);
  const uiY = useTransform(s, [0, 1], ["40%", "-30%"]);
  const textY = useTransform(s, [0, 0.5, 1], [80, 0, -40]);
  const textOpacity = useTransform(s, [0.1, 0.35, 0.75, 0.95], [0, 1, 1, 0.2]);
  const flip = index % 2 === 1;
  const UI = c.UI;
  return (
    <div ref={ref} className="relative grid min-h-[120svh] items-center gap-10 py-20 md:grid-cols-12">
      <motion.span aria-hidden style={{ y: numY }} className={`lx-story-number pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary/10 ${flip ? "right-0" : "left-0"}`}>{c.n}</motion.span>
      <div className={`relative md:col-span-7 ${flip ? "md:order-2" : ""}`}>
        <motion.div style={{ y: photoY }} className="relative mx-auto aspect-[4/5] w-[78%] max-w-[460px] overflow-hidden rounded-[2.5rem] shadow-2xl">
          <motion.img src={c.photo} alt="" aria-hidden loading="lazy" style={{ scale: photoScale }} className="h-full w-full object-cover" />
        </motion.div>
        <motion.div style={{ y: uiY }} className={`absolute bottom-[4%] z-10 ${flip ? "left-0" : "right-0"} origin-bottom scale-[0.82] sm:scale-100`}>
          <UI p={scrollYProgress} />
        </motion.div>
      </div>
      <motion.div style={{ y: textY, opacity: textOpacity }} className={`relative z-10 md:col-span-5 ${flip ? "md:order-1" : ""}`}>
        <p className="mb-4 font-urbanist text-sm font-bold uppercase tracking-[0.25em] text-secondary">{c.n} · {c.kicker}</p>
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
        <p className="mb-4 font-urbanist text-sm font-bold uppercase tracking-[0.25em] text-primary">Behind the curtain</p>
        <h2 id="how-lansa-works" className="lx-story-giant max-w-4xl text-dashboard-ink">Three steps. <span className="text-primary">One honest shortcut.</span></h2>
      </div>
      <div className="sticky top-0 z-20 mx-auto mt-10 h-1 max-w-7xl overflow-hidden rounded-full bg-muted"><motion.div style={{ scaleX: bar }} className="h-full origin-left bg-primary" /></div>
      <div className="mx-auto max-w-7xl">{CHAPTERS.map((c, i) => <Chapter key={c.n} c={c} index={i} />)}</div>
    </section>
  );
}

/* ---------- 3. The employer console: a SaaS dashboard assembling on scroll ---------- */
const TILES = [
  { icon: iProfile, title: "AI Profile Builder", body: "Guided prompts turn a story into a complete profile in minutes." },
  { icon: iResume, title: "Resume Studio", body: "Designer-quality resumes, exported as print-ready PDF." },
  { icon: iCert, title: "Lansa Certification", body: "Sector exams and a verified badge employers trust." },
  { icon: iDiscover, title: "Smart Discovery", body: "Companies browse certified talent. Real conversations follow." },
] as const;

const PIPE = [
  { name: "Shanice M.", role: "Customer Success", stage: "Interview", img: p7 },
  { name: "Jurgen R.", role: "Junior Accountant", stage: "Matched", img: p4 },
  { name: "Gabriela S.", role: "Front Desk", stage: "New", img: p2 },
];

function Metric({ icon: Icon, label, to, p }: { icon: typeof Users; label: string; to: number; p: MotionValue<number> }) {
  const v = useTransform(p, [0.15, 0.45], [0, to]);
  const t = useTransform(v, (x) => String(Math.round(x)));
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <Icon className="h-4 w-4 text-secondary" />
      <motion.p className="mt-2 font-urbanist text-3xl font-black">{t}</motion.p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function CapabilitiesStory() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["5%", "-45%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-45%", "5%"]);
  const tilt = useTransform(scrollYProgress, [0.05, 0.35], [18, 0]);
  const dashScale = useTransform(scrollYProgress, [0.05, 0.35], [0.88, 1]);
  const chipY = useTransform(scrollYProgress, [0, 1], ["60%", "-80%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["30%", "-40%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-dashboard-ink py-24 text-dashboard-on-ink md:py-36">
      <div aria-hidden className="pointer-events-none select-none space-y-2">
        <motion.p style={{ x: x1 }} className="lx-story-marquee whitespace-nowrap">Build · Certify · Get discovered · Build · Certify · Get discovered ·</motion.p>
        <motion.p style={{ x: x2 }} className="lx-story-marquee lx-story-marquee--outline whitespace-nowrap">People first · Careers that move · People first · Careers that move ·</motion.p>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6 md:px-12">
        <p className="font-urbanist text-sm font-bold uppercase tracking-[0.25em] text-primary">For employers</p>
        <h2 className="lx-story-title mt-3 max-w-3xl">One workspace to find, certify-check and hire. <span className="text-primary">No CV pile.</span></h2>

        <div className="relative mt-14" style={{ perspective: 1400 }}>
          <motion.img src={p1} alt="" aria-hidden style={{ y: photoY }} className="absolute -left-16 -top-10 hidden aspect-square w-44 rounded-3xl object-cover shadow-2xl lg:block" />
          <motion.div style={{ rotateX: tilt, scale: dashScale }} className="relative overflow-hidden rounded-[2rem] border border-border bg-background text-dashboard-ink shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-primary/70" /><span className="h-3 w-3 rounded-full bg-secondary/50" /><span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <div className="ml-4 flex flex-1 items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground"><Search className="h-3.5 w-3.5" />Search certified talent…</div>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-12">
              <div className="grid grid-cols-3 gap-3 md:col-span-12">
                <Metric icon={Briefcase} label="Open vacancies" to={4} p={scrollYProgress} />
                <Metric icon={Users} label="New applicants" to={27} p={scrollYProgress} />
                <Metric icon={TrendingUp} label="Matches this week" to={9} p={scrollYProgress} />
              </div>
              <div className="md:col-span-7">
                <p className="mb-2 font-urbanist font-extrabold">Pipeline · Customer Success Lead</p>
                <ul className="space-y-2">
                  {PIPE.map((r, i) => (
                    <motion.li key={r.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: 0.15 * i, type: "spring", stiffness: 120, damping: 16 }}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3">
                      <img src={r.img} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0 flex-1"><p className="flex items-center gap-1 text-sm font-bold">{r.name}<BadgeCheck className="h-4 w-4 text-primary" /></p><p className="truncate text-xs text-muted-foreground">{r.role}</p></div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.stage === "Matched" ? "bg-primary text-primary-foreground" : "bg-secondary/10 text-secondary"}`}>{r.stage}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-5">
                <p className="mb-2 font-urbanist font-extrabold">Inbox</p>
                <div className="space-y-2 rounded-2xl bg-muted/60 p-4 text-sm">
                  <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-background px-3 py-2">Bon dia Jurgen! Free for a call Thursday?</motion.p>
                  <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-3 py-2 text-secondary-foreground">Yes! 10am works great 🙌</motion.p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div style={{ y: chipY }} className="absolute -right-4 top-1/3 hidden md:block">
            <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-urbanist text-sm font-extrabold text-primary-foreground shadow-2xl"><BadgeCheck className="h-4 w-4" />Only certified & verified</div>
          </motion.div>
        </div>
        <p className="mt-4 text-center text-xs text-dashboard-on-ink/60">Illustrative preview with sample names.</p>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((t, i) => (
            <motion.article key={t.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.08 }} whileHover={{ y: -6 }}
              className="rounded-[1.75rem] bg-background p-6 text-dashboard-ink">
              <img src={t.icon} alt="" aria-hidden loading="lazy" className="mb-4 h-14 w-14" />
              <h3 className="font-urbanist text-xl font-extrabold tracking-tight">{t.title}</h3>
              <p className="mt-2 font-public-sans text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </motion.article>
          ))}
        </div>
        <button type="button" onClick={() => navigate("/signup")}
          className="group mt-8 flex min-h-[64px] w-full items-center justify-between rounded-full bg-primary px-8 py-5 font-urbanist text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
          Start free<ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
