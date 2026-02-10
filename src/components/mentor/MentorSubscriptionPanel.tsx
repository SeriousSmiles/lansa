import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorSubscription, TIER_CONFIG, type SubscriptionTier } from "@/hooks/useMentorSubscription";
import { TierBadge } from "./TierBadge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/certification/PaymentModal";

export function MentorSubscriptionPanel() {
  const { data: subscription, isLoading, refetch } = useMentorSubscription();
  const currentTier = subscription?.tier || "free";
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const tiers: { key: SubscriptionTier; config: (typeof TIER_CONFIG)[SubscriptionTier] }[] = [
    { key: "free", config: TIER_CONFIG.free },
    { key: "starter", config: TIER_CONFIG.starter },
    { key: "pro", config: TIER_CONFIG.pro },
  ];

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setPaymentOpen(true);
  };

  const handlePaymentComplete = () => {
    refetch();
    setSelectedTier(null);
  };

  const selectedConfig = selectedTier ? TIER_CONFIG[selectedTier] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Subscription</h2>
        <p className="text-sm text-muted-foreground">
          Your current plan: <TierBadge tier={currentTier} className="ml-1" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map(({ key, config }) => {
          const isCurrent = key === currentTier;
          const isUpgrade = config.price > (TIER_CONFIG[currentTier]?.price || 0);
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
                <CardTitle className="text-lg">{config.label}</CardTitle>
                <div className="text-3xl font-bold mt-1">
                  {config.price === 0 ? "Free" : `XCG ${config.price}`}
                  {config.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureRow active={true}>
                  {config.maxVideos === Infinity ? "Unlimited" : config.maxVideos} video{config.maxVideos !== 1 ? "s" : ""}
                </FeatureRow>
                <FeatureRow active={config.externalLink}>
                  External platform link
                </FeatureRow>
                <FeatureRow active={config.promoted}>
                  Promotional appearances
                </FeatureRow>

                {!isCurrent && isUpgrade && (
                  <Button
                    className="w-full mt-4"
                    variant={key === "pro" ? "primary" : "outline"}
                    onClick={() => handleUpgrade(key)}
                  >
                    Upgrade to {config.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTier && selectedConfig && (
        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          paymentType="mentor_subscription"
          amountCents={selectedConfig.price * 100}
          metadata={{
            tierName: selectedConfig.label,
            price: String(selectedConfig.price),
            tier: selectedTier,
            maxVideos: String(selectedConfig.maxVideos === Infinity ? 'Unlimited' : selectedConfig.maxVideos),
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
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
