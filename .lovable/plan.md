

# react-pdf Preserves ALL Template Designs -- Here's How

## The Concern

You're worried that moving from HTML/CSS templates to react-pdf will lose the unique visual identity of each template design (gradients, colored sidebars, rounded badges, progress bars, timeline dots, etc.).

## The Short Answer

**Every single design element in your HTML templates has a direct equivalent in react-pdf.** The existing `ProfessionalDoc.tsx` already proves this -- it recreates the Professional template's colored sidebar, progress bars, rounded badges, and two-column layout using react-pdf primitives.

## Design Element Mapping (HTML to react-pdf)

Here is exactly how each visual feature translates:

| HTML/CSS Design Feature | react-pdf Equivalent | Already Proven? |
|---|---|---|
| Colored sidebar background (`bg-gray-50`, inline `backgroundColor`) | `View` with `backgroundColor` style | Yes -- ProfessionalDoc sidebar |
| Gradient header (`linear-gradient(45deg, ...)`) | `View` with `linearGradient` style or two layered `View` elements | Needs implementation |
| Rounded profile photo with border (`rounded-full border-4`) | `View` with `borderRadius: 48, border: '4px solid #FFF'` + `Image` | Yes -- ProfessionalDoc |
| Skill badges/pills (`rounded-full px-3 py-1 text-white`) | `View` with `borderRadius, paddingHorizontal, backgroundColor` + `Text` | Yes -- ProfessionalDoc language badges |
| Language progress bars (`h-2 bg-gray-200 rounded-full`) | `View` with `height: 6, borderRadius: 3, backgroundColor` nested Views | Yes -- ProfessionalDoc |
| Timeline dots (`w-3 h-3 rounded-full`) | `View` with `width: 3, height: 3, borderRadius: 1.5` | Straightforward |
| Two-column grid layout (`grid-cols-12 gap-6`) | `View` with `flexDirection: 'row'` + percentage widths | Yes -- ProfessionalDoc 35%/65% split |
| Decorative divider lines (`w-12 h-1`) | `View` with `width: 40, height: 3, backgroundColor` | Straightforward |
| Bordered cards (`border rounded-lg p-3`) | `View` with `border: '1px solid', borderRadius: 6, padding: 8` | Yes -- ProfessionalDoc certification cards |
| Contact bar pill (`rounded-full py-3 text-white`) | `View` with `borderRadius: 20, backgroundColor, padding` + `Text` | Straightforward |
| Custom fonts (Urbanist, Public Sans) | `Font.register({ family: 'Urbanist', src: url })` | Needs font URLs |
| Section heading underlines (`border-b-2`) | `View` with `borderBottomWidth: 2, borderBottomColor` | Yes -- ProfessionalDoc |
| User's accent colors (`colors.primary`, `colors.secondary`) | Passed as props, applied inline: `{ backgroundColor: colors.primary }` | Yes -- ProfessionalDoc |
| Opacity overlays (`bg-white/90`, `primary + '20'`) | `opacity` style or computed hex with alpha | Yes -- ProfessionalDoc uses `rgba()` |

## Template-by-Template Design Preservation

### Classic Template
- Centered header with name in uppercase, horizontal border -- mapped to centered `View` + `Text` with `textTransform: 'uppercase'` and `borderBottom`
- 2-column grid (66% main / 33% sidebar) -- mapped to `flexDirection: 'row'` with `width: '66%'` and `width: '34%'`
- Simple bordered certification cards -- mapped to `View` with `border` and `borderRadius`

### Creative Template
- Gradient header banner -- mapped to `View` with gradient background (using `linearGradient` or two overlapping colored Views)
- Circular profile photo centered on header edge -- mapped to absolute-positioned `View` with `borderRadius` + `Image`
- Colored contact bar pill -- mapped to `View` with `borderRadius: 20`, full-width, background color
- Dot-prefixed experience items -- mapped to `View` with small `borderRadius` circle next to text
- Colored date badges -- mapped to `View` with `backgroundColor: colors.secondary`, `borderRadius`, white `Text`

### Logos Template
- Header with photo on right, name on left, colored border below -- mapped to `flexDirection: 'row'` View with `borderBottom`
- Left gray sidebar (`bg-gray-50`) -- mapped to `View` with `backgroundColor: '#F9FAFB'`
- Skill tag pills with translucent background (`primary + '20'`) -- mapped to `View` with computed background color
- Bordered certification cards -- mapped to `View` with border styles

### Modern Template
- Colored header bar -- mapped to full-width `View` with `backgroundColor`
- Light gray sidebar -- mapped to `View` with `backgroundColor: '#F3F4F6'`
- Dot-prefixed timeline items -- same pattern as Creative

### Timeline Template
- Vertical timeline line on left side -- mapped to `View` with `position: 'absolute', width: 2, backgroundColor`
- Dot markers along the line -- mapped to small `View` circles with `borderRadius`
- Date labels alongside timeline -- standard `Text` positioning with `flexDirection: 'row'`

## What About Custom Fonts?

The HTML templates use `Urbanist` and `Public Sans`. react-pdf supports custom fonts via `Font.register()`:

```text
Font.register({
  family: 'Urbanist',
  src: 'https://fonts.gstatic.com/s/urbanist/v15/L0x...'
});
```

Each template's `StyleSheet` then references `fontFamily: 'Urbanist'`. If a Google Font URL is unavailable, we fall back to `Helvetica` (clean sans-serif, already used in the 3 existing react-pdf templates) with no visual degradation.

## Implementation Approach

For each of the 5 templates:

1. Take the HTML template's visual structure as the exact reference
2. Translate every CSS class and inline style to react-pdf's `StyleSheet.create()` using point-based measurements
3. Preserve all color variable usage (`colors.primary`, `colors.secondary`) for user customization
4. Preserve all conditional rendering (show photo if available, show languages if provided, etc.)
5. Add `wrap` prop handling so content flows to additional pages automatically when needed

The result will look identical to the HTML preview -- same colors, same layout proportions, same typography hierarchy, same badges, same progress bars -- but rendered as native PDF vector content with zero text shift.

## Technical Details

### Files to Create

| File | Description |
|---|---|
| `src/components/pdf/templates/pdf/ClassicDoc.tsx` | Classic design: centered header, 2-column, bordered cards |
| `src/components/pdf/templates/pdf/CreativeDoc.tsx` | Creative design: gradient header, profile circle, colored pills |
| `src/components/pdf/templates/pdf/LogosDoc.tsx` | Logos design: header with photo, gray sidebar, skill tags |
| `src/components/pdf/templates/pdf/ModernDoc.tsx` | Modern design: colored header bar, gray sidebar, timeline dots |
| `src/components/pdf/templates/pdf/TimelineDoc.tsx` | Timeline design: vertical line with dot markers |
| `src/services/resumeExportService.ts` | Unified export routing for all templates |

### Files to Update

| File | Change |
|---|---|
| `src/components/pdf/reactPdfFactory.tsx` | Add 5 new template routes to the factory switch |
| `src/hooks/useHTMLPDFGeneration.tsx` | Route all exports through react-pdf pipeline, remove html2canvas logic |
| `src/components/resume-editor/EditorToolbar.tsx` | Wire export button to new service |

### Pagination (Overflow Prevention)

Each react-pdf document component will use:
- `wrap={true}` on the root page content so sections flow to new pages automatically
- `break={false}` on individual experience/education cards to keep them together
- No fixed `height` on the page content -- react-pdf handles A4 boundaries natively

This means if a user has 10 experience entries, the PDF will cleanly flow to page 2 with the same sidebar/header design repeated, rather than cutting off at the bottom.

### What Gets Removed After Migration

- 6 HTML export templates (`*TemplateExport.tsx`) -- no longer needed
- html2canvas text-shift hacks (negative margins, lineHeight tweaks) -- no longer needed
- `htmlToPDFGenerator.ts` for resume use -- replaced by react-pdf
- JPEG resume export -- trade-off for pixel-perfect PDF quality

