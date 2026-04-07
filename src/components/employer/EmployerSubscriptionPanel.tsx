import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/certification/PaymentModal";

interface CommitmentPlan {
  key: string;
  label: string;
  months: number;
  monthly: number;
  total: number;
  savings: number;
  badge?: string;
}

const COMMITMENT_PLANS: CommitmentPlan[] = [
  { key: "3mo", label: "3 Months", months: 3, monthly: 150, total: 450, savings: 0 },
  { key: "6mo", label: "6 Months", months: 6, monthly: 125, total: 750, savings: 17, badge: "Save 17%" },
  { key: "12mo", label: "12 Months", months: 12, monthly: 100, total: 1200, savings: 33, badge: "Best Value" },
];

const FEATURES = [
  "Unlimited candidate swipes",
  "Job posting wizard",
  "In-app messaging",
  "Browse Lansa Certified candidates",
  "AI candidate summaries",
  "Priority job listings",
  "Hiring analytics dashboard",
  "Dedicated support",
];

export function EmployerSubscriptionPanel() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState("3mo");
  const plan = COMMITMENT_PLANS.find((p) => p.key === selected)!;

  const handleUpgrade = () => {
    setPaymentOpen(true);
  };

  const handlePaymentComplete = () => {
    // TODO: refetch subscription status
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Subscription Plan</h2>
        <p className="text-sm text-muted-foreground">
          Choose your commitment — the longer the term, the more you save.
        </p>
      </div>

      {/* Commitment selector */}
      <div className="grid grid-cols-3 gap-3 max-w-xl">
        {COMMITMENT_PLANS.map((cp) => (
          <button
            key={cp.key}
            onClick={() => setSelected(cp.key)}
            className={cn(
              "relative rounded-xl border-2 px-3 py-4 text-center transition-all",
              selected === cp.key
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-border/80"
            )}
          >
            {cp.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 whitespace-nowrap">
                {cp.badge}
              </span>
            )}
            <span className={cn(
              "block text-xs font-semibold mb-1",
              selected === cp.key ? "text-primary" : "text-muted-foreground"
            )}>
              {cp.label}
            </span>
            <span className="block text-xl font-bold">XCG {cp.monthly}</span>
            <span className="block text-[10px] text-muted-foreground">/month</span>
            <span className="block text-[10px] text-muted-foreground mt-1">
              XCG {cp.total.toLocaleString()} total
            </span>
          </button>
        ))}
      </div>

      {/* Plan card */}
      <Card className="max-w-xl relative ring-2 ring-primary shadow-lg">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full font-medium">
          Full Access
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Lansa for Business</CardTitle>
          <div className="text-3xl font-bold mt-1">
            XCG {plan.monthly}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            XCG {plan.total.toLocaleString()} for {plan.months} months
            {plan.savings > 0 && (
              <span className="ml-1 text-secondary font-semibold">· Save {plan.savings}%</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}

          <Button className="w-full mt-4" onClick={handleUpgrade}>
            Subscribe — {plan.label}
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        paymentType="employer_subscription"
        amountCents={plan.monthly * 100}
        metadata={{
          tierName: plan.label,
          price: String(plan.monthly),
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
