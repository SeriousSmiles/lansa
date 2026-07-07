/**
 * <ResumeDocument> — the single vector-first renderer.
 *
 * Used in three places identically:
 *   1. The Resume Editor live preview.
 *   2. The `/resume/print/:token` route that the Puppeteer worker navigates to.
 *   3. Any read-only preview (e.g. share links) that needs the exact same look.
 *
 * Renders semantic HTML sized in millimeters at the chosen paper size, so
 * `page.pdf({ preferCSSPageSize: true })` in the worker produces a true vector
 * PDF with selectable text and ATS-parseable structure.
 *
 * Everything visual is driven by DesignTokens — no hardcoded colors, no
 * hardcoded fonts, no template-specific components. To add a new "template"
 * you produce a new DesignTokens preset, not a new React tree.
 */

import React from 'react';
import { DesignTokens, densityScale } from '@/types/designTokens';
import { PDFResumeData } from '@/types/pdf';

interface ResumeDocumentProps {
  data: PDFResumeData;
  tokens: DesignTokens;
}

const PAPER_MM: Record<'A4' | 'Letter', { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
};

export function ResumeDocument({ data, tokens }: ResumeDocumentProps) {
  const paper = PAPER_MM[tokens.paper];
  const dens = densityScale(tokens.density);
  const base = tokens.typography.baseSizePt * dens.fontMul;
  const gap = tokens.spacing.sectionGapMm * dens.gapMul;
  const leading = tokens.typography.leading * dens.leadingMul;

  const cssVars: React.CSSProperties = {
    // expose tokens as CSS vars for any nested component that wants them
    ['--rd-primary' as any]: tokens.colors.primary,
    ['--rd-secondary' as any]: tokens.colors.secondary,
    ['--rd-text' as any]: tokens.colors.text,
    ['--rd-muted' as any]: tokens.colors.muted,
    ['--rd-surface' as any]: tokens.colors.surface,
    ['--rd-sidebar' as any]: tokens.colors.sidebar ?? tokens.colors.primary,
    ['--rd-heading-family' as any]: tokens.typography.pair.headingFamily,
    ['--rd-body-family' as any]: tokens.typography.pair.bodyFamily,
    ['--rd-heading-weight' as any]: String(tokens.typography.headingWeight),
    ['--rd-body-weight' as any]: String(tokens.typography.bodyWeight),
    ['--rd-tracking' as any]: `${tokens.typography.displayTracking}em`,
  };

  const pageStyle: React.CSSProperties = {
    ...cssVars,
    width: `${paper.w}mm`,
    minHeight: `${paper.h}mm`,
    padding: `${tokens.spacing.pageMarginMm}mm`,
    background: tokens.colors.surface,
    color: tokens.colors.text,
    fontFamily: `var(--rd-body-family), system-ui, -apple-system, sans-serif`,
    fontWeight: tokens.typography.bodyWeight,
    fontSize: `${base}pt`,
    lineHeight: leading,
    boxSizing: 'border-box',
    position: 'relative',
    // vector-friendly: no filters, no transforms
  };

  const isSidebar = tokens.layout === 'sidebar-left' || tokens.layout === 'sidebar-right';

  return (
    <div className="resume-document" style={pageStyle} data-resume-document>
      {/* Injected print CSS: @page, page-break rules, font-face bootstrap */}
      <ResumeDocumentStyles tokens={tokens} paper={paper} />

      {tokens.personalization.watermark ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transform: 'rotate(-30deg)',
            fontSize: '90pt',
            color: tokens.colors.muted,
            opacity: 0.08,
            fontWeight: 900,
            letterSpacing: '0.2em',
            zIndex: 1,
          }}
        >
          {tokens.personalization.watermark}
        </div>
      ) : null}

      {isSidebar ? (
        <SidebarLayout data={data} tokens={tokens} gap={gap} />
      ) : (
        <SingleColumnLayout data={data} tokens={tokens} gap={gap} />
      )}

      {tokens.personalization.showLansaBadge ? <LansaBadge /> : null}
    </div>
  );
}

/* --------------------------------- Layouts -------------------------------- */

function SingleColumnLayout({
  data,
  tokens,
  gap,
}: {
  data: PDFResumeData;
  tokens: DesignTokens;
  gap: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}mm`, position: 'relative', zIndex: 2 }}>
      <Header data={data} tokens={tokens} />
      <Sections data={data} tokens={tokens} order={tokens.sectionOrder} />
    </div>
  );
}

function SidebarLayout({
  data,
  tokens,
  gap,
}: {
  data: PDFResumeData;
  tokens: DesignTokens;
  gap: number;
}) {
  const side = tokens.layout === 'sidebar-right' ? 'row-reverse' : 'row';
  const sidebarKeys = new Set<string>(['skills', 'languages', 'certifications']);
  const mainKeys = tokens.sectionOrder.filter((k) => !sidebarKeys.has(k));
  const sideOrder = tokens.sectionOrder.filter((k) => sidebarKeys.has(k));

  return (
    <div style={{ display: 'flex', flexDirection: side, gap: `${gap}mm`, position: 'relative', zIndex: 2, alignItems: 'stretch' }}>
      <aside
        style={{
          width: '32%',
          background: tokens.colors.sidebar ?? tokens.colors.primary,
          color: '#fff',
          padding: `${tokens.spacing.pageMarginMm}mm`,
          margin: `-${tokens.spacing.pageMarginMm}mm 0 -${tokens.spacing.pageMarginMm}mm ${
            side === 'row-reverse' ? '0' : `-${tokens.spacing.pageMarginMm}mm`
          }`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}mm`,
        }}
      >
        <SidebarIdentity data={data} tokens={tokens} />
        <Sections data={data} tokens={tokens} order={sideOrder} variant="sidebar" />
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${gap}mm`, minWidth: 0 }}>
        <Header data={data} tokens={tokens} compact />
        <Sections data={data} tokens={tokens} order={mainKeys} />
      </main>
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function Header({ data, tokens, compact }: { data: PDFResumeData; tokens: DesignTokens; compact?: boolean }) {
  const nameSize = compact ? 22 : 28;
  return (
    <header style={{ display: 'flex', gap: '6mm', alignItems: 'center' }}>
      {!compact && data.personalInfo.profileImage && tokens.personalization.photoShape !== 'none' ? (
        <Photo url={data.personalInfo.profileImage} shape={tokens.personalization.photoShape} />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: `var(--rd-heading-family)`,
            fontWeight: tokens.typography.headingWeight,
            fontSize: `${nameSize}pt`,
            letterSpacing: `var(--rd-tracking)`,
            color: tokens.colors.text,
            lineHeight: 1.05,
          }}
        >
          {data.personalInfo.name}
        </h1>
        {data.personalInfo.title ? (
          <p style={{ margin: '2mm 0 0', color: tokens.colors.primary, fontWeight: 600, fontSize: `${12}pt` }}>
            {data.personalInfo.title}
          </p>
        ) : null}
        <ContactLine data={data} tokens={tokens} />
      </div>
    </header>
  );
}

function ContactLine({ data, tokens }: { data: PDFResumeData; tokens: DesignTokens }) {
  const bits = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
  ].filter(Boolean) as string[];
  if (!bits.length) return null;
  return (
    <p style={{ margin: '2mm 0 0', color: tokens.colors.muted, fontSize: `${9}pt` }}>
      {bits.join('  ·  ')}
    </p>
  );
}

function Photo({ url, shape }: { url: string; shape: 'circle' | 'squircle' | 'rounded' | 'none' }) {
  const radius = shape === 'circle' ? '50%' : shape === 'squircle' ? '30%' : '8%';
  return (
    <img
      src={url}
      alt=""
      style={{
        width: '28mm',
        height: '28mm',
        objectFit: 'cover',
        borderRadius: radius,
        flex: '0 0 auto',
      }}
    />
  );
}

function SidebarIdentity({ data, tokens }: { data: PDFResumeData; tokens: DesignTokens }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '3mm', alignItems: 'center' }}>
      {data.personalInfo.profileImage && tokens.personalization.photoShape !== 'none' ? (
        <Photo url={data.personalInfo.profileImage} shape={tokens.personalization.photoShape} />
      ) : null}
      <div style={{ fontSize: '9pt', opacity: 0.9, display: 'flex', flexDirection: 'column', gap: '1mm' }}>
        {data.personalInfo.email ? <span>{data.personalInfo.email}</span> : null}
        {data.personalInfo.phone ? <span>{data.personalInfo.phone}</span> : null}
        {data.personalInfo.location ? <span>{data.personalInfo.location}</span> : null}
      </div>
    </div>
  );
}

/* -------------------------------- Sections -------------------------------- */

function Sections({
  data,
  tokens,
  order,
  variant,
}: {
  data: PDFResumeData;
  tokens: DesignTokens;
  order: readonly string[];
  variant?: 'sidebar';
}) {
  return (
    <>
      {order.map((key) => (
        <SectionRenderer key={key} sectionKey={key} data={data} tokens={tokens} variant={variant} />
      ))}
    </>
  );
}

function SectionRenderer({
  sectionKey,
  data,
  tokens,
  variant,
}: {
  sectionKey: string;
  data: PDFResumeData;
  tokens: DesignTokens;
  variant?: 'sidebar';
}) {
  switch (sectionKey) {
    case 'summary':
      return data.personalInfo.summary ? (
        <Section title="Summary" tokens={tokens} variant={variant}>
          <p style={{ margin: 0 }}>{data.personalInfo.summary}</p>
          {data.personalInfo.professionalGoal ? (
            <p style={{ margin: '3mm 0 0', color: tokens.colors.muted, fontStyle: 'italic' }}>
              {data.personalInfo.professionalGoal}
            </p>
          ) : null}
        </Section>
      ) : null;
    case 'experience':
      return data.experience?.length ? (
        <Section title="Experience" tokens={tokens} variant={variant}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4mm' }}>
            {data.experience.map((e, i) => (
              <ExperienceItem key={i} item={e} tokens={tokens} />
            ))}
          </div>
        </Section>
      ) : null;
    case 'education':
      return data.education?.length ? (
        <Section title="Education" tokens={tokens} variant={variant}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3mm' }}>
            {data.education.map((e, i) => (
              <EducationItem key={i} item={e} tokens={tokens} />
            ))}
          </div>
        </Section>
      ) : null;
    case 'skills':
      return data.skills?.length ? (
        <Section title="Skills" tokens={tokens} variant={variant}>
          <SkillChips skills={data.skills} tokens={tokens} inverted={variant === 'sidebar'} />
        </Section>
      ) : null;
    case 'languages':
      return data.languages?.length ? (
        <Section title="Languages" tokens={tokens} variant={variant}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.languages.map((l: any, i: number) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5mm 0' }}>
                <span>{l.language ?? l.name ?? String(l)}</span>
                {l.proficiency ? <span style={{ opacity: 0.8 }}>{l.proficiency}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null;
    case 'certifications':
      return data.certifications?.length ? (
        <Section title="Certifications" tokens={tokens} variant={variant}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
            {data.certifications.map((c, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: '9pt', color: variant === 'sidebar' ? 'rgba(255,255,255,0.85)' : tokens.colors.muted }}>
                  {[c.issuer, c.date].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null;
    case 'projects':
      return data.projects?.length ? (
        <Section title="Projects" tokens={tokens} variant={variant}>
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '3mm' }}>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: '10pt' }}>{p.description}</div>
            </div>
          ))}
        </Section>
      ) : null;
    case 'awards':
      return data.awards?.length ? (
        <Section title="Awards" tokens={tokens} variant={variant}>
          {data.awards.map((a, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: '9pt', color: tokens.colors.muted }}>
                {[a.issuer, a.date].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </Section>
      ) : null;
    case 'volunteer':
      return data.volunteer?.length ? (
        <Section title="Volunteer" tokens={tokens} variant={variant}>
          {data.volunteer.map((v, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{v.title} · {v.organization}</div>
              {v.description ? <div style={{ fontSize: '10pt' }}>{v.description}</div> : null}
            </div>
          ))}
        </Section>
      ) : null;
    case 'achievements':
      return data.achievements?.length ? (
        <Section title="Achievements" tokens={tokens} variant={variant}>
          {data.achievements.map((a, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              {a.description ? <div style={{ fontSize: '10pt' }}>{a.description}</div> : null}
            </div>
          ))}
        </Section>
      ) : null;
    default:
      return null;
  }
}

function Section({
  title,
  children,
  tokens,
  variant,
}: {
  title: string;
  children: React.ReactNode;
  tokens: DesignTokens;
  variant?: 'sidebar';
}) {
  const invert = variant === 'sidebar';
  return (
    <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2
        style={{
          margin: '0 0 2mm',
          fontFamily: 'var(--rd-heading-family)',
          fontWeight: tokens.typography.headingWeight,
          fontSize: '11pt',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: invert ? '#fff' : tokens.colors.primary,
          borderBottom: invert
            ? '1px solid rgba(255,255,255,0.3)'
            : `1px solid ${tokens.colors.primary}`,
          paddingBottom: '1mm',
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function ExperienceItem({ item, tokens }: { item: any; tokens: DesignTokens }) {
  return (
    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4mm', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{item.title || item.role}</div>
          <div style={{ color: tokens.colors.primary, fontSize: '10pt' }}>{item.company || item.organization}</div>
        </div>
        <div style={{ color: tokens.colors.muted, fontSize: '9pt', whiteSpace: 'nowrap' }}>
          {formatRange(item.startDate ?? item.start_year, item.endDate ?? item.end_year, item.isCurrent ?? item.is_current)}
        </div>
      </div>
      {item.description ? (
        <p style={{ margin: '1.5mm 0 0', whiteSpace: 'pre-line' }}>{item.description}</p>
      ) : null}
    </div>
  );
}

function EducationItem({ item, tokens }: { item: any; tokens: DesignTokens }) {
  return (
    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4mm', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{item.degree || item.title}</div>
          <div style={{ color: tokens.colors.primary, fontSize: '10pt' }}>{item.school || item.institution}</div>
        </div>
        <div style={{ color: tokens.colors.muted, fontSize: '9pt', whiteSpace: 'nowrap' }}>
          {formatRange(item.startDate ?? item.start_year, item.endDate ?? item.end_year, false)}
        </div>
      </div>
      {item.description ? <p style={{ margin: '1mm 0 0' }}>{item.description}</p> : null}
    </div>
  );
}

function SkillChips({ skills, tokens, inverted }: { skills: string[]; tokens: DesignTokens; inverted?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
      {skills.map((s, i) => (
        <span
          key={i}
          style={{
            padding: '1mm 2.5mm',
            border: inverted ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${tokens.colors.primary}`,
            borderRadius: '2mm',
            fontSize: '9pt',
            color: inverted ? '#fff' : tokens.colors.text,
            background: inverted ? 'transparent' : `${tokens.colors.primary}14`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function LansaBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '5mm',
        right: '8mm',
        fontSize: '7pt',
        color: '#9CA3AF',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      Powered by Lansa
    </div>
  );
}

function formatRange(start?: any, end?: any, isCurrent?: boolean) {
  const s = start ? String(start) : '';
  const e = isCurrent ? 'Present' : end ? String(end) : '';
  if (!s && !e) return '';
  return `${s}${s && e ? ' — ' : ''}${e}`;
}

function ResumeDocumentStyles({
  tokens,
  paper,
}: {
  tokens: DesignTokens;
  paper: { w: number; h: number };
}) {
  const css = `
    @page { size: ${paper.w}mm ${paper.h}mm; margin: 0; }
    @media print {
      html, body { margin: 0; padding: 0; background: #fff; }
    }
    .resume-document { box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 0 auto; }
    @media print {
      .resume-document { box-shadow: none; margin: 0; }
    }
    .resume-document h1, .resume-document h2, .resume-document h3 { font-family: var(--rd-heading-family), system-ui, sans-serif; }
    .resume-document section { break-inside: avoid; page-break-inside: avoid; }
  `;
  return (
    <>
      {tokens.typography.pair.href ? (
        <link rel="stylesheet" href={tokens.typography.pair.href} />
      ) : null}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}