// Demo configuration flags for stabilizing the app during demo
// Set these to false after the demo to restore full functionality

export const DEMO_CONFIG = {
  // Quiet console logs and hide sensitive data
  DEMO_QUIET: true,
  
  // Make risky menu actions safe no-ops
  DEMO_MODE: true,
  
  // API endpoints configuration
  GEOLOCATION_API: 'https://ipapi.co/json', // HTTPS alternative to ip-api.com
  
  // Legacy script safety
  SAFE_LEGACY_SCRIPTS: true
} as const;

// Token scrubbing utility
export const scrubTokensFromUrl = () => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hasSecrets = /(access_token|refresh_token|provider_token)/.test(window.location.hash);
    if (hasSecrets) {
      // Remove tokens from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }
};

// Safe handler wrapper for risky actions
export const safeHandler = (realAction?: () => void, actionName?: string) => {
  return (e?: any) => {
    if (DEMO_CONFIG.DEMO_MODE) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      
      // Optional: Show user feedback
      if (actionName && typeof window !== 'undefined') {
        import('sonner').then(({ toast }) => {
          toast.info(`${actionName} - Coming soon after demo`);
        }).catch(() => {
          // Fallback if toast fails to load
          console.log(`${actionName} temporarily disabled for demo`);
        });
      }
      return;
    }
    realAction?.();
  };
};