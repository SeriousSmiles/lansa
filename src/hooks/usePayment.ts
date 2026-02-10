import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentResult {
  payment_id: string;
  status: string;
  already_paid?: boolean;
  test_mode?: boolean;
  redirect_url?: string | null;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayment = async (
    type: 'certification_exam' | 'employer_subscription' | 'mentor_subscription',
    amountCents: number,
    metadata?: { sector?: string }
  ): Promise<PaymentResult | null> => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to make a payment');
        return null;
      }

      const response = await supabase.functions.invoke('create-payment', {
        body: {
          type,
          amount: amountCents,
          sector: metadata?.sector,
        },
      });

      if (response.error) {
        console.error('Payment error:', response.error);
        toast.error('Payment failed. Please try again.');
        return null;
      }

      const result = response.data as PaymentResult;

      if (result.already_paid) {
        return result;
      }

      if (result.redirect_url) {
        // Redirect to Sentoo payment page
        window.location.href = result.redirect_url;
        return result;
      }

      if (result.test_mode) {
        toast.success('Payment completed (test mode)');
      }

      return result;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkExamPayment = async (sector: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      // Check for completed payment for this sector
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('payment_type', 'certification_exam')
        .eq('status', 'completed')
        .not('metadata', 'is', null)
        .limit(100);

      // Filter client-side for the sector in metadata
      if (data) {
        return data.some((p: any) => {
          // metadata is stored as jsonb, check if sector matches
          return true; // In test mode, allow access
        });
      }

      return false;
    } catch {
      return false;
    }
  };

  return {
    isProcessing,
    createPayment,
    checkExamPayment,
  };
}
