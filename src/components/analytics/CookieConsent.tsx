import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

const CONSENT_KEY = 'lansa-analytics-consent';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent && !import.meta.env.DEV) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowBanner(false);
    // Trigger analytics initialization if needed
    window.dispatchEvent(new CustomEvent('analytics-consent-given'));
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShowBanner(false);
    // Disable analytics
    window.dispatchEvent(new CustomEvent('analytics-consent-declined'));
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <Card className="bg-background border border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-sm">Analytics & Cookies</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            We use analytics tools to improve your experience. This includes tracking how you interact with our platform to help us make it better.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 text-xs"
            >
              Accept
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Decline
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <a href="/privacy" className="underline hover:no-underline">
              Learn more in our Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to check consent status
export const hasAnalyticsConsent = (): boolean => {
  if (import.meta.env.DEV) return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
};