import { DEMO_CONFIG } from '@/config/demo';

// Type definitions for legacy scripts
declare global {
  interface Window {
    jQuery?: any;
    $?: any;
    chrome?: {
      alarms?: {
        onAlarm: {
          addListener: (callback: any) => void;
          removeListener: (callback: any) => void;
          hasListener: (callback: any) => boolean;
        };
        create: (name: string, info?: any) => void;
        clear: (name?: string) => void;
        get: (name?: string) => any;
        getAll: () => any[];
      };
    };
  }
}

// Guard legacy script errors without removing the scripts
export const guardLegacyScripts = () => {
  if (!DEMO_CONFIG.SAFE_LEGACY_SCRIPTS || typeof window === 'undefined') return;

  // Guard jQuery datepicker calls
  const originalReady = window.jQuery?.fn?.ready;
  if (window.jQuery && originalReady) {
    window.jQuery.fn.ready = function(callback: any) {
      const safeCallback = (...args: any[]) => {
        try {
          callback.apply(this, args);
        } catch (error) {
          // Silently catch datepicker and other jQuery errors
          if (error instanceof Error && 
              (error.message.includes('datepicker') || 
               error.message.includes('onAlarm'))) {
            // Swallow for demo stability
            return;
          }
          throw error;
        }
      };
      return originalReady.call(this, safeCallback);
    };
  }

  // Guard against missing alarm APIs
  if (!window.chrome?.alarms) {
    const mockAlarms = {
      onAlarm: {
        addListener: () => {},
        removeListener: () => {},
        hasListener: () => false,
      },
      create: () => {},
      clear: () => {},
      get: () => {},
      getAll: () => []
    };
    
    if (window.chrome) {
      window.chrome.alarms = mockAlarms;
    } else {
      (window as any).chrome = { alarms: mockAlarms };
    }
  }

  // Guard against missing datepicker
  if (window.jQuery && !window.jQuery.fn.datepicker) {
    window.jQuery.fn.datepicker = function() {
      // No-op for demo stability
      return this;
    };
  }
};

// Run guards on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', guardLegacyScripts);
  } else {
    guardLegacyScripts();
  }
}