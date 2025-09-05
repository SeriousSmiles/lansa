export { HotjarScript } from './HotjarScript';
export { CookieConsent, hasAnalyticsConsent } from './CookieConsent';

// Analytics event tracking helpers
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (window.hj && typeof window.hj === 'function') {
    window.hj('event', eventName);
  }
};

export const trackPageView = (pageName: string) => {
  if (window.hj && typeof window.hj === 'function') {
    window.hj('vpv', pageName);
  }
};