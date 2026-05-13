import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ShieldCheck,
  Sparkles,
  CircleCheck,
  ChevronDown,
  Zap,
  Crown,
  Building2,
  Rocket,
  Lock,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SEOHead } from "@/components/SEOHead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ───── Professional tiers ───── */

interface Tier {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  icon: React.ElementType;
  features: string[];
  cta: string;
  highlighted?: boolean;
  comingSoon?: boolean;
  note?: string;
}

const professionalTiers: Tier[] = [
  {
    name: "Free",
    price: "XCG 0",
    icon: Zap,
    features: [
      "AI-powered professional profile",
      "Free CV generation & PDF download",
      "Job discovery feed",
      "In-app messaging with employers",
      "Mentor educational content",
    ],
    note: "Certification exams: XCG 25 per exam (2 attempts included)",
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "Coming Soon",
    badge: "Coming Soon",
    icon: Crown,
    features: [
      "Everything in Free",
      "Priority visibility to employers",
      "Advanced profile analytics",
      "Premium badge on profile",
      "Early access to new features",
    ],
    cta: "Join Waitlist",
    highlighted: true,
    comingSoon: true,
  },
];

/* ───── Business commitment pricing ───── */

interface CommitmentPlan {
  key: string;
  label: string;
  months: number;
  monthly: number;
  total: number;
  savings: number;
  badge?: string;
}

const commitmentPlans: CommitmentPlan[] = [
  { key: "3mo", label: "3 Months", months: 3, monthly: 150, total: 450, savings: 0 },
  { key: "6mo", label: "6 Months", months: 6, monthly: 125, total: 750, savings: 17, badge: "Save 17%" },
  { key: "12mo", label: "12 Months", months: 12, monthly: 100, total: 1200, savings: 33, badge: "Best Value" },
];

const businessFeatures = [
  "Unlimited candidate swipes",
  "Job posting wizard",
  "In-app messaging",
  "Browse Lansa Certified candidates",
  "AI candidate summaries",
  "Priority job listings",
  "Hiring analytics dashboard",
  "Dedicated onboarding support",
];

/* ───── comparison tables ───── */

interface CompRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
}

const professionalComparison: CompRow[] = [
  { feature: "AI Profile Generation", free: true, pro: true },
  { feature: "CV Download (PDF)", free: true, pro: true },
  { feature: "Certification Exams", free: "XCG 25 / exam", pro: "XCG 25 / exam" },
  { feature: "Job Discovery Feed", free: true, pro: true },
  { feature: "In-app Messaging", free: true, pro: true },
  { feature: "Mentor Content", free: true, pro: true },
  { feature: "Priority Employer Visibility", free: false, pro: true },
  { feature: "Profile Analytics", free: false, pro: true },
  { feature: "Premium Badge", free: false, pro: true },
];

interface BizCompRow {
  feature: string;
  included: boolean | string;
}

const businessComparison: BizCompRow[] = [
  { feature: "Candidate Swipes", included: "Unlimited" },
  { feature: "Job Posting Wizard", included: true },
  { feature: "In-app Messaging", included: true },
  { feature: "Browse Certified Candidates", included: true },
  { feature: "AI Candidate Summaries", included: true },
  { feature: "Priority Listings", included: true },
  { feature: "Hiring Analytics", included: true },
  { feature: "Dedicated Support", included: true },
];

/* ───── FAQ ───── */

const faqs = [
  {
    q: "Is Lansa really free for professionals?",
    a: "Yes! Creating your profile, generating your CV, discovering jobs, and messaging are all completely free. The only cost is XCG 25 per certification exam, which includes 2 attempts. Certification is what gets you in front of employers — it's the gateway to opportunity.",
  },
  {
    q: "What is XCG?",
    a: "XCG stands for Caribbean Guilder (also known as ANG — Antilliaanse Gulden), the official currency of Curaçao and Sint Maarten. All Lansa pricing is displayed in XCG.",
  },
  {
    q: "How does the business commitment model work?",
    a: "Employers choose a commitment period: 3, 6, or 12 months. The longer the commitment, the lower the monthly rate. All plans include the full feature set — unlimited swipes, AI summaries, analytics, and more.",
  },
  {
    q: "Is there a free plan for employers?",
    a: "There is no free tier for employers. However, we're currently in open beta and offering select pilot companies free access for a limited time. Contact us to learn if you qualify.",
  },
  {
    q: "What does 'Lansa Certified' mean?",
    a: "Lansa Certified means a candidate has passed one or more industry-specific exams on our platform. It gives employers confidence that the person has verified, practical skills.",
  },
  {
    q: "Can I cancel my business subscription?",
    a: "Your subscription runs for the duration of your chosen commitment period (3, 6, or 12 months). You can choose not to renew at the end of your term. No auto-renewal surprises.",
  },
];

/* ───── helpers ───── */

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string")
    return <span className="text-foreground font-public-sans text-sm font-medium">{value}</span>;
  return value ? (
    <CircleCheck className="h-5 w-5 text-primary mx-auto" />
  ) : (
    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
  );
};

/* ───── TierCard (professionals) ───── */

const TierCard = ({ tier, onAction, delay = 0 }: { tier: Tier; onAction: () => void; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, delay }}
    className={`relative flex flex-col rounded-3xl border-2 p-8 md:p-10 transition-shadow duration-300 ${
      tier.comingSoon
        ? "border-border/40 bg-muted/30 shadow-sm"
        : tier.highlighted
        ? "border-primary bg-background shadow-xl hover:shadow-2xl"
        : "border-border/60 bg-background shadow-sm hover:shadow-lg"
    }`}
  >
    {tier.badge && (
      <span className={`absolute -top-3.5 right-6 rounded-full px-4 py-1 text-xs font-bold font-urbanist shadow-lg ${
        tier.comingSoon
          ? "bg-muted-foreground/60 text-white"
          : "lansa-gradient-primary text-white"
      }`}>
        {tier.badge}
      </span>
    )}

    <div className="flex items-center gap-3 mb-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        tier.comingSoon ? "bg-muted-foreground/10" : tier.highlighted ? "lansa-gradient-primary" : "bg-primary/10"
      }`}>
        <tier.icon className={`h-5 w-5 ${tier.comingSoon ? "text-muted-foreground" : tier.highlighted ? "text-white" : "text-primary"}`} />
      </div>
      <h3 className={`text-xl font-bold font-urbanist ${tier.comingSoon ? "text-muted-foreground" : "text-foreground"}`}>{tier.name}</h3>
    </div>

    <div className="flex items-baseline gap-1 mb-4">
      <span className={`text-4xl md:text-5xl font-bold font-urbanist ${tier.comingSoon ? "text-muted-foreground/50" : "lansa-gradient-text"}`}>{tier.price}</span>
      {tier.period && (
        <span className="text-muted-foreground font-public-sans text-sm">{tier.period}</span>
      )}
    </div>

    {tier.note && (
      <div className="flex items-center gap-2 mb-6 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
        <Award className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-public-sans text-foreground/70">{tier.note}</span>
      </div>
    )}

    <ul className={`flex flex-col gap-3.5 flex-1 ${tier.comingSoon ? "opacity-50" : ""}`}>
      {tier.features.map((f) => (
        <li key={f} className="flex items-start gap-3 text-sm font-public-sans text-foreground/80">
          <CircleCheck className="h-4.5 w-4.5 mt-0.5 text-primary shrink-0" />
          {f}
        </li>
      ))}
    </ul>

    <Button
      variant={tier.comingSoon ? "outline" : tier.highlighted ? "primary" : "outline"}
      size="lg"
      className={`mt-8 w-full font-urbanist font-semibold text-base ${tier.comingSoon ? "opacity-70" : ""}`}
      onClick={onAction}
    >
      {tier.cta}
    </Button>
  </motion.div>
);

/* ───── Business Pricing Card ───── */

const BusinessPricingCard = ({ onAction }: { onAction: () => void }) => {
  const [selected, setSelected] = useState("3mo");
  const plan = commitmentPlans.find((p) => p.key === selected)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Open Beta Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-2xl border-2 border-secondary/20 bg-secondary/5 px-6 py-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="text-sm font-bold font-urbanist text-secondary">Open Beta</span>
        </div>
        <p className="text-xs font-public-sans text-muted-foreground">
          Selected companies are piloting Lansa for free for a limited time.{" "}
          <button onClick={onAction} className="text-secondary underline underline-offset-2 hover:text-secondary/80 transition-colors">
            Contact us to apply
          </button>
        </p>
      </motion.div>

      <div className="relative rounded-3xl border-2 border-primary bg-background shadow-xl p-8 md:p-10">
        <span className="absolute -top-3.5 right-6 rounded-full lansa-gradient-primary px-4 py-1 text-xs font-bold text-white font-urbanist shadow-lg">
          Full Platform Access
        </span>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl lansa-gradient-primary">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold font-urbanist text-foreground">Lansa for Business</h3>
        </div>

        {/* Commitment selector */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {commitmentPlans.map((cp) => (
            <button
              key={cp.key}
              onClick={() => setSelected(cp.key)}
              className={`relative rounded-xl border-2 px-3 py-3 text-center transition-all duration-200 ${
                selected === cp.key
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/60 bg-background hover:border-border"
              }`}
            >
              {cp.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 font-urbanist whitespace-nowrap">
                  {cp.badge}
                </span>
              )}
              <span className={`block text-xs font-urbanist font-semibold mb-1 ${
                selected === cp.key ? "text-primary" : "text-muted-foreground"
              }`}>
                {cp.label}
              </span>
              <span className={`block text-lg font-bold font-urbanist ${
                selected === cp.key ? "text-foreground" : "text-foreground/70"
              }`}>
                XCG {cp.monthly}
              </span>
              <span className="block text-[10px] text-muted-foreground font-public-sans">/month</span>
            </button>
          ))}
        </div>

        {/* Price display */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl md:text-6xl font-bold font-urbanist lansa-gradient-text">
              XCG {plan.monthly}
            </span>
            <span className="text-muted-foreground font-public-sans text-sm">/month</span>
          </div>
          <p className="text-xs text-muted-foreground font-public-sans mt-2">
            XCG {plan.total.toLocaleString()} total for {plan.months} months
            {plan.savings > 0 && (
              <span className="ml-2 text-secondary font-semibold">· Save {plan.savings}%</span>
            )}
          </p>
        </div>

        {/* Features */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {businessFeatures.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm font-public-sans text-foreground/80">
              <CircleCheck className="h-4.5 w-4.5 mt-0.5 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <Button
          variant="primary"
          size="lg"
          className="w-full font-urbanist font-semibold text-base"
          onClick={onAction}
        >
          Get Started — {plan.label}
        </Button>
      </div>
    </motion.div>
  );
};

/* ───── Page ───── */

const Pricing = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"pro" | "biz">("pro");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Lansa Pricing — Plans for Professionals & Employers"
        description="Compare Lansa pricing for job seekers, mentors, and Caribbean employers. Transparent XCG plans built for Curaçao."
        canonical="https://www.lansa.online/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,85%,15%)] via-[hsl(215,60%,10%)] to-[hsl(0,0%,4%)]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-[20%] h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-10 left-[15%] h-48 w-48 rounded-full bg-secondary/20 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary font-urbanist"
          >
            Simple Pricing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold font-urbanist text-white md:text-6xl leading-tight max-w-3xl mx-auto"
          >
            Free for Talent. Built for Business.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-white/60 font-public-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Professionals use Lansa free. Employers invest in access to certified, verified talent.
          </motion.p>

          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm"
          >
            <button
              onClick={() => setView("pro")}
              className={`rounded-full px-6 py-2.5 text-sm font-urbanist font-semibold transition-all duration-300 ${
                view === "pro"
                  ? "bg-primary text-white shadow-lg"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              For Professionals
            </button>
            <button
              onClick={() => setView("biz")}
              className={`rounded-full px-6 py-2.5 text-sm font-urbanist font-semibold transition-all duration-300 ${
                view === "biz"
                  ? "bg-secondary text-white shadow-lg"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              For Businesses
            </button>
          </motion.div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-16 md:py-20 -mt-10 relative z-10">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <AnimatePresence mode="wait">
            {view === "pro" ? (
              <motion.div
                key="pro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
              >
                {professionalTiers.map((t, i) => (
                  <TierCard key={t.name} tier={t} onAction={() => navigate("/signup")} delay={i * 0.1} />
                ))}
              </motion.div>
            ) : (
              <BusinessPricingCard key="biz" onAction={() => navigate("/signup")} />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold font-urbanist text-foreground">
                Feature Comparison
              </h2>
            </div>

            <div className="rounded-2xl border-2 border-border/60 overflow-hidden max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {view === "pro" ? (
                  <motion.div key="pro-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-border/60">
                          <TableHead className="font-urbanist font-semibold text-foreground">Feature</TableHead>
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-32">Free</TableHead>
                          <TableHead className="text-center font-urbanist font-semibold text-muted-foreground w-32">Pro (Soon)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professionalComparison.map((row, i) => (
                          <TableRow key={row.feature} className={i % 2 === 0 ? "bg-background" : "bg-accent/40"}>
                            <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                            <TableCell className="text-center"><CellValue value={row.free} /></TableCell>
                            <TableCell className="text-center opacity-50"><CellValue value={row.pro} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                ) : (
                  <motion.div key="biz-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-border/60">
                          <TableHead className="font-urbanist font-semibold text-foreground">Feature</TableHead>
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-32">Included</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {businessComparison.map((row, i) => (
                          <TableRow key={row.feature} className={i % 2 === 0 ? "bg-background" : "bg-accent/40"}>
                            <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                            <TableCell className="text-center"><CellValue value={row.included} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center gap-5 rounded-3xl py-14 px-6 text-center overflow-hidden"
          >
            <div className="absolute inset-0 lansa-gradient-primary opacity-[0.08] rounded-3xl" />
            <div className="absolute inset-0 border-2 border-primary/15 rounded-3xl" />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <ShieldCheck className="h-12 w-12 text-primary" />
            </motion.div>
            <h3 className="relative text-xl font-bold font-urbanist text-foreground md:text-2xl">
              Every candidate is Lansa Certified
            </h3>
            <p className="relative text-muted-foreground font-public-sans text-sm max-w-md">
              Our certification system ensures employers only connect with verified, qualified talent — giving both sides confidence.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/signup")}
              className="relative font-urbanist font-semibold"
            >
              Create Your Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold font-urbanist text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-2xl border-2 border-border/60 px-6 overflow-hidden"
                >
                  <AccordionTrigger className="font-urbanist font-semibold text-foreground text-left py-5 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-public-sans text-muted-foreground text-sm leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
