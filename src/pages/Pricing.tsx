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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
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

/* ───── tier data ───── */

interface Tier {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  icon: React.ElementType;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const professionalTiers: Tier[] = [
  {
    name: "Free",
    price: "XCG 0",
    icon: Zap,
    features: [
      "AI-powered professional profile",
      "Free CV generation & download",
      "Certification exams (all sectors)",
      "Job discovery feed",
      "In-app messaging",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "Coming Soon",
    badge: "Soon",
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
  },
];

const businessTiers: Tier[] = [
  {
    name: "Basic",
    price: "XCG 0",
    icon: Building2,
    features: [
      "10 candidate swipes / month",
      "Job posting wizard",
      "In-app messaging",
      "Browse Lansa Certified candidates",
    ],
    cta: "Start Hiring Free",
  },
  {
    name: "Premium",
    price: "XCG 75",
    period: "/mo",
    badge: "Most Popular",
    icon: Rocket,
    features: [
      "Unlimited candidate swipes",
      "AI candidate summaries",
      "Priority job listings",
      "Hiring analytics dashboard",
      "Dedicated support",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
  },
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
  { feature: "Certification Exams", free: true, pro: true },
  { feature: "Job Discovery Feed", free: true, pro: true },
  { feature: "In-app Messaging", free: true, pro: true },
  { feature: "Priority Employer Visibility", free: false, pro: true },
  { feature: "Profile Analytics", free: false, pro: true },
  { feature: "Premium Badge", free: false, pro: true },
  { feature: "Early Feature Access", free: false, pro: true },
];

interface BizCompRow {
  feature: string;
  basic: boolean | string;
  premium: boolean | string;
}

const businessComparison: BizCompRow[] = [
  { feature: "Candidate Swipes", basic: "10 / month", premium: "Unlimited" },
  { feature: "Job Posting Wizard", basic: true, premium: true },
  { feature: "In-app Messaging", basic: true, premium: true },
  { feature: "Browse Certified Candidates", basic: true, premium: true },
  { feature: "AI Candidate Summaries", basic: false, premium: true },
  { feature: "Priority Listings", basic: false, premium: true },
  { feature: "Hiring Analytics", basic: false, premium: true },
  { feature: "Dedicated Support", basic: false, premium: true },
];

/* ───── FAQ ───── */

const faqs = [
  {
    q: "Is Lansa really free for professionals?",
    a: "Yes! Creating your profile, generating your CV, taking certification exams, and discovering jobs are all completely free. The upcoming Pro tier will add premium features, but the core experience stays free forever.",
  },
  {
    q: "What is XCG?",
    a: "XCG is the Eastern Caribbean Dollar, the official currency across several Caribbean nations. All Lansa pricing is displayed in XCG for transparency.",
  },
  {
    q: "Can I cancel my Premium business plan anytime?",
    a: "Absolutely. There are no contracts or commitments. You can downgrade or cancel at any time from your account settings.",
  },
  {
    q: "What does 'Lansa Certified' mean?",
    a: "Lansa Certified means a candidate has passed one or more industry-specific exams on our platform. It gives employers confidence that the person has verified, practical skills.",
  },
  {
    q: "How do candidate swipes work for businesses?",
    a: "Swipes let you browse candidate profiles. Each swipe (like or pass) counts toward your monthly limit on the Basic plan. Premium gives you unlimited swipes.",
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

/* ───── TierCard ───── */

const TierCard = ({ tier, onAction, delay = 0 }: { tier: Tier; onAction: () => void; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, delay }}
    className={`relative flex flex-col rounded-3xl border-2 p-8 md:p-10 transition-shadow duration-300 ${
      tier.highlighted
        ? "border-primary bg-background shadow-xl hover:shadow-2xl"
        : "border-border/60 bg-background shadow-sm hover:shadow-lg"
    }`}
  >
    {tier.badge && (
      <span className="absolute -top-3.5 right-6 rounded-full lansa-gradient-primary px-4 py-1 text-xs font-bold text-white font-urbanist shadow-lg">
        {tier.badge}
      </span>
    )}

    <div className="flex items-center gap-3 mb-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tier.highlighted ? "lansa-gradient-primary" : "bg-primary/10"}`}>
        <tier.icon className={`h-5 w-5 ${tier.highlighted ? "text-white" : "text-primary"}`} />
      </div>
      <h3 className="text-xl font-bold font-urbanist text-foreground">{tier.name}</h3>
    </div>

    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-4xl md:text-5xl font-bold font-urbanist lansa-gradient-text">{tier.price}</span>
      {tier.period && (
        <span className="text-muted-foreground font-public-sans text-sm">{tier.period}</span>
      )}
    </div>

    <ul className="flex flex-col gap-3.5 flex-1">
      {tier.features.map((f) => (
        <li key={f} className="flex items-start gap-3 text-sm font-public-sans text-foreground/80">
          <CircleCheck className="h-4.5 w-4.5 mt-0.5 text-primary shrink-0" />
          {f}
        </li>
      ))}
    </ul>

    <Button
      variant={tier.highlighted ? "primary" : "outline"}
      size="lg"
      className="mt-8 w-full font-urbanist font-semibold text-base"
      onClick={onAction}
    >
      {tier.cta}
    </Button>
  </motion.div>
);

/* ───── Page ───── */

const Pricing = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"pro" | "biz">("pro");

  const tiers = view === "pro" ? professionalTiers : businessTiers;

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero — dark gradient */}
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
            Start Free. Scale When Ready.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-white/60 font-public-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            No contracts, no hidden fees. Upgrade or cancel anytime.
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
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
            >
              {tiers.map((t, i) => (
                <TierCard key={t.name} tier={t} onAction={() => navigate("/signup")} delay={i * 0.1} />
              ))}
            </motion.div>
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
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-28">Free</TableHead>
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-28">Pro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professionalComparison.map((row, i) => (
                          <TableRow key={row.feature} className={i % 2 === 0 ? "bg-background" : "bg-accent/40"}>
                            <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                            <TableCell className="text-center"><CellValue value={row.free} /></TableCell>
                            <TableCell className="text-center"><CellValue value={row.pro} /></TableCell>
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
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-28">Basic</TableHead>
                          <TableHead className="text-center font-urbanist font-semibold text-foreground w-28">Premium</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {businessComparison.map((row, i) => (
                          <TableRow key={row.feature} className={i % 2 === 0 ? "bg-background" : "bg-accent/40"}>
                            <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                            <TableCell className="text-center"><CellValue value={row.basic} /></TableCell>
                            <TableCell className="text-center"><CellValue value={row.premium} /></TableCell>
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

      {/* Trust bar — gradient banner */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center gap-5 rounded-3xl py-14 px-6 text-center overflow-hidden"
          >
            {/* Gradient bg */}
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
