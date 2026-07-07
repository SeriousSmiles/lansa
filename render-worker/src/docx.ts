/**
 * DOCX renderer — consumes the same DesignTokens contract as ResumeDocument,
 * but emits a real Word document (not HTML-converted). Section order, fonts,
 * colors, and content stay in sync because both readers consume the same
 * token contract.
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle,
} from 'docx';

type Tokens = {
  templateId: string;
  paper: 'A4' | 'Letter';
  colors: { primary: string; text: string; muted: string };
  typography: { pair: { headingFamily: string; bodyFamily: string }; headingWeight: number; baseSizePt: number };
  sectionOrder: string[];
};

type Data = {
  personalInfo: {
    name: string; title?: string; email?: string; phone?: string;
    location?: string; summary?: string; professionalGoal?: string;
  };
  experience?: any[]; education?: any[]; skills?: string[]; languages?: any[];
  certifications?: any[]; projects?: any[]; awards?: any[]; volunteer?: any[]; achievements?: any[];
};

function toHex(color: string): string {
  const m = color.match(/^#([0-9a-f]{6})$/i);
  if (m) return m[1].toUpperCase();
  const stripped = color.replace(/[^0-9a-f]/gi, '').slice(0, 6).padEnd(6, '0');
  return stripped.toUpperCase();
}

export async function buildDocx(data: Data, tokens: Tokens): Promise<Buffer> {
  const primary = toHex(tokens.colors.primary);
  const body = tokens.typography.pair.bodyFamily;
  const heading = tokens.typography.pair.headingFamily;
  const bodySizeHalfPt = Math.round(tokens.typography.baseSizePt * 2);

  const children: Paragraph[] = [];

  children.push(new Paragraph({
    children: [new TextRun({ text: data.personalInfo.name, bold: true, size: 44, font: heading })],
    spacing: { after: 60 },
  }));
  if (data.personalInfo.title) {
    children.push(new Paragraph({
      children: [new TextRun({ text: data.personalInfo.title, color: primary, size: 26, font: body })],
      spacing: { after: 100 },
    }));
  }
  const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean);
  if (contact.length) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contact.join('  ·  '), color: '6B7280', size: 20, font: body })],
      spacing: { after: 200 },
    }));
  }

  const section = (title: string) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: title.toUpperCase(), bold: true, color: primary, font: heading, size: 22 })],
    spacing: { before: 200, after: 100 },
    border: { bottom: { color: primary, size: 6, space: 1, style: BorderStyle.SINGLE } },
  });

  const line = (text: string, opts: { bold?: boolean; color?: string } = {}) => new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, color: opts.color, font: body, size: bodySizeHalfPt })],
    spacing: { after: 60 },
  });

  for (const key of tokens.sectionOrder ?? []) {
    switch (key) {
      case 'summary':
        if (data.personalInfo.summary) {
          children.push(section('Summary'));
          children.push(line(data.personalInfo.summary));
          if (data.personalInfo.professionalGoal) children.push(line(data.personalInfo.professionalGoal, { color: '6B7280' }));
        }
        break;
      case 'experience':
        if (data.experience?.length) {
          children.push(section('Experience'));
          for (const e of data.experience) {
            children.push(line(`${e.title ?? e.role} — ${e.company ?? e.organization}`, { bold: true }));
            const range = [e.startDate ?? e.start_year, e.isCurrent ? 'Present' : (e.endDate ?? e.end_year)].filter(Boolean).join(' — ');
            if (range) children.push(line(range, { color: '6B7280' }));
            if (e.description) children.push(line(String(e.description)));
          }
        }
        break;
      case 'education':
        if (data.education?.length) {
          children.push(section('Education'));
          for (const e of data.education) {
            children.push(line(`${e.degree ?? e.title} — ${e.school ?? e.institution}`, { bold: true }));
            const range = [e.startDate ?? e.start_year, e.endDate ?? e.end_year].filter(Boolean).join(' — ');
            if (range) children.push(line(range, { color: '6B7280' }));
          }
        }
        break;
      case 'skills':
        if (data.skills?.length) {
          children.push(section('Skills'));
          children.push(line(data.skills.join(' · ')));
        }
        break;
      case 'languages':
        if (data.languages?.length) {
          children.push(section('Languages'));
          for (const l of data.languages) {
            const name = l.language ?? l.name ?? String(l);
            const prof = l.proficiency ? ` — ${l.proficiency}` : '';
            children.push(line(`${name}${prof}`));
          }
        }
        break;
      case 'certifications':
        if (data.certifications?.length) {
          children.push(section('Certifications'));
          for (const c of data.certifications) {
            children.push(line(c.title, { bold: true }));
            children.push(line([c.issuer, c.date].filter(Boolean).join(' · '), { color: '6B7280' }));
          }
        }
        break;
      case 'projects':
        if (data.projects?.length) {
          children.push(section('Projects'));
          for (const p of data.projects) {
            children.push(line(p.title, { bold: true }));
            if (p.description) children.push(line(p.description));
          }
        }
        break;
      case 'awards':
        if (data.awards?.length) {
          children.push(section('Awards'));
          for (const a of data.awards) {
            children.push(line(a.title, { bold: true }));
            children.push(line([a.issuer, a.date].filter(Boolean).join(' · '), { color: '6B7280' }));
          }
        }
        break;
      case 'volunteer':
        if (data.volunteer?.length) {
          children.push(section('Volunteer'));
          for (const v of data.volunteer) {
            children.push(line(`${v.title} — ${v.organization}`, { bold: true }));
            if (v.description) children.push(line(v.description));
          }
        }
        break;
      case 'achievements':
        if (data.achievements?.length) {
          children.push(section('Achievements'));
          for (const a of data.achievements) {
            children.push(line(a.title, { bold: true }));
            if (a.description) children.push(line(a.description));
          }
        }
        break;
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: body, size: bodySizeHalfPt } } } },
    sections: [{
      properties: {
        page: {
          size: tokens.paper === 'Letter'
            ? { width: 12240, height: 15840 }
            : { width: 11906, height: 16838 },
          margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
        },
      },
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}
