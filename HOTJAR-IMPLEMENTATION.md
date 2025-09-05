# Hotjar Implementation Guide

## Overview
Hotjar has been successfully integrated into the Lansa platform to track user behavior and improve the user experience.

## Configuration
- **Site ID**: 6512560
- **Environment**: Production only (disabled in development)
- **Privacy Compliance**: GDPR compliant with cookie consent banner

## Files Added/Modified

### New Components
- `src/components/analytics/HotjarScript.tsx` - Main Hotjar integration component
- `src/components/analytics/CookieConsent.tsx` - Cookie consent banner
- `src/components/analytics/index.ts` - Export helper functions

### Modified Files
- `src/pages/Privacy.tsx` - Updated privacy policy to include Hotjar disclosure
- `src/config/demo.ts` - Added analytics configuration
- `index.html` - Added DNS prefetch for Hotjar domains
- `src/App.tsx` - Added Hotjar components to app structure
- `.env` - Added Hotjar environment variables

## Environment Variables
```env
VITE_HOTJAR_SITE_ID="6512560"
VITE_ANALYTICS_ENABLED="true"
```

## Privacy & Compliance
✅ Cookie consent banner implemented
✅ Privacy policy updated with Hotjar disclosure
✅ Do Not Track header respected
✅ User opt-out functionality available
✅ Development environment disabled

## Testing Checklist
- [ ] Hotjar loads only in production
- [ ] Cookie consent banner appears for new users
- [ ] Accept/Decline consent works properly
- [ ] Analytics disabled in development
- [ ] Privacy policy includes Hotjar information
- [ ] Do Not Track preference respected

## Usage
The Hotjar script will automatically load in production environments when:
1. User has given consent (or hasn't been prompted yet)
2. Do Not Track is not enabled
3. Not in development mode

## Post-Demo Configuration
After the demo, you can adjust settings in `src/config/demo.ts`:
- Set `ANALYTICS.HOTJAR.ENABLED` to `true` for all environments
- Modify consent requirements as needed
- Update privacy policy with specific data usage details

## Data Points Being Tracked
- Page views and user flows
- Click patterns and interactions
- Form interactions (no sensitive data)
- Device and browser information
- Session recordings (anonymized)

## Support
For Hotjar-specific questions, refer to:
- [Hotjar Documentation](https://help.hotjar.com/)
- [Privacy Compliance Guide](https://help.hotjar.com/hc/en-us/articles/115011789248)