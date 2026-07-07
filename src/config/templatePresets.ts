/**
 * Template presets — Phase 3 deliverable.
 * Every visual "template" is a DesignTokens preset consumed by <ResumeDocument>.
 * Adding a new template = new entry here. No new React tree required.
 */

import { DesignTokens, DEFAULT_TOKENS, FONT_PAIRS } from '@/types/designTokens';

type Preset = { id: string; name: string; description: string; tokens: DesignTokens };

const clone = (t: DesignTokens): DesignTokens => JSON.parse(JSON.stringify(t));

export const TEMPLATE_PRESETS: Preset[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Sidebar-left layout, deep-blue accent, ATS-safe typography.',
    tokens: { ...clone(DEFAULT_TOKENS), templateId: 'professional' },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Single-column, orange accents, extralight display.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'modern',
      layout: 'single-column',
      colors: {
        primary: 'hsl(14, 90%, 60%)',
        secondary: 'hsl(215, 85%, 55%)',
        text: '#0F172A',
        muted: '#64748B',
        surface: '#FFFFFF',
      },
      typography: {
        pair: FONT_PAIRS['space-grotesk-dm-sans'],
        headingWeight: 700,
        bodyWeight: 400,
        scaleRatio: 1.25,
        baseSizePt: 10.5,
        displayTracking: -0.02,
        leading: 1.5,
      },
    },
  },
  {
    id: 'logos',
    name: 'Logos',
    description: 'Icon-forward, warm surface, generous whitespace.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'logos',
      layout: 'single-column',
      density: 'spacious',
      colors: {
        primary: 'hsl(14, 90%, 60%)',
        secondary: 'hsl(215, 85%, 55%)',
        text: '#111827',
        muted: '#6B7280',
        surface: '#FDF8F2',
      },
      personalization: { ...DEFAULT_TOKENS.personalization, iconSet: 'lucide' },
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Serif headings, conservative spacing, single column.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'classic',
      layout: 'single-column',
      colors: {
        primary: '#191F71',
        secondary: '#475569',
        text: '#0F172A',
        muted: '#475569',
        surface: '#FFFFFF',
      },
      typography: {
        pair: FONT_PAIRS['ibm-plex-serif-ibm-plex-sans'],
        headingWeight: 700,
        bodyWeight: 400,
        scaleRatio: 1.2,
        baseSizePt: 10.5,
        displayTracking: -0.005,
        leading: 1.5,
      },
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Fraunces + Manrope, right sidebar, expressive contrast.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'creative',
      layout: 'sidebar-right',
      colors: {
        primary: 'hsl(14, 90%, 60%)',
        secondary: '#191F71',
        text: '#111827',
        muted: '#6B7280',
        surface: '#FFFFFF',
        sidebar: '#191F71',
      },
      typography: {
        pair: FONT_PAIRS['fraunces-manrope'],
        headingWeight: 900,
        bodyWeight: 400,
        scaleRatio: 1.33,
        baseSizePt: 10.5,
        displayTracking: -0.03,
        leading: 1.45,
      },
    },
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological emphasis, condensed density.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'timeline',
      layout: 'timeline',
      density: 'compact',
      typography: {
        ...clone(DEFAULT_TOKENS).typography,
        pair: FONT_PAIRS['inter-inter'],
        headingWeight: 700,
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Everything stripped back. Inter, black on white.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'minimal',
      layout: 'single-column',
      density: 'comfortable',
      colors: {
        primary: '#111827',
        secondary: '#374151',
        text: '#111827',
        muted: '#6B7280',
        surface: '#FFFFFF',
      },
      typography: {
        pair: FONT_PAIRS['inter-inter'],
        headingWeight: 700,
        bodyWeight: 400,
        scaleRatio: 1.2,
        baseSizePt: 10.5,
        displayTracking: -0.01,
        leading: 1.5,
      },
      personalization: { ...DEFAULT_TOKENS.personalization, showLansaBadge: false, iconSet: 'none' },
    },
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Playfair + Lato, publications-friendly spacing.',
    tokens: {
      ...clone(DEFAULT_TOKENS),
      templateId: 'academic',
      layout: 'single-column',
      density: 'spacious',
      colors: {
        primary: '#191F71',
        secondary: '#475569',
        text: '#0F172A',
        muted: '#4B5563',
        surface: '#FFFFFF',
      },
      typography: {
        pair: FONT_PAIRS['playfair-lato'],
        headingWeight: 700,
        bodyWeight: 400,
        scaleRatio: 1.28,
        baseSizePt: 10.5,
        displayTracking: -0.01,
        leading: 1.55,
      },
    },
  },
];

export function getTemplatePreset(id: string): DesignTokens {
  const p = TEMPLATE_PRESETS.find((t) => t.id === id);
  return p ? clone(p.tokens) : clone(DEFAULT_TOKENS);
}