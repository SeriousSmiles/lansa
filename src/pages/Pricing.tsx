import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
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

/* ───── tier data ───── */

interface Tier {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const professionalTiers: Tier[] = [
  {
    name: "Free",
    price: "XCG 0",
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

/* ───── helpers ───── */

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string")
    return <span className="text-foreground font-public-sans text-sm">{value}</span>;
  return value ? (
    <Check className="h-5 w-5 text-primary mx-auto" />
  ) : (
    <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
  );
};

/* ───── TierCard ───── */

const TierCard = ({ tier, onAction }: { tier: Tier; onAction: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45 }}
    className={`relative flex flex-col rounded-2xl border p-8 ${
      tier.highlighted
        ? "border-primary bg-primary/[0.03] shadow-lg"
        : "border-border bg-card shadow-sm"
    }`}
  >
    {tier.badge && (
      <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground font-urbanist">
        {tier.badge}
      </span>
    )}
    <h3 className="text-xl font-bold font-urbanist text-foreground">{tier.name}</h3>
    <div className="mt-3 flex items-baseline gap-1">
      <span className="text-3xl font-bold font-urbanist text-foreground">{tier.price}</span>
      {tier.period && (
        <span className="text-muted-foreground font-public-sans text-sm">{tier.period}</span>
      )}
    </div>
    <ul className="mt-6 flex flex-col gap-3 flex-1">
      {tier.features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm font-public-sans text-foreground/80">
          <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    <Button
      variant={tier.highlighted ? "primary" : "outline"}
      size="lg"
      className="mt-8 w-full font-urbanist font-semibold"
      onClick={onAction}
    >
      {tier.cta}
    </Button>
  </motion.div>
);

/* ───── Page ───── */

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%] text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary font-urbanist">
            Simple Pricing
          </p>
          <h1 className="text-4xl font-bold font-urbanist text-foreground md:text-6xl leading-tight max-w-3xl mx-auto">
            Start Free. Scale When Ready.
          </h1>
          <p className="mt-5 text-muted-foreground font-public-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            No contracts, no hidden fees. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* For Professionals */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-urbanist text-foreground">For Professionals</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
            {professionalTiers.map((t) => (
              <TierCard key={t.name} tier={t} onAction={() => navigate("/signup")} />
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-14 max-w-3xl">
            <h3 className="text-lg font-bold font-urbanist text-foreground mb-4">Feature Comparison</h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-urbanist font-semibold">Feature</TableHead>
                    <TableHead className="text-center font-urbanist font-semibold w-28">Free</TableHead>
                    <TableHead className="text-center font-urbanist font-semibold w-28">Pro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionalComparison.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                      <TableCell className="text-center"><CellValue value={row.free} /></TableCell>
                      <TableCell className="text-center"><CellValue value={row.pro} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-urbanist text-foreground">For Businesses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
            {businessTiers.map((t) => (
              <TierCard key={t.name} tier={t} onAction={() => navigate("/signup")} />
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-14 max-w-3xl">
            <h3 className="text-lg font-bold font-urbanist text-foreground mb-4">Feature Comparison</h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-urbanist font-semibold">Feature</TableHead>
                    <TableHead className="text-center font-urbanist font-semibold w-28">Basic</TableHead>
                    <TableHead className="text-center font-urbanist font-semibold w-28">Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessComparison.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-public-sans text-sm">{row.feature}</TableCell>
                      <TableCell className="text-center"><CellValue value={row.basic} /></TableCell>
                      <TableCell className="text-center"><CellValue value={row.premium} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-[5%]">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-muted/20 border border-border py-12 px-6 text-center">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h3 className="text-xl font-bold font-urbanist text-foreground md:text-2xl">
              Every candidate is Lansa Certified
            </h3>
            <p className="text-muted-foreground font-public-sans text-sm max-w-md">
              Our certification system ensures employers only connect with verified, qualified talent — giving both sides confidence.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/signup")}
              className="font-urbanist font-semibold"
            >
              Create Your Free Account
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
