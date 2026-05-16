## Goal

Replace every dashed image-slot placeholder on `/certification` (and the new Dashboard Certification CTA) with AI-generated imagery that sells the block it sits in — minimal-to-no on-image text (the surrounding copy already speaks), warm Curaçao brand language, no gray/purple, no clichés.

Two visual registers, one cohesive system:

- **Sector cards** → photographic. Real-feeling portraits of the type of Curaçao worker who'd take that exam. Warm natural light, brand-tinted environments.
- **Hero, story chapters, closing CTA, dashboard CTA** → editorial *design imagery* (not stock photos). Composed scenes, art-directed still lifes, or graphic compositions that carry meaning visually. Treated like an Awwwards editorial spread.

All images saved under `src/assets/certification/` and `src/assets/dashboard/`, imported as ES6 modules and wired into the existing `BrandImageSlot` / `SectorFeatureCard` / `HubHero` / `CertificationCtaSlot` `src` props. No layout changes, no copy changes.

---

## Inventory — 10 image slots

| # | Slot | Component | Aspect | Register | Target file |
|---|---|---|---|---|---|
| 1 | Hero portrait | `HubHero` | ~3:4 column | Editorial design (with subject) | `src/assets/certification/cert-hero.jpg` |
| 2 | Chapter 01 — *Verified, not assumed* | `HubStoryBand` | 16:7 wide | Design / still life | `src/assets/certification/cert-story-verified.jpg` |
| 3 | Chapter 02 — *Show up where employers look* | `HubStoryBand` | 16:7 wide | Design / composition | `src/assets/certification/cert-story-visibility.jpg` |
| 4 | Chapter 03 — *Apply with weight* | `HubStoryBand` | 16:7 wide | Design / scene | `src/assets/certification/cert-story-apply.jpg` |
| 5 | Office Professional | `SectorFeatureCard` | 16:8 | Worker photo | `src/assets/certification/sector-office.jpg` |
| 6 | Service Professional | `SectorFeatureCard` | 16:8 | Worker photo | `src/assets/certification/sector-service.jpg` |
| 7 | Technical Professional | `SectorFeatureCard` | 16:9 | Worker photo | `src/assets/certification/sector-technical.jpg` |
| 8 | Digital Professional | `SectorFeatureCard` | 16:9 | Worker photo | `src/assets/certification/sector-digital.jpg` |
| 9 | Closing CTA | `HubClosingCta` (`BrandImageSlot`) | 16:7 wide | Design / object | `src/assets/certification/cert-closing.jpg` |
| 10 | Dashboard Certification CTA | `CertificationCtaSlot` (`BrandImageSlot`) | 16:7 wide | Design / portrait-led | `src/assets/dashboard/cert-cta.jpg` |

---

## Visual system (applied to every image)

- **Palette only**: warm cream `rgba(253,248,242,1)`, brand orange `hsl(14 90% 60%)`, brand blue `hsl(215 85% 55%)`, deep blue `#191f71`, ink near-black. No gray dominance, no purple, no neon, no AI-rainbow gradients.
- **Light**: warm Caribbean daylight or low golden hour. Soft shadows, no harsh studio.
- **Mood**: human-first, dignified, intentional. Never corporate-stock, never "diversity poster".
- **People**: when shown, real-feeling Curaçao adults across ethnicities and ages relevant to the role. No celebrities, no logos, no on-clothing branding. No text on garments or signage.
- **On-image text**: avoided by default. If a story image benefits from a single short word/mark, allow at most 1–3 letters (e.g. a subtle stamp, badge, or tag) — never sentences, never the headline already on the page.
- **Composition**: editorial negative space, off-center subjects, room for the surrounding card chrome. Each image must read at both small (sector card) and large (hero) sizes.
- **Cohesion**: same color grade across all 10. Sector photos share grading with editorial pieces so the page feels like one publication, not a Pinterest board.

### Per-slot creative direction (concise)

1. **Hero** — A single Curaçao professional shot 3/4 portrait, warm window light, looking just past camera with quiet confidence. Cream wall, hint of brand orange in clothing or wall accent. Frames left so the right two-thirds breathe.
2. **Verified, not assumed** — Editorial still life: a hand placing a single embossed seal/stamp on warm cream paper. Deep blue ink, orange wax. No words on the seal — just a mark.
3. **Show up where employers look** — Overhead composition: a small group of cream cards arranged on a table; one card glows lifted, lit warm orange, the others sit flat in soft shadow. Reads as "surfaced".
4. **Apply with weight** — A confident open-handed gesture extending a folded warm-cream document across a wood-grain table toward an unseen recipient. Brand-orange edge mark on the document.
5. **Office Professional** — A composed Curaçao admin/coordinator in a sunlit office, mid-30s, mid-action at a desk. Brand blue accents (notebook, wall). No screens with logos.
6. **Service Professional** — A warm hospitality/retail worker behind a counter or in a café, mid-20s, genuine half-smile mid-conversation (no customer in frame). Orange apron or accent.
7. **Technical Professional** — A skilled trades worker on a Curaçao site (mechanic / installer / electrician), focused mid-task, clean uniform, deep-blue accent. Tools real, no brand marks.
8. **Digital Professional** — A young Curaçao creative/dev at a sunlit workspace, sketching or reviewing on a tablet. Warm neutral wall, orange accent. Screens blurred / abstract — no UI mockups.
9. **Closing CTA** — A single warm-cream envelope on a wooden surface with a thin orange wax seal, light beam falling diagonally. Quiet, ceremonial, "your move".
10. **Dashboard CTA** — A Curaçao professional mid-step, half-turned, wearing warm tones, walking into warm light. Energetic but composed — "start now" without an arrow icon.

---

## Phased delivery

The user asked for gradual, careful steps. Each phase generates → I review the output in chat → you approve or request a re-prompt before we move on.

### Phase 1 — Anchors (3 images)
The pieces that define the page's grade. If these land, the rest follows the same grade.
- **Hero** (#1)
- **Story Chapter 01 — Verified** (#2)
- **Office Professional** (#5)

After generation: paste them into the page, screenshot for QA, confirm color grade and tone before continuing.

### Phase 2 — Sector portraits (3 images)
Match the grade locked in Phase 1.
- **Service Professional** (#6)
- **Technical Professional** (#7)
- **Digital Professional** (#8)

### Phase 3 — Editorial supporting cast (4 images)
Round out the narrative and the dashboard.
- **Story Chapter 02 — Visibility** (#3)
- **Story Chapter 03 — Apply** (#4)
- **Closing CTA** (#9)
- **Dashboard CTA** (#10)

If any image misses on first generation, I re-prompt that single image within its phase before moving on. We do not move forward with an off-brand image.

---

## Technical implementation per image

For each image:

1. Generate with `imagegen--generate_image` at the correct aspect ratio:
   - `model: "standard"` for editorial / hero (better composition + light)
   - `model: "fast"` for sector photos unless one needs a re-roll
   - `transparent_background: false` (these are full bleed photo/editorial)
2. Save directly to its target path under `src/assets/...` (no `/mnt/documents` since these ship with the app).
3. Wire it in:
   - `HubHero` gains a `src={certHero}` import + prop pass-through (already supports `src`).
   - `SectorShowcase` passes per-sector `src` into each `SectorFeatureCard`. Add an `image` field to the `SECTORS` array and a `src` prop on the card (already supported).
   - `HubStoryBand` extends its local `CHAPTERS` array with an `src` field and passes it through to `BrandImageSlot` (already supports `src`).
   - `HubClosingCta` accepts an imported image and passes it as `src` to its `BrandImageSlot`.
   - `CertificationCtaSlot` accepts an imported image and passes it as `src` to its `BrandImageSlot`.
4. After each phase, view the rendered preview to confirm: composition crops cleanly inside the card, no on-image text fights the page copy, color grade matches sibling slots.

---

## Out of scope

- Copy changes on the page (headlines/eyebrows stay as written).
- Layout/animation changes.
- Mobile-specific image variants (the same images crop responsively via `object-cover` already in `BrandImageSlot` / `SectorFeatureCard`).
- Generating images for slots outside `/certification` and the dashboard CTA (e.g. existing dashboard slots already have user-pasted images).
