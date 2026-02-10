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
import { Award, CreditCard, Shield, Loader2 } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: string;
  sectorName: string;
  onPaymentComplete: () => void;
}

const EXAM_PRICE_CENTS = 2500; // 25 XCG
const EXAM_PRICE_DISPLAY = "25";

export function PaymentModal({
  open,
  onOpenChange,
  sector,
  sectorName,
  onPaymentComplete,
}: PaymentModalProps) {
  const { isProcessing, createPayment } = usePayment();

  const handlePayment = async () => {
    const result = await createPayment('certification_exam', EXAM_PRICE_CENTS, { sector });
    
    if (result) {
      if (result.already_paid || result.status === 'completed') {
        onPaymentComplete();
        onOpenChange(false);
      }
      // If redirect_url, the hook already redirects
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Unlock {sectorName} Exam
          </DialogTitle>
          <DialogDescription>
            Complete this certification to stand out to employers and earn your Lansa Certified badge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Display */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">One-time exam fee</p>
            <p className="text-3xl font-bold text-foreground">
              XCG {EXAM_PRICE_DISPLAY}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Caribbean Guilder</p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>AI-powered feedback on your performance</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Verified certification badge on your profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Priority visibility to employers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Shareable verification code</span>
            </div>
          </div>

          <Badge variant="outline" className="w-full justify-center py-1 text-xs">
            Powered by Sentoo — Secure bank transfer
          </Badge>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay XCG {EXAM_PRICE_DISPLAY}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
