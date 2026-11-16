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

import React, { useLayoutEffect, useRef, useState } from 'react';
import { DesignTokens, densityScale } from '@/types/designTokens';
import { PDFResumeData } from '@/types/pdf';
import { PAPER_DIMENSIONS, bodySize, documentUnits, paginateHeights } from '@/lib/resumeDocumentModel';

interface ResumeDocumentProps {
  data: PDFResumeData;
  tokens: DesignTokens;
  onReady?: (pageCount: number) => void;
}

/** Measure at unscaled physical size; preview and print share the same page tree. */
export function ResumeDocument({ data, tokens, onReady }: ResumeDocumentProps) {
  const paper = PAPER_DIMENSIONS[tokens.paper];
  const dens = densityScale(tokens.density);
  const gap = tokens.spacing.sectionGapMm * dens.gapMul;
  const margin = tokens.spacing.pageMarginMm;
  const sidebar = tokens.layout === 'sidebar-left' || tokens.layout === 'sidebar-right';
  const units = documentUnits(data, tokens.sectionOrder);
  const sideKeys = new Set(['skills', 'languages', 'certifications']);
  const mainUnits = units.filter(u => !sidebar || !sideKeys.has(u.key));
  const sideUnits = sidebar ? units.filter(u => sideKeys.has(u.key)) : [];
  const measurement = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<{ signature: string; main: number[][]; side: number[][] } | null>(null);
  const signature = JSON.stringify({ data, tokens });
  const ready = pagination?.signature === signature;
  const mainBlocks = [<Header key="identity" data={data} tokens={tokens} compact={sidebar} />,
    ...mainUnits.map((u, i) => <SectionRenderer key={`main-${i}`} sectionKey={u.key} data={u.data} tokens={tokens} continued={u.continued} />)];
  const sideBlocks = sidebar ? [<SidebarIdentity key="photo" data={data} tokens={tokens} />,
    ...sideUnits.map((u, i) => <SectionRenderer key={`side-${i}`} sectionKey={u.key} data={u.data} tokens={tokens} variant="sidebar" continued={u.continued} />)] : [];

  useLayoutEffect(() => {
    let cancelled = false;
    const root = measurement.current;
    if (!root) return;
    const measure = async () => {
      await Promise.all([
        document.fonts.load(`${tokens.typography.headingWeight} 12pt "${tokens.typography.pair.headingFamily}"`),
        document.fonts.load(`${tokens.typography.bodyWeight} 12pt "${tokens.typography.pair.bodyFamily}"`),
      ]);
      await document.fonts.ready;
      await Promise.all(Array.from(root.querySelectorAll('img')).map(img => img.decode().catch(() => undefined)));
      if (cancelled) return;
      const lane = root.querySelector<HTMLElement>('[data-measure-main]');
      const side = root.querySelector<HTMLElement>('[data-measure-side]');
      if (!lane) return;
      const heights = (el: HTMLElement) => Array.from(el.children).map(c => (c as HTMLElement).offsetHeight);
      // offsetHeight ignores editor zoom, unlike getBoundingClientRect.
      const pxPerMm = root.offsetWidth / paper.w;
      const capacity = (paper.h - margin * 2 - (tokens.personalization.showLansaBadge ? 5 : 0)) * pxPerMm;
      setPagination({ signature, main: paginateHeights(heights(lane), capacity, gap * pxPerMm),
        side: side ? paginateHeights(heights(side), capacity, gap * pxPerMm) : [[]] });
    };
    void measure();
    return () => { cancelled = true; };
  }, [signature, paper.w, paper.h, margin, gap, tokens.personalization.showLansaBadge, tokens.typography.bodyWeight, tokens.typography.headingWeight, tokens.typography.pair.bodyFamily, tokens.typography.pair.headingFamily]);

  useLayoutEffect(() => { if (ready && pagination) onReady?.(Math.max(pagination.main.length, pagination.side.length)); }, [ready, pagination, onReady]);

  const vars: React.CSSProperties = {
    ['--rd-heading-family' as string]: tokens.typography.pair.headingFamily,
    ['--rd-body-family' as string]: tokens.typography.pair.bodyFamily,
    ['--rd-tracking' as string]: '0em',
    ['--rd-heading-size' as string]: `${bodySize(tokens) * tokens.typography.scaleRatio}pt`,
    width: `${paper.w}mm`, color: tokens.colors.text, background: tokens.colors.surface,
    fontFamily: `${tokens.typography.pair.bodyFamily}, sans-serif`, fontWeight: tokens.typography.bodyWeight,
    fontSize: `${bodySize(tokens)}pt`, lineHeight: tokens.typography.leading * dens.leadingMul,
    overflowWrap: 'anywhere', boxSizing: 'border-box',
  };
  const laneStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: `${gap}mm`, minWidth: 0 };
  // Pages have no outer padding: each lane carries its own padding so colored
  // lanes (sidebar) bleed to the paper edge while text lanes keep the margin.
  const gridStyle = (measuring: boolean): React.CSSProperties => ({
    display: 'grid', gridTemplateColumns: sidebar ? (tokens.layout === 'sidebar-right' ? '1fr 30%' : '30% 1fr') : '1fr', gap: 0,
    ...(measuring ? {} : { height: '100%', gridTemplateRows: 'minmax(0, 1fr)' }),
  });
  const renderLanes = (main: React.ReactNode[], side: React.ReactNode[], measuring = false) => (
    <div style={gridStyle(measuring)}>
      {sidebar && tokens.layout === 'sidebar-left' && <aside data-measure-side={measuring ? '' : undefined} style={{ ...laneStyle, color: tokens.colors.surface, background: tokens.colors.sidebar ?? tokens.colors.primary, padding: `${margin}mm` }}>{side}</aside>}
      <main data-measure-main={measuring ? '' : undefined} style={{ ...laneStyle, padding: `${margin}mm` }}>{main}</main>
      {sidebar && tokens.layout === 'sidebar-right' && <aside data-measure-side={measuring ? '' : undefined} style={{ ...laneStyle, color: tokens.colors.surface, background: tokens.colors.sidebar ?? tokens.colors.primary, padding: `${margin}mm` }}>{side}</aside>}
    </div>
  );
  const count = ready && pagination ? Math.max(pagination.main.length, pagination.side.length) : 0;
  const pageBlocks = (indexes: number[], blocks: React.ReactElement[], laneUnits: typeof units, identityOffset: number) => indexes.map((i, position) => {
    const unit = laneUnits[i - identityOffset];
    const previous = laneUnits[(indexes[position - 1] ?? -1) - identityOffset];
    return <React.Fragment key={i}>{unit ? React.cloneElement(blocks[i], { continued: position === 0 && unit.continued, hideHeading: previous?.key === unit.key }) : blocks[i]}</React.Fragment>;
  });
  return (
    <div className="resume-pages" data-resume-pages data-resume-ready={ready ? 'true' : 'false'}>
      <ResumeDocumentStyles tokens={tokens} paper={paper} />
      <div ref={measurement} aria-hidden style={{ ...vars, position: 'absolute', visibility: 'hidden', pointerEvents: 'none', top: 0, left: 0 }}>
        {renderLanes(mainBlocks, sideBlocks, true)}
      </div>
      {ready && pagination ? Array.from({ length: count }, (_, index) => (
        <div key={index} className="resume-document" data-resume-document data-page-number={index + 1}
          style={{ ...vars, height: `${paper.h}mm`, position: 'relative', overflow: 'hidden' }}>
          {tokens.personalization.watermark && <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.08, fontSize: '48pt', color: tokens.colors.muted, pointerEvents: 'none' }}>{tokens.personalization.watermark}</div>}
          {renderLanes(pageBlocks(pagination.main[index] ?? [], mainBlocks, mainUnits, 1),
            pageBlocks(pagination.side[index] ?? [], sideBlocks, sideUnits, 1))}
          {tokens.personalization.showLansaBadge && <LansaBadge />}
        </div>
      )) : <div role="status" style={{ ...vars, height: `${paper.h}mm` }}>Preparing pages…</div>}
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function Header({ data, tokens, compact }: { data: PDFResumeData; tokens: DesignTokens; compact?: boolean }) {
  const nameSize = bodySize(tokens) * tokens.typography.scaleRatio ** (compact ? 3 : 4);
  return (
    <header style={{ display: 'flex', gap: '6mm', alignItems: 'center', ...(tokens.layout === 'header-strip' ? { borderTop: `3mm solid ${tokens.colors.secondary}`, paddingTop: '4mm' } : {}) }}>
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
          <p style={{ margin: '2mm 0 0', color: tokens.colors.primary, fontWeight: 600, fontSize: 'var(--rd-heading-size)' }}>
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
    <p style={{ margin: '2mm 0 0', color: tokens.colors.muted, fontSize: '1em' }}>
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
      <div style={{ fontSize: '1em', opacity: 0.9, display: 'flex', flexDirection: 'column', gap: '1mm' }}>
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
  continued,
  hideHeading,
}: {
  sectionKey: string;
  data: PDFResumeData;
  tokens: DesignTokens;
  variant?: 'sidebar';
  continued?: boolean;
  hideHeading?: boolean;
}) {
  switch (sectionKey) {
    case 'summary':
      return data.personalInfo.summary ? (
        <Section title="Summary" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
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
        <Section title="Experience" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4mm' }}>
            {data.experience.map((e, i) => (
              <ExperienceItem key={i} item={e} tokens={tokens} />
            ))}
          </div>
        </Section>
      ) : null;
    case 'education':
      return data.education?.length ? (
        <Section title="Education" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3mm' }}>
            {data.education.map((e, i) => (
              <EducationItem key={i} item={e} tokens={tokens} />
            ))}
          </div>
        </Section>
      ) : null;
    case 'skills':
      return data.skills?.length ? (
        <Section title="Skills" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          <SkillChips skills={data.skills} tokens={tokens} inverted={variant === 'sidebar'} />
        </Section>
      ) : null;
    case 'languages':
      return data.languages?.length ? (
        <Section title="Languages" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.languages.map((l, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5mm 0' }}>
                <span>{l.name}</span>
                {l.level ? <span style={{ opacity: 0.8 }}>{['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'][l.level - 1]}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null;
    case 'certifications':
      return data.certifications?.length ? (
        <Section title="Certifications" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
            {data.certifications.map((c, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: '1em', color: variant === 'sidebar' ? 'rgba(255,255,255,0.85)' : tokens.colors.muted }}>
                  {[c.issuer, c.date].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null;
    case 'projects':
      return data.projects?.length ? (
        <Section title="Projects" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '3mm' }}>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: '1em' }}>{p.description}</div>
            </div>
          ))}
        </Section>
      ) : null;
    case 'awards':
      return data.awards?.length ? (
        <Section title="Awards" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          {data.awards.map((a, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: '1em', color: tokens.colors.muted }}>
                {[a.issuer, a.date].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </Section>
      ) : null;
    case 'volunteer':
      return data.volunteer?.length ? (
        <Section title="Volunteer" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          {data.volunteer.map((v, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{v.title} · {v.organization}</div>
              {v.description ? <div style={{ fontSize: '1em' }}>{v.description}</div> : null}
            </div>
          ))}
        </Section>
      ) : null;
    case 'achievements':
      return data.achievements?.length ? (
        <Section title="Achievements" tokens={tokens} variant={variant} continued={continued} hideHeading={hideHeading}>
          {data.achievements.map((a, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              {a.description ? <div style={{ fontSize: '1em' }}>{a.description}</div> : null}
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
  continued,
  hideHeading,
}: {
  title: string;
  children: React.ReactNode;
  tokens: DesignTokens;
  variant?: 'sidebar';
  continued?: boolean;
  hideHeading?: boolean;
}) {
  const invert = variant === 'sidebar';
  return (
    <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid', ...(tokens.layout === 'timeline' ? { borderLeft: `0.5mm solid ${tokens.colors.secondary}`, paddingLeft: '3mm' } : {}) }}>
      {!hideHeading && <h2
        style={{
          margin: '0 0 2mm',
          fontFamily: 'var(--rd-heading-family)',
          fontWeight: tokens.typography.headingWeight,
          fontSize: 'var(--rd-heading-size)',
          textTransform: 'uppercase',
          letterSpacing: 0,
          color: invert ? '#fff' : tokens.colors.primary,
          borderBottom: invert
            ? '1px solid rgba(255,255,255,0.3)'
            : `1px solid ${tokens.colors.primary}`,
          paddingBottom: '1mm',
        }}
      >
        {title}{continued ? ' (continued)' : ''}
      </h2>}
      <div>{children}</div>
    </section>
  );
}

type DatedEntry = { title?: string; role?: string; degree?: string; company?: string; organization?: string; school?: string; institution?: string; description?: string; startDate?: string; endDate?: string; startYear?: number; endYear?: number | null; start_year?: number; end_year?: number; isCurrent?: boolean; is_current?: boolean };

function ExperienceItem({ item, tokens }: { item: DatedEntry; tokens: DesignTokens }) {
  return (
    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4mm', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{item.title || item.role}</div>
          <div style={{ color: tokens.colors.primary, fontSize: '1em' }}>{item.company || item.organization}</div>
        </div>
        <div style={{ color: tokens.colors.muted, fontSize: '1em', whiteSpace: 'nowrap' }}>
          {formatRange(item.startDate ?? item.startYear ?? item.start_year, item.endDate ?? item.endYear ?? item.end_year, item.isCurrent ?? item.is_current ?? (item.startYear != null && item.endYear === null))}
        </div>
      </div>
      {item.description ? (
        <p style={{ margin: '1.5mm 0 0', whiteSpace: 'pre-line' }}>{item.description}</p>
      ) : null}
    </div>
  );
}

function EducationItem({ item, tokens }: { item: DatedEntry; tokens: DesignTokens }) {
  return (
    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4mm', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{item.degree || item.title}</div>
          <div style={{ color: tokens.colors.primary, fontSize: '1em' }}>{item.school || item.institution}</div>
        </div>
        <div style={{ color: tokens.colors.muted, fontSize: '1em', whiteSpace: 'nowrap' }}>
          {formatRange(item.startDate ?? item.startYear ?? item.start_year, item.endDate ?? item.endYear ?? item.end_year, false)}
        </div>
      </div>
      {item.description ? <p style={{ margin: '1mm 0 0' }}>{item.description}</p> : null}
    </div>
  );
}

function SkillChips({ skills, tokens, inverted }: { skills: string[]; tokens: DesignTokens; inverted?: boolean }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8mm' }}>
      {skills.map((s, i) => (
        <li key={i} style={{ display: 'flex', gap: '1.8mm', alignItems: 'baseline', lineHeight: 1.3, color: inverted ? '#fff' : tokens.colors.text }}>
          <span aria-hidden style={{ flexShrink: 0, width: '1.2mm', height: '1.2mm', borderRadius: '50%', transform: 'translateY(-0.3mm)', background: inverted ? 'rgba(255,255,255,0.7)' : tokens.colors.primary }} />
          <span>{s}</span>
        </li>
      ))}
    </ul>
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

function formatRange(start?: string | number, end?: string | number | null, isCurrent?: boolean) {
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
    .resume-pages { position: relative; display: flex; flex-direction: column; gap: 16px; width: fit-content; min-width: 100%; }
    .resume-document { margin: 0 auto; flex-shrink: 0; box-shadow: 0 1px 2px hsl(0 0% 0% / 0.25), 0 12px 32px hsl(0 0% 0% / 0.35); outline: 1px solid hsl(0 0% 100% / 0.08); }
    @media print {
      .resume-pages { gap: 0; }
      .resume-document { box-shadow: none; margin: 0; break-after: page; }
      .resume-document:last-child { break-after: auto; }
    }
    .resume-pages h1, .resume-pages h2, .resume-pages h3 { font-family: var(--rd-heading-family), system-ui, sans-serif; }
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