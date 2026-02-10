import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, CreditCard, Shield, Loader2, Sparkles, Building2 } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";

export type PaymentType = 'certification_exam' | 'mentor_subscription' | 'employer_subscription';

interface PaymentConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  priceDisplay: string;
  priceSuffix?: string;
  benefits: string[];
}

const PAYMENT_CONFIGS: Record<PaymentType, (meta?: Record<string, string>) => PaymentConfig> = {
  certification_exam: (meta) => ({
    title: `Unlock ${meta?.sectorName || 'Certification'} Exam`,
    description: 'Complete this certification to stand out to employers and earn your Lansa Certified badge.',
    icon: <Award className="h-5 w-5 text-primary" />,
    priceDisplay: '25',
    benefits: [
      'AI-powered feedback on your performance',
      'Verified certification badge on your profile',
      'Priority visibility to employers',
      'Shareable verification code',
    ],
  }),
  mentor_subscription: (meta) => ({
    title: `Upgrade to ${meta?.tierName || 'Premium'}`,
    description: 'Unlock more video uploads, external links, and promotional appearances.',
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    priceDisplay: meta?.price || '30',
    priceSuffix: '/month',
    benefits: [
      `${meta?.maxVideos || 'More'} video uploads`,
      'External platform link on your content',
      'Promotional appearances in the feed',
      'Priority mentor badge',
    ],
  }),
  employer_subscription: (meta) => ({
    title: `Upgrade to ${meta?.tierName || 'Premium'}`,
    description: 'Get unlimited access to browse, swipe, and connect with top candidates.',
    icon: <Building2 className="h-5 w-5 text-primary" />,
    priceDisplay: meta?.price || '75',
    priceSuffix: '/month',
    benefits: [
      'Unlimited candidate browsing and swipes',
      'Access to Lansa Certified candidates',
      'AI-powered match summaries',
      'Priority job listing visibility',
    ],
  }),
};

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: PaymentType;
  amountCents: number;
  metadata?: Record<string, string>;
  onPaymentComplete: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentType,
  amountCents,
  metadata = {},
  onPaymentComplete,
}: PaymentModalProps) {
  const { isProcessing, createPayment } = usePayment();
  const config = PAYMENT_CONFIGS[paymentType](metadata);

  const handlePayment = async () => {
    const result = await createPayment(paymentType, amountCents, {
      sector: metadata.sector,
      tier: metadata.tier,
    });

    if (result) {
      if (result.already_paid || result.status === 'completed') {
        onPaymentComplete();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {config.priceSuffix ? 'Monthly subscription' : 'One-time fee'}
            </p>
            <p className="text-3xl font-bold text-foreground">
              XCG {config.priceDisplay}
            </p>
            {config.priceSuffix && (
              <p className="text-xs text-muted-foreground mt-1">{config.priceSuffix}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Caribbean Guilder</p>
          </div>

          <div className="space-y-2">
            {config.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Badge variant="outline" className="w-full justify-center py-1 text-xs">
            Powered by Sentoo — Secure bank transfer
          </Badge>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay XCG {config.priceDisplay}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
