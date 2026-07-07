/**
 * DesignTokens — the contract that both the live editor preview and the
 * server-rendered export consume. One shape, one source of truth.
 *
 * Anything visual that a user can personalize in the Resume Editor lives here.
 * The `<ResumeDocument>` component in `src/components/resume/ResumeDocument.tsx`
 * is the single reader on the client. The Puppeteer worker renders the same
 * component through the signed print route, and the DOCX renderer in the
 * worker consumes the same tokens through a separate layout code path.
 */

export type PaperSize = 'A4' | 'Letter';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type PhotoShape = 'circle' | 'squircle' | 'rounded' | 'none';
export type IconSet = 'lucide' | 'phosphor' | 'none';
export type LayoutKind =
  | 'single-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-strip'
  | 'timeline';

export interface FontPair {
  /** id of a curated pair, e.g. "urbanist-public-sans" */
  id: string;
  headingFamily: string;
  bodyFamily: string;
  /** google fonts stylesheet URL when the worker renders the print page */
  href?: string;
}

export interface DesignTokens {
  /** template variant. Presets: professional | modern | logos | classic | creative | timeline | minimal | academic */
  templateId: string;
  paper: PaperSize;
  layout: LayoutKind;
  density: Density;

  colors: {
    primary: string;   // brand accent
    secondary: string; // cover/background accent
    text: string;      // body text
    muted: string;     // captions, dates
    surface: string;   // page background
    sidebar?: string;  // used by sidebar layouts
  };

  typography: {
    pair: FontPair;
    /** variable-weight or static weight for headings (300–900) */
    headingWeight: number;
    /** body weight */
    bodyWeight: number;
    /** heading scale step ratio (1.15 – 1.4) */
    scaleRatio: number;
    /** body font size in pt at density=comfortable */
    baseSizePt: number;
    /** letter-spacing for display, in em */
    displayTracking: number;
    /** body line-height */
    leading: number;
  };

  spacing: {
    /** section gap in mm at density=comfortable */
    sectionGapMm: number;
    /** page margin in mm */
    pageMarginMm: number;
  };

  personalization: {
    photoShape: PhotoShape;
    iconSet: IconSet;
    showLansaBadge: boolean;
    showQrCode: boolean;
    /** watermark text (empty = no watermark) */
    watermark?: string;
  };

  /** ordered section keys — the ResumeDocument renders them in this order */
  sectionOrder: ResumeSectionKey[];
}

export type ResumeSectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'projects'
  | 'awards'
  | 'volunteer'
  | 'achievements';

/** Curated font pairs. Add more here to expose them in the editor. */
export const FONT_PAIRS: Record<string, FontPair> = {
  'urbanist-public-sans': {
    id: 'urbanist-public-sans',
    headingFamily: 'Urbanist',
    bodyFamily: 'Public Sans',
    href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;700&family=Urbanist:wght@300;400;600;800;900&display=swap',
  },
  'inter-inter': {
    id: 'inter-inter',
    headingFamily: 'Inter',
    bodyFamily: 'Inter',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap',
  },
  'playfair-lato': {
    id: 'playfair-lato',
    headingFamily: 'Playfair Display',
    bodyFamily: 'Lato',
    href: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;700;900&display=swap',
  },
  'space-grotesk-dm-sans': {
    id: 'space-grotesk-dm-sans',
    headingFamily: 'Space Grotesk',
    bodyFamily: 'DM Sans',
    href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap',
  },
  'ibm-plex-serif-ibm-plex-sans': {
    id: 'ibm-plex-serif-ibm-plex-sans',
    headingFamily: 'IBM Plex Serif',
    bodyFamily: 'IBM Plex Sans',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;700&family=IBM+Plex+Serif:wght@400;600;700&display=swap',
  },
  'fraunces-manrope': {
    id: 'fraunces-manrope',
    headingFamily: 'Fraunces',
    bodyFamily: 'Manrope',
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;900&family=Manrope:wght@300;400;500;700&display=swap',
  },
};

export const DEFAULT_TOKENS: DesignTokens = {
  templateId: 'professional',
  paper: 'A4',
  layout: 'sidebar-left',
  density: 'comfortable',
  colors: {
    primary: 'hsl(14, 90%, 60%)',
    secondary: 'hsl(215, 85%, 55%)',
    text: '#111827',
    muted: '#6B7280',
    surface: '#FFFFFF',
    sidebar: '#191F71',
  },
  typography: {
    pair: FONT_PAIRS['urbanist-public-sans'],
    headingWeight: 800,
    bodyWeight: 400,
    scaleRatio: 1.22,
    baseSizePt: 10.5,
    displayTracking: -0.02,
    leading: 1.45,
  },
  spacing: {
    sectionGapMm: 6,
    pageMarginMm: 14,
  },
  personalization: {
    photoShape: 'circle',
    iconSet: 'lucide',
    showLansaBadge: true,
    showQrCode: false,
  },
  sectionOrder: [
    'summary',
    'experience',
    'education',
    'skills',
    'languages',
    'certifications',
    'projects',
    'awards',
    'volunteer',
    'achievements',
  ],
};

/**
 * Resolve a density into concrete multipliers used by the renderer.
 */
export function densityScale(d: Density) {
  switch (d) {
    case 'compact':
      return { fontMul: 0.94, gapMul: 0.75, leadingMul: 0.95 };
    case 'spacious':
      return { fontMul: 1.06, gapMul: 1.35, leadingMul: 1.1 };
    default:
      return { fontMul: 1, gapMul: 1, leadingMul: 1 };
  }
}