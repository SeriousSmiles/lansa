## Apply mobile editor card polish to public profile

Bring the public/shared profile (`/p/:slug`) on mobile in line with the editor card refinements: tighter padding, calmer spacing, no truncated titles, brand-token Featured pill, and visual parity on item rows. View-only — no edit/menu actions are added.

### Files
- `src/components/profile/shared/SharedProfileContent.tsx` (the only renderer for About / Experience / Education / Certifications / Achievements on the public page)

### Changes

1. **Section spacing**  
   `space-y-8` → `space-y-4 md:space-y-8` on the outer column.

2. **Card padding (per Card)**  
   `CardContent pt-6` → `p-4 md:p-6` so mobile cards aren't desktop-padded.

3. **Section headers**  
   - `text-2xl` → `text-xl md:text-2xl`
   - Icon: bump to `h-5 w-5 md:h-6 md:w-6` and keep `mr-2`
   - Color stays driven by `highlightColor` (per-user palette) — unchanged contract

4. **Item rows (Experience / Education / Certifications / Achievements)**  
   - Replace `flex justify-between items-start` (which forces date onto same line as title and causes wrap/truncation on narrow screens) with a stacked block on mobile:  
     - title row: `flex flex-wrap items-baseline gap-x-2 gap-y-1`  
     - date moves under the title on mobile (`text-xs text-muted-foreground`) and inline on `md+`
   - `text-lg font-semibold` → `text-base md:text-lg font-semibold leading-snug` and remove any implicit truncation
   - Item separator padding: `pb-5` → `pb-4 md:pb-5`

5. **Achievement Featured pill**  
   - Render inline next to the title (already inline) but switch the Badge from `variant="secondary"` to brand styling: `className="bg-primary/10 text-primary border-primary/20"` with the `Star` icon — matches the editor's brand token treatment and removes gray.
   - Type badge stays `variant="outline"` but gets `mt-1` so it doesn't crowd the title row on mobile.

6. **Empty states**  
   `"No experience data available"` and `"No education data available"` get `py-2 md:py-0 text-sm md:text-base` so the empty state doesn't visually equal the rest of the card.

### Out of scope
- Sidebar (`SharedProfileSidebar`), portal shell, header, or sharing toolbar.
- Any data-shape, RLS, or hook changes — `useSharedProfileData` contract is untouched.
- Adding edit/kebab actions — public profile is view-only by design.
- Desktop layout — `md+` keeps current look.

### Verification
Open a shared profile (`/p/:slug`) at mobile viewport (375 wide):
- Cards feel app-native, not desktop-shrunk
- Long titles like "Top Ten Outstanding…" wrap to two lines, no truncation
- Date sits under the title on mobile, inline on desktop
- Featured pill uses Lansa orange (primary) tint, not gray
- No horizontal scroll, no double borders