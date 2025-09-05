import { useEffect } from 'react';
import { DEMO_CONFIG } from '@/config/demo';

interface HotjarScriptProps {
  siteId?: string;
  enabled?: boolean;
}

export const HotjarScript = ({ 
  siteId = DEMO_CONFIG.ANALYTICS.HOTJAR.SITE_ID, 
  enabled = DEMO_CONFIG.ANALYTICS.HOTJAR.ENABLED 
}: HotjarScriptProps) => {
  useEffect(() => {
    // Don't load in development or if disabled
    if (!enabled || import.meta.env.DEV) {
      console.log('Hotjar: Disabled in development or by configuration');
      return;
    }

    // Check for Do Not Track
    if (DEMO_CONFIG.ANALYTICS.HOTJAR.RESPECT_DNT && navigator.doNotTrack === '1') {
      console.log('Hotjar: Respecting Do Not Track preference');
      return;
    }

    // Check if already loaded
    if (window.hj) {
      console.log('Hotjar: Already initialized');
      return;
    }

    try {
      // Hotjar Tracking Code
      (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
        h.hj = h.hj || function(...args: any[]) { 
          (h.hj.q = h.hj.q || []).push(args); 
        };
        h._hjSettings = { hjid: parseInt(siteId), hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script'); 
        r.async = true;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      console.log('Hotjar: Initialized successfully');
    } catch (error) {
      console.warn('Hotjar: Failed to initialize:', error);
    }
  }, [siteId, enabled]);

  return null;
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    hj: any;
    _hjSettings: any;
  }
}