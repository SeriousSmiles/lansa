import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/certification/PaymentModal";

interface PlanConfig {
  label: string;
  price: number;
  swipes: string;
  certifiedAccess: boolean;
  aiSummaries: boolean;
  priorityListings: boolean;
}

const EMPLOYER_PLANS: Record<string, PlanConfig> = {
  basic: {
    label: "Basic",
    price: 0,
    swipes: "10 / day",
    certifiedAccess: false,
    aiSummaries: false,
    priorityListings: false,
  },
  premium: {
    label: "Premium",
    price: 75,
    swipes: "Unlimited",
    certifiedAccess: true,
    aiSummaries: true,
    priorityListings: true,
  },
};

export function EmployerSubscriptionPanel() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [currentPlan] = useState("basic"); // TODO: fetch from subscriptions table

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
          Unlock premium features to find the best candidates faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {Object.entries(EMPLOYER_PLANS).map(([key, plan]) => {
          const isCurrent = key === currentPlan;
          return (
            <Card
              key={key}
              className={cn(
                "relative transition-all",
                isCurrent && "ring-2 ring-primary shadow-lg"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full font-medium">
                  Current Plan
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.label}</CardTitle>
                <div className="text-3xl font-bold mt-1">
                  {plan.price === 0 ? "Free" : `XCG ${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureRow active={true}>{plan.swipes} candidate swipes</FeatureRow>
                <FeatureRow active={plan.certifiedAccess}>Certified-only candidate pool</FeatureRow>
                <FeatureRow active={plan.aiSummaries}>AI match summaries</FeatureRow>
                <FeatureRow active={plan.priorityListings}>Priority job listings</FeatureRow>

                {!isCurrent && plan.price > 0 && (
                  <Button className="w-full mt-4" onClick={handleUpgrade}>
                    Upgrade to {plan.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        paymentType="employer_subscription"
        amountCents={EMPLOYER_PLANS.premium.price * 100}
        metadata={{
          tierName: 'Premium',
          price: String(EMPLOYER_PLANS.premium.price),
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

function FeatureRow({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {active ? (
        <Check className="h-4 w-4 text-primary flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={cn(!active && "text-muted-foreground")}>{children}</span>
    </div>
  );
}
