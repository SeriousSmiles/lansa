import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Circle,
  Path,
  Line,
  Rect,
  G,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CertificateDocProps {
  candidateName: string;
  sector: string;           // 'office' | 'service' | 'technical' | 'digital'
  level: string;            // 'standard' | 'high_performer'
  totalScore: number;
  categoryScores: Record<string, number>;
  aiSummary?: string;
  dateIssued: string;       // ISO string
  verificationCode: string;
}

// ─── Color Palettes ───────────────────────────────────────────────────────────
const GOLD = {
  primary: '#B8860B',
  light: '#DAA520',
  pale: '#FFF8DC',
  accent: '#FFD700',
  dark: '#8B6914',
};

const PURPLE = {
  primary: '#5B2D8E',
  light: '#7C4DAD',
  pale: '#F3E8FF',
  accent: '#9B59D0',
  dark: '#3D1A6E',
};

const DARK = '#1A1A2E';
const DARK2 = '#16213E';
const OFF_WHITE = '#FAFAF7';
const MUTED = '#6B7280';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getColors(level: string) {
  return level === 'high_performer' ? PURPLE : GOLD;
}

function formatSector(sector: string) {
  return sector.charAt(0).toUpperCase() + sector.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function clamp(v: number) {
  return Math.min(100, Math.max(0, v));
}

const CATEGORY_LABELS: Record<string, string> = {
  mindset: 'Mindset',
  workplace_intelligence: 'Workplace IQ',
  performance_habits: 'Performance',
  applied_thinking: 'Applied Thinking',
};

// ─── SVG Seal Badge ───────────────────────────────────────────────────────────
// Tick marks computed as path data (no loops at render time — pre-computed)
function buildTickPaths(cx: number, cy: number, r1: number, r2: number, count: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 360) / count;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + r1 * Math.cos(rad);
    const y1 = cy + r1 * Math.sin(rad);
    const x2 = cx + r2 * Math.cos(rad);
    const y2 = cy + r2 * Math.sin(rad);
    paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
  }
  return paths;
}

// Diamond shape at top of seal
function diamondPath(cx: number, cy: number, size: number) {
  return `M ${cx} ${cy - size} L ${cx + size * 0.6} ${cy} L ${cx} ${cy + size} L ${cx - size * 0.6} ${cy} Z`;
}

// Checkmark path
function checkmarkPath(cx: number, cy: number, size: number) {
  const s = size * 0.35;
  return `M ${cx - s} ${cy} L ${cx - s * 0.2} ${cy + s * 0.7} L ${cx + s} ${cy - s * 0.7}`;
}

interface SealProps {
  level: string;
  sector: string;
  score: number;
}

function LansaSeal({ level, sector, score }: SealProps) {
  const C = getColors(level);
  const cx = 85;
  const cy = 85;
  const outerR = 78;
  const middleR = 65;
  const innerR = 52;
  const textR = 42;

  // 24 major ticks + 48 minor ticks
  const majorTicks = buildTickPaths(cx, cy, outerR - 8, outerR, 24);
  const minorTicks = buildTickPaths(cx, cy, outerR - 4, outerR, 48);

  const sectorLabel = formatSector(sector).toUpperCase();
  const levelLabel = level === 'high_performer' ? 'HIGH PERFORMER' : 'CERTIFIED';

  return (
    <Svg width={170} height={170} viewBox="0 0 170 170">
      {/* Outer glow ring */}
      <Circle cx={cx} cy={cy} r={outerR + 2} fill="none" stroke={C.pale} strokeWidth={4} />

      {/* Minor ticks */}
      {minorTicks.map((d, i) => (
        <Path key={`mt-${i}`} d={d} stroke={C.light} strokeWidth={0.5} strokeOpacity={0.4} />
      ))}

      {/* Major ticks */}
      {majorTicks.map((d, i) => (
        <Path key={`Mt-${i}`} d={d} stroke={C.primary} strokeWidth={1.2} />
      ))}

      {/* Outer ring */}
      <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={C.primary} strokeWidth={1.5} />

      {/* Middle decorative ring */}
      <Circle cx={cx} cy={cy} r={middleR} fill="none" stroke={C.light} strokeWidth={0.8} strokeDasharray="3 2" />

      {/* Inner filled circle */}
      <Circle cx={cx} cy={cy} r={innerR} fill={C.pale} stroke={C.primary} strokeWidth={1.2} />

      {/* Second inner ring for depth */}
      <Circle cx={cx} cy={cy} r={innerR - 6} fill="none" stroke={C.primary} strokeWidth={0.5} strokeOpacity={0.4} />

      {/* LANSA wordmark */}
      <G>
        <Text
          x={cx}
          y={cy - 8}
          style={{ fontSize: 13, fontWeight: 'bold', fill: C.dark, textAnchor: 'middle', fontFamily: 'Helvetica-Bold' } as any}
        >
          LANSA
        </Text>
      </G>

      {/* Score */}
      <G>
        <Text
          x={cx}
          y={cy + 10}
          style={{ fontSize: 18, fontWeight: 'bold', fill: C.primary, textAnchor: 'middle', fontFamily: 'Helvetica-Bold' } as any}
        >
          {score}%
        </Text>
      </G>

      {/* Sector label */}
      <G>
        <Text
          x={cx}
          y={cy + 26}
          style={{ fontSize: 6.5, fill: C.dark, textAnchor: 'middle', fontFamily: 'Helvetica', letterSpacing: 1.5 } as any}
        >
          {sectorLabel} SECTOR
        </Text>
      </G>

      {/* Level badge text at bottom of seal */}
      <G>
        <Rect
          x={cx - 28}
          y={cy + 33}
          width={56}
          height={11}
          rx={5}
          fill={C.primary}
        />
        <Text
          x={cx}
          y={cy + 41}
          style={{ fontSize: 5.5, fill: '#FFFFFF', textAnchor: 'middle', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8 } as any}
        >
          {levelLabel}
        </Text>
      </G>

      {/* Diamond accent at top */}
      <Path d={diamondPath(cx, cy - outerR - 6, 5)} fill={C.accent} stroke={C.primary} strokeWidth={0.5} />

      {/* Diamond accents at sides */}
      <Path d={diamondPath(cx - outerR - 6, cy, 3.5)} fill={C.accent} stroke={C.primary} strokeWidth={0.5} />
      <Path d={diamondPath(cx + outerR + 6, cy, 3.5)} fill={C.accent} stroke={C.primary} strokeWidth={0.5} />

      {/* Bottom diamond */}
      <Path d={diamondPath(cx, cy + outerR + 6, 3.5)} fill={C.accent} stroke={C.primary} strokeWidth={0.5} />
    </Svg>
  );
}

// ─── Category Score Bar ───────────────────────────────────────────────────────
interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
  width: number;
}

function ScoreBar({ label, score, color, width }: ScoreBarProps) {
  const barWidth = width - 90;
  const filled = (clamp(score) / 100) * barWidth;

  return (
    <View style={{ marginBottom: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
        <Text style={{ fontSize: 8, color: MUTED, width: 90, fontFamily: 'Helvetica' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 8, color: DARK, fontFamily: 'Helvetica-Bold', marginLeft: 4 }}>
          {score}%
        </Text>
      </View>
      <View style={{ flexDirection: 'row', height: 5, width: barWidth, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
        <View style={{ width: filled, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: OFF_WHITE,
    fontFamily: 'Helvetica',
  },
  // LEFT PANEL
  leftPanel: {
    width: 210,
    backgroundColor: DARK,
    padding: 28,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTop: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 3,
    marginBottom: 20,
    fontFamily: 'Helvetica',
  },
  // RIGHT PANEL
  rightPanel: {
    flex: 1,
    padding: 40,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  // Certificate header
  certifiesText: {
    fontSize: 11,
    color: MUTED,
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Helvetica',
  },
  candidateName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  divider: {
    height: 2,
    width: 60,
    marginVertical: 10,
  },
  hasCompletedText: {
    fontSize: 10,
    color: MUTED,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'Helvetica',
  },
  certTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  // AI Summary
  summaryText: {
    fontSize: 9.5,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 1.6,
    marginTop: 6,
    fontFamily: 'Helvetica',
  },
  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLabel: {
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 1,
    fontFamily: 'Helvetica',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 8.5,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
  },
  verifyUrl: {
    fontSize: 7.5,
    color: MUTED,
    fontFamily: 'Helvetica',
  },
  // Left panel stat
  statLabel: {
    fontSize: 7,
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    marginTop: 14,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  statDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statText: {
    fontSize: 8,
    color: '#D1D5DB',
    fontFamily: 'Helvetica',
  },
  accentLine: {
    height: 3,
    width: 30,
    borderRadius: 2,
    marginVertical: 8,
  },
});

// ─── Main Document ────────────────────────────────────────────────────────────
export default function CertificateDoc({
  candidateName,
  sector,
  level,
  totalScore,
  categoryScores,
  aiSummary,
  dateIssued,
  verificationCode,
}: CertificateDocProps) {
  const C = getColors(level);
  const sectorUpper = `${formatSector(sector)} SECTOR PROFESSIONAL CERTIFICATION`;
  const levelDisplay = level === 'high_performer' ? 'High Performer' : 'Certified';
  const truncatedSummary = aiSummary ? aiSummary.slice(0, 220) : null;

  // Build category score bars from the known categories
  const knownCategories = ['mindset', 'workplace_intelligence', 'performance_habits', 'applied_thinking'];
  const scoreBars = knownCategories
    .filter(k => categoryScores[k] !== undefined)
    .map(k => ({
      label: CATEGORY_LABELS[k] || k,
      score: Math.round(categoryScores[k]),
    }));

  // If category keys don't match, try any available
  const fallbackBars = Object.entries(categoryScores).slice(0, 4).map(([k, v]) => ({
    label: CATEGORY_LABELS[k] || k.replace(/_/g, ' '),
    score: Math.round(v),
  }));

  const bars = scoreBars.length > 0 ? scoreBars : fallbackBars;

  return (
    <Document title={`Lansa Certificate — ${candidateName}`} author="Lansa">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── LEFT PANEL ── */}
        <View style={styles.leftPanel}>
          <View style={styles.leftTop}>
            <Text style={styles.brandName}>LANSA</Text>

            {/* SVG Seal */}
            <LansaSeal level={level} sector={sector} score={totalScore} />

            <Text style={styles.statLabel}>PERFORMANCE LEVEL</Text>

            {/* Accent line */}
            <View style={[styles.accentLine, { backgroundColor: C.accent }]} />

            {/* Level display */}
            <View style={[styles.statRow, { justifyContent: 'center' }]}>
              <View style={[styles.statDot, { backgroundColor: C.accent }]} />
              <Text style={[styles.statText, { fontSize: 9, color: C.light }]}>
                {levelDisplay.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.statRow, { justifyContent: 'center', marginTop: 4 }]}>
              <View style={[styles.statDot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.statText}>{formatSector(sector)} Sector</Text>
            </View>
          </View>

          {/* Bottom left — verify code */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 6.5, color: '#6B7280', letterSpacing: 0.8, textAlign: 'center', fontFamily: 'Helvetica' }}>
              VERIFICATION CODE
            </Text>
            <Text style={{ fontSize: 8, color: '#D1D5DB', fontFamily: 'Helvetica-Bold', marginTop: 2, letterSpacing: 1.5 }}>
              {verificationCode}
            </Text>
          </View>
        </View>

        {/* ── RIGHT PANEL ── */}
        <View style={styles.rightPanel}>
          {/* Header */}
          <View>
            <Text style={styles.certifiesText}>THIS CERTIFIES THAT</Text>
            <Text style={styles.candidateName}>{candidateName}</Text>
            <View style={[styles.divider, { backgroundColor: C.primary }]} />
            <Text style={styles.hasCompletedText}>HAS SUCCESSFULLY COMPLETED</Text>
            <Text style={styles.certTitle}>{sectorUpper}</Text>
          </View>

          {/* Category Scores */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 8, color: MUTED, letterSpacing: 1.5, marginBottom: 10, fontFamily: 'Helvetica' }}>
              CATEGORY PERFORMANCE
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {bars.map((b, i) => (
                <View key={i} style={{ width: '47%' }}>
                  <ScoreBar
                    label={b.label}
                    score={b.score}
                    color={C.primary}
                    width={270}
                  />
                </View>
              ))}
            </View>

            {/* AI Summary */}
            {truncatedSummary && (
              <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <Text style={styles.summaryText}>"{truncatedSummary}"</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>DATE ISSUED</Text>
              <Text style={styles.footerValue}>{formatDate(dateIssued)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              {/* Decorative seal line */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 30, height: 1, backgroundColor: C.primary }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
                <View style={{ width: 30, height: 1, backgroundColor: C.primary }} />
              </View>
              <Text style={{ fontSize: 7, color: MUTED, marginTop: 4, fontFamily: 'Helvetica', letterSpacing: 0.5 }}>
                Issued by Lansa Professional Certification
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>VERIFY AT</Text>
              <Text style={styles.footerValue}>lansa.online/verify/{verificationCode}</Text>
              <Text style={[styles.verifyUrl, { marginTop: 2 }]}>
                lansa.online
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
