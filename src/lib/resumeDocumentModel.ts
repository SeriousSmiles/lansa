import { DEFAULT_TOKENS, DesignTokens, ResumeSectionKey, densityScale } from '../types/designTokens';
import { PDFResumeData } from '../types/pdf';
import { contrastRatio } from '../utils/wcagContrast';

export const PAPER_DIMENSIONS = {
  A4: { w: 210, h: 297 },
  Letter: { w: 215.9, h: 279.4 },
} as const;

export const SECTION_KEYS = [...DEFAULT_TOKENS.sectionOrder];
export interface ResumeSnapshot { tokens: DesignTokens; data: PDFResumeData }
export interface DocumentUnit { key: ResumeSectionKey; data: PDFResumeData; continued: boolean }

export function constrainDesign(input: DesignTokens): DesignTokens {
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  const colors = { ...input.colors };
  if (contrastRatio(colors.text, colors.surface) < 4.5) colors.text = DEFAULT_TOKENS.colors.text;
  if (contrastRatio(colors.muted, colors.surface) < 4.5) colors.muted = DEFAULT_TOKENS.colors.text;
  return {
    ...input, colors,
    paper: input.paper === 'Letter' ? 'Letter' : 'A4',
    typography: { ...input.typography,
      baseSizePt: clamp(input.typography.baseSizePt, 10, 12),
      headingWeight: clamp(input.typography.headingWeight, 400, 900),
      bodyWeight: clamp(input.typography.bodyWeight, 400, 500),
      leading: clamp(input.typography.leading, 1.3, 1.65),
      scaleRatio: clamp(input.typography.scaleRatio, 1.15, 1.35),
      displayTracking: 0,
    },
    spacing: { pageMarginMm: clamp(input.spacing.pageMarginMm, 10, 22), sectionGapMm: clamp(input.spacing.sectionGapMm, 3, 10) },
    sectionOrder: [...new Set(input.sectionOrder.filter(k => SECTION_KEYS.includes(k)))],
  };
}

// Keep a readable minimum even when a compact density is selected.
export function bodySize(tokens: DesignTokens) {
  return Math.max(10, tokens.typography.baseSizePt * densityScale(tokens.density).fontMul);
}

export function paginateHeights(heights: number[], capacity: number, gap: number): number[][] {
  const pages: number[][] = [[]];
  let used = 0;
  heights.forEach((height, index) => {
    let page = pages[pages.length - 1];
    const addition = height + (page.length ? gap : 0);
    if (page.length && used + addition > capacity) {
      page = []; pages.push(page); used = 0;
    }
    used += height + (page.length ? gap : 0);
    page.push(index);
  });
  return pages;
}

function textChunks(text: string, max = 450): string[] {
  if (!text) return [''];
  const result: string[] = [];
  let chunk = '';
  // Split unbroken strings too, so pasted URLs/very long words cannot escape a page.
  for (const word of text.match(/\S{1,80}|\s+/g) ?? []) {
    if (chunk.length + word.length > max && chunk) { result.push(chunk.trim()); chunk = ''; }
    chunk += word;
  }
  if (chunk.trim()) result.push(chunk.trim());
  return result;
}

export function documentUnits(data: PDFResumeData, order: ResumeSectionKey[]): DocumentUnit[] {
  const units: DocumentUnit[] = [];
  for (const key of order) {
    if (key === 'summary') {
      if (!data.personalInfo.summary && !data.personalInfo.professionalGoal) continue;
      const chunks = textChunks(data.personalInfo.summary);
      chunks.forEach((summary, i) => units.push({ key, continued: i > 0, data: {
        ...data, personalInfo: { ...data.personalInfo, summary, professionalGoal: i === chunks.length - 1 ? data.personalInfo.professionalGoal : '' },
      } }));
      continue;
    }
    const entries = data[key];
    if (!Array.isArray(entries) || !entries.length) continue;
    if (key === 'skills' || key === 'languages') {
      const size = key === 'skills' ? 6 : 5;
      for (let i = 0; i < entries.length; i += size) {
        units.push({ key, continued: i > 0, data: { ...data, [key]: entries.slice(i, i + size) } });
      }
    } else {
      entries.forEach((entry, index) => {
        const item = entry as { description?: string };
        textChunks(item.description ?? '').forEach((description, part) => units.push({
          key, continued: index > 0 || part > 0,
          data: { ...data, [key]: [{ ...item, ...(item.description !== undefined ? { description } : {}) }] },
        }));
      });
    }
  }
  return units;
}