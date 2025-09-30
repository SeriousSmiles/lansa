// Demo configuration flags for stabilizing the app during demo
// Set these to false after the demo to restore full functionality

export const DEMO_CONFIG = {
  // Quiet console logs and hide sensitive data - ENABLED for production security
  DEMO_QUIET: !import.meta.env.DEV,
  
  // Make risky menu actions safe no-ops
  DEMO_MODE: true,
  
  // API endpoints configuration
  GEOLOCATION_API: 'https://ipapi.co/json', // HTTPS alternative to ip-api.com
  
  // Legacy script safety
  SAFE_LEGACY_SCRIPTS: true,
  
  // Analytics configuration
  ANALYTICS: {
    // Hotjar configuration
    HOTJAR: {
      SITE_ID: '6512560',
      ENABLED: !import.meta.env.DEV && import.meta.env.PROD, // Only in production
      RESPECT_DNT: true, // Respect Do Not Track headers
    }
  }
} as const;

// Token scrubbing utility with delay for OAuth processing
export const scrubTokensFromUrl = (immediate = false) => {
  const performScrubbing = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hasSecrets = /(access_token|refresh_token|provider_token)/.test(window.location.hash);
      if (hasSecrets) {
        // Remove tokens from URL without reload
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  };

  if (immediate) {
    performScrubbing();
  } else {
    // Delay scrubbing to allow OAuth processing
    setTimeout(performScrubbing, 1000);
  }
};

// Browser environment detection
export const detectBrowserEnvironment = () => {
  if (typeof window === 'undefined') return { isPrivate: false, isIncognito: false };
  
  try {
    // Test for private browsing mode
    const testStorage = () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return false;
      } catch (e) {
        return true;
      }
    };

    return {
      isPrivate: testStorage(),
      isIncognito: 'webkitRequestFileSystem' in window && !window.webkitRequestFileSystem
    };
  } catch (e) {
    return { isPrivate: false, isIncognito: false };
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
          // Fallback if toast fails to load - use secure logging
          import('../utils/logger').then(({ log }) => {
            log(`${actionName} temporarily disabled for demo`);
          });
        });
      }
      return;
    }
    realAction?.();
  };
};