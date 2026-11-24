import { describe, it, expect } from 'bun:test';
import { toEditForm, buildJobPatch, validateJobEdit } from './jobEditModel';

const legacy = { id: 'j1', organization_id: 'o1', title: 'Cook', description: '**About**\n\nLegacy rich\n\n• Requirement', location: 'Punda', category: 'Hospitality', job_type: 'part_time', is_remote: null, salary_range: 'XCG 1500 - 2000', skills_required: ['Grill'], image_url: 'https://x/cover.jpg', is_active: false, legacy_meta: { a: 1 }, expires_at: '2027-01-01' };

describe('job edit rules', () => {
  it('untouched form sends nothing', () => {
    expect(buildJobPatch(legacy, toEditForm(legacy))).toEqual({});
  });
  it('changing only the title sends only the title', () => {
    expect(buildJobPatch(legacy, { ...toEditForm(legacy), title: 'Head Cook ' })).toEqual({ title: 'Head Cook' });
  });
  it('never includes id, organization, status, image, expiry or unknown metadata', () => {
    const p = buildJobPatch(legacy, { ...toEditForm(legacy), title: 'X', description: 'Y', location: 'Z', job_type: 'contract', is_remote: true, salary_range: '', skills: ['A'] });
    for (const k of ['id', 'organization_id', 'is_active', 'image_url', 'expires_at', 'legacy_meta', 'company_id', 'created_by', 'posted_at']) expect(k in p).toBe(false);
    expect(p.salary_range).toBe(null);
  });
  it('legacy category not in the list is kept and valid', () => {
    expect(validateJobEdit(toEditForm(legacy))).toEqual({});
  });
  it('requires title, description, location, category and a known job type', () => {
    expect(Object.keys(validateJobEdit({ title: '', description: '', location: '', category: '', job_type: 'weird', is_remote: false, salary_range: '', skills: [] })).sort()).toEqual(['category', 'description', 'job_type', 'location', 'title']);
  });
});
