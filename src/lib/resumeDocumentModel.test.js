import { describe, expect, test } from 'bun:test';
import { DEFAULT_TOKENS } from '../types/designTokens';
import { PAPER_DIMENSIONS, bodySize, constrainDesign, documentUnits, paginateHeights } from './resumeDocumentModel';

describe('fixed resume pages and guided editing', () => {
  test('A4 is exactly 210 by 297 millimeters', () => { expect(PAPER_DIMENSIONS.A4).toEqual({ w: 210, h: 297 }); });
  test('US Letter is exactly 8.5 by 11 inches', () => { expect(PAPER_DIMENSIONS.Letter).toEqual({ w: 215.9, h: 279.4 }); });
  test('overflow continues onto another page without losing blocks', () => {
    expect(paginateHeights([40, 40, 40], 90, 5)).toEqual([[0, 1], [2]]);
  });
  test('compact layout cannot reduce body text below 10 points', () => { expect(bodySize({ ...DEFAULT_TOKENS, density: 'compact', typography: { ...DEFAULT_TOKENS.typography, baseSizePt: 10 } })).toBe(10); });
  test('guided editing prevents unsafe margins and unreadable text', () => {
    const result = constrainDesign({ ...DEFAULT_TOKENS, spacing: { pageMarginMm: 0, sectionGapMm: 100 }, colors: { ...DEFAULT_TOKENS.colors, text: '#ffffff' } });
    expect(result.spacing).toEqual({ pageMarginMm: 2, sectionGapMm: 10 });
    expect(result.colors.text).toBe(DEFAULT_TOKENS.colors.text);
  });
  test('legacy wide margins migrate to the tight default', () => {
    expect(constrainDesign({ ...DEFAULT_TOKENS, spacing: { ...DEFAULT_TOKENS.spacing, pageMarginMm: 14 } }).spacing.pageMarginMm).toBe(2.6);
  });
  test('hidden sections stay absent and edited content feeds the document', () => {
    const data = { personalInfo: { name: 'Test', title: '', email: '', phone: '', summary: 'Edited summary', professionalGoal: '' }, experience: [{ title: 'Edited role', description: 'Work' }], education: [], skills: ['Skill'], colors: { primary: '', secondary: '' } };
    const units = documentUnits(data, ['summary', 'experience']);
    expect(units.map(u => u.key)).toEqual(['summary', 'experience']);
    expect(units[1].data.experience[0].title).toBe('Edited role');
    expect(units[0].data.personalInfo.summary).toBe('Edited summary');
  });
});