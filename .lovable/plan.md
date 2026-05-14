I found the issue: the shared `Display` component does include `leading-[0.85]`, but `tailwind-merge` removes it because later size classes (`text-[44px] sm:text-[56px] md:text-[80px]`) are being treated as conflicting text utilities. The rendered DOM confirms the large `Display` headings have no `leading-*` class and compute to `line-height: 120px`, while the final CTA still has `leading-[0.92]` and computes correctly.

Plan:
1. Update `src/components/landing/_shared.tsx` so the `Display` line-height utility is applied after the responsive text-size utilities, preventing `tailwind-merge` from stripping it.
2. Match the final CTA’s compact look by using the same effective large-heading line-height across `Display` headings, or a slightly tighter shared value if desired.
3. Update `src/components/landing/FinalCTABand.tsx` only if needed so it uses the same shared heading treatment instead of drifting separately.
4. Verify in the browser by checking computed styles: the affected headings should retain a `leading-*` class and no longer compute to the default `120px` line-height.