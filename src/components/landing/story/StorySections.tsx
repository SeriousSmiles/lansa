import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, Clock, Heart, MessageCircle, Search, Sparkles, X, Briefcase, Users, TrendingUp } from "lucide-react";
import p1 from "@/assets/landing/people/p1-couch-phone.jpg";
import p2 from "@/assets/landing/people/p2-cafe-laptop.jpg";
import p4 from "@/assets/landing/people/p4-videocall.jpg";
import p7 from "@/assets/landing/people/p7-blazer-laptop.jpg";
import handPhone from "@/assets/landing/action/hand-phone-discover.webp";
import workPhoto from "@/assets/landing/action/work.webp";
import examPhoto from "@/assets/landing/action/exam.webp";
import hirePhoto from "@/assets/landing/action/hire.webp";

/* Illustrative product UI — fictional sample content, for marketing only. */
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-5 text-dashboard-ink shadow-2xl ${className}`}>{children}</div>;
}

/* ---------- 1. Giant word-by-word manifesto over real photos ---------- */
const MANIFESTO = "Bo ta bon. You have the skills, the story and the drive. Lansa makes sure the right people finally see it.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.28, 1]);
  const y = useTransform(progress, range, [18, 0]);
  const accent = /^(bon\.|see|it\.)$/i.test(word);
  return <motion.span style={{ opacity, y }} className={`mr-[0.22em] inline-block ${accent ? "text-primary" : ""}`}>{word}</motion.span>;
}

export function ManifestoScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = MANIFESTO.split(" ");
  const phoneY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const phoneR = useTransform(scrollYProgress, [0, 1], [-4, 3]);
  const notif = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const notifY = useTransform(scrollYProgress, [0.55, 0.75], [30, 0]);
  const Phone = (
    <div className="relative mx-auto w-full max-w-[380px]">
      <motion.img src={handPhone} alt="A hand holding a phone showing the Lansa Discover screen" style={reduce ? undefined : { y: phoneY, rotate: phoneR }}
        className="aspect-[2/3] w-full rounded-[2.5rem] object-cover shadow-2xl ring-1 ring-dashboard-on-ink/10" />
      <motion.div style={reduce ? undefined : { opacity: notif, y: notifY }} className="absolute -left-6 bottom-10 sm:-left-16">
        <Panel className="flex w-64 items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="font-urbanist text-sm font-extrabold">Caribe Logistics is interested</p><p className="text-xs text-muted-foreground">Viewed your profile · just now</p></div>
        </Panel>
      </motion.div>
    </div>
  );
  if (reduce) {
    return (
      <section className="bg-dashboard-ink px-6 py-24 text-dashboard-on-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12"><p className="lx-story-title lg:col-span-7">{MANIFESTO}</p><div className="lg:col-span-5">{Phone}</div></div>
      </section>
    );
  }
  return (
    <section ref={ref} className="relative h-[220vh] bg-dashboard-ink text-dashboard-on-ink" aria-label="Why Lansa">
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden px-6 py-16 md:px-12">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12">
          <p className="lx-story-title lg:col-span-7">
            {words.map((w, i) => { const s = i / words.length; return <Word key={i} word={w} progress={scrollYProgress} range={[s * 0.8, s * 0.8 + 0.12]} />; })}
          </p>
          <div className="hidden lg:col-span-5 lg:block">{Phone}</div>
        </div>
      </div>
      <div className="px-6 pb-20 lg:hidden">{Phone}</div>
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
  { n: "01", kicker: "Build", title: "Tell your real story.", body: "Guided prompts and gentle AI turn your background — even an untraditional one — into a profile that lands.", photo: workPhoto, UI: BuilderUI },
  { n: "02", kicker: "Get certified", title: "Prove what you know.", body: "A timed sector exam. Pass once and the verified badge follows your profile everywhere employers look.", photo: examPhoto, UI: ExamUI },
  { n: "03", kicker: "Get discovered", title: "The right employer comes to you.", body: "Certified, verified profiles surface to companies. They show interest — you decide when to talk.", photo: hirePhoto, UI: DiscoverUI },
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
      <motion.span aria-hidden style={{ y: numY }} className={`lx-story-number pointer-events-none absolute top-1/2 -translate-y-1/2 text-dashboard-ink/[0.06] ${flip ? "right-0" : "left-0"}`}>{c.n}</motion.span>
      <div className={`relative md:col-span-7 ${flip ? "md:order-2" : ""}`}>
        <motion.div style={{ y: photoY }} className="relative mx-auto aspect-[4/5] w-[86%] max-w-[500px] overflow-hidden rounded-[2.5rem] shadow-2xl">
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

/* ---------- 3. Employer workspace: one clear story, three steps, one product view ---------- */
const STEPS = [
  { icon: Search, title: "Search certified talent", body: "Every profile you see has passed a Lansa sector exam and been verified." },
  { icon: Users, title: "Shortlist in one pipeline", body: "Move people from New to Interview to Matched — no spreadsheets, no CV pile." },
  { icon: MessageCircle, title: "Talk when it's mutual", body: "Chat opens once both sides say yes, so every conversation is wanted." },
] as const;

const TILES = [
  { icon: Sparkles, title: "AI Profile Builder", body: "Guided prompts turn a story into a complete profile in minutes." },
  { icon: Briefcase, title: "Resume Studio", body: "Designer-quality resumes, exported as print-ready PDF." },
  { icon: BadgeCheck, title: "Lansa Certification", body: "Sector exams and a verified badge employers trust." },
  { icon: TrendingUp, title: "Smart Discovery", body: "Companies browse certified talent. Real conversations follow." },
] as const;

const PIPE = [
  { name: "Shanice M.", role: "Customer Success", stage: "Interview", img: p7 },
  { name: "Jurgen R.", role: "Junior Accountant", stage: "Matched", img: p4 },
  { name: "Gabriela S.", role: "Front Desk", stage: "New", img: p2 },
];

function StepView({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground"><Search className="h-4 w-4" />Hospitality · Willemstad</div>
        {PIPE.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
            <img src={r.img} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1"><p className="text-sm font-bold">{r.name}</p><p className="text-xs text-muted-foreground">{r.role}</p></div>
            <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary"><BadgeCheck className="h-3.5 w-3.5" />Certified</span>
          </div>
        ))}
      </div>
    );
  if (step === 1)
    return (
      <div className="grid grid-cols-3 gap-3">
        {(["New", "Interview", "Matched"] as const).map((col) => (
          <div key={col} className="rounded-2xl bg-background p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{col}</p>
            {PIPE.filter((r) => r.stage === col).map((r) => (
              <div key={r.name} className="rounded-xl border border-border p-2 text-center">
                <img src={r.img} alt="" className="mx-auto h-10 w-10 rounded-full object-cover" />
                <p className="mt-1 text-xs font-bold">{r.name}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
        <img src={p4} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div><p className="text-sm font-bold">Jurgen R.</p><p className="text-xs text-secondary">Matched · both interested</p></div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">Bon dia Jurgen! Free for a call Thursday?</p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-dashboard-ink px-3 py-2 text-dashboard-on-ink">Yes! 10am works great.</p>
      </div>
    </div>
  );
}

export function CapabilitiesStory() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(v < 0.34 ? 0 : v < 0.67 ? 1 : 2));

  return (
    <section className="bg-muted/50 text-dashboard-ink" aria-labelledby="for-employers">
      <div ref={ref} className={reduce ? "" : "relative lg:h-[240vh]"}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:px-12 lg:sticky lg:top-0 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="font-urbanist text-sm font-bold uppercase tracking-[0.25em] text-secondary">For employers</p>
            <h2 id="for-employers" className="lx-story-title mt-3">Hire certified people in three steps.</h2>
            <ol className="mt-10 space-y-3">
              {STEPS.map((st, i) => {
                const on = i === step;
                return (
                  <li key={st.title}>
                    <button type="button" onClick={() => setStep(i)} aria-current={on}
                      className={`flex w-full gap-4 rounded-2xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${on ? "bg-background shadow-sm" : "hover:bg-background/60"}`}>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? "bg-dashboard-ink text-dashboard-on-ink" : "bg-background text-dashboard-ink"}`}><st.icon className="h-5 w-5" /></span>
                      <span>
                        <span className="block font-urbanist text-lg font-extrabold">{i + 1}. {st.title}</span>
                        <span className={`block text-sm leading-relaxed text-muted-foreground ${on ? "" : "hidden md:block"}`}>{st.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-urbanist font-extrabold">Customer Success Lead</p>
                <span className="text-xs font-semibold text-muted-foreground">Step {step + 1} of 3</span>
              </div>
              <motion.div key={step} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-h-[300px] rounded-2xl bg-muted/60 p-4">
                <StepView step={step} />
              </motion.div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Illustrative preview with sample names.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((t) => (
            <article key={t.title} className="rounded-[1.75rem] border border-border bg-background p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-dashboard-ink"><t.icon className="h-6 w-6" /></span>
              <h3 className="font-urbanist text-xl font-extrabold tracking-tight">{t.title}</h3>
              <p className="mt-2 font-public-sans text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </article>
          ))}
        </div>
        <button type="button" onClick={() => navigate("/signup")}
          className="group mx-auto mt-10 flex min-h-[56px] items-center gap-3 rounded-full bg-primary px-8 font-urbanist text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
          Start free<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
