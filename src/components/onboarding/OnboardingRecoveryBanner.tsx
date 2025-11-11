import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { markOnboardingComplete } from '@/services/onboarding/unifiedOnboardingService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingRecoveryBannerProps {
  userType: 'job_seeker' | 'employer';
  hasUserType: boolean;
  hasOnboardingFlag: boolean;
}

/**
 * Recovery banner for users stuck in onboarding limbo
 * Shows when user has selected type but onboarding was never marked complete
 */
export function OnboardingRecoveryBanner({
  userType,
  hasUserType,
  hasOnboardingFlag
}: OnboardingRecoveryBannerProps) {
  const { user } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isRecovered, setIsRecovered] = useState(false);

  // Only show if user is in limbo state
  if (!hasUserType || hasOnboardingFlag || !user?.id) {
    return null;
  }

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      await markOnboardingComplete(user.id, userType);
      setIsRecovered(true);
      toast.success('Your account has been recovered! Redirecting...');
      
      // Refresh page to update user state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('[OnboardingRecovery] Failed to recover:', error);
      toast.error('Recovery failed. Please contact support.');
    } finally {
      setIsRecovering(false);
    }
  };

  if (isRecovered) {
    return (
      <Alert className="mb-4 border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Account Recovered!</AlertTitle>
        <AlertDescription className="text-green-800">
          Your account setup is complete. Redirecting you now...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-orange-500 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">Account Setup Incomplete</AlertTitle>
      <AlertDescription className="text-orange-800 space-y-3">
        <p>
          We noticed your account setup wasn't fully completed. This might prevent you from
          accessing certain features.
        </p>
        <Button
          onClick={handleRecover}
          disabled={isRecovering}
          variant="outline"
          className="bg-white hover:bg-orange-100"
        >
          {isRecovering ? 'Completing Setup...' : 'Complete My Setup'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
