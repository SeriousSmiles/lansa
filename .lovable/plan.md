

# Constrain Landing Sections to 1440px Max Width

## What Changes

All sections below the hero currently use `max-w-7xl` (1280px) for their inner content containers. This will be updated to `max-w-[1440px]` across all landing components. The hero section (`Header83`) remains untouched.

## Files & Changes

| File | Change |
|---|---|
| `src/components/landing/LandingNavbar.tsx` | `max-w-7xl` → `max-w-[1440px]` |
| `src/components/landing/CaribbeanSection.tsx` | `max-w-7xl` → `max-w-[1440px]` |
| `src/components/landing/HowItWorksSection.tsx` | `max-w-7xl` → `max-w-[1440px]` |
| `src/components/landing/TestimonialsSection.tsx` | `max-w-7xl` → `max-w-[1440px]` |
| `src/components/landing/CTASection.tsx` | `max-w-7xl` → `max-w-[1440px]` |
| `src/components/landing/LandingFooter.tsx` | `max-w-7xl` → `max-w-[1440px]` |

Each file has a single inner `div` with `mx-auto max-w-7xl px-[5%]` — the only change is swapping the max-width class. No structural or content changes.

