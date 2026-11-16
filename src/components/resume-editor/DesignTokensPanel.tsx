/**
 * DesignTokensPanel — Phase 3 personalization UI.
 *
 * Edits the DesignTokens contract that drives both the live <ResumeDocument>
 * preview and the vector export pipeline. Everything visual a user can
 * personalize lives here.
 */

import { useMemo } from 'react';
import {
  DesignTokens,
  FONT_PAIRS,
  Density,
  LayoutKind,
  PhotoShape,
  PaperSize,
  ResumeSectionKey,
} from '@/types/designTokens';
import { TEMPLATE_PRESETS, getTemplatePreset } from '@/config/templatePresets';
import { contrastRatio, contrastGrade } from '@/utils/wcagContrast';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { toRgb } from '@/utils/wcagContrast';

interface Props {
  tokens: DesignTokens;
  onChange: (next: DesignTokens) => void;
}

export function DesignTokensPanel({ tokens, onChange }: Props) {
  const set = <K extends keyof DesignTokens>(k: K, v: DesignTokens[K]) =>
    onChange({ ...tokens, [k]: v });

  const setColor = (k: keyof DesignTokens['colors'], v: string) =>
    onChange({ ...tokens, colors: { ...tokens.colors, [k]: v } });

  const setType = <K extends keyof DesignTokens['typography']>(
    k: K,
    v: DesignTokens['typography'][K]
  ) => onChange({ ...tokens, typography: { ...tokens.typography, [k]: v } });

  const setSpacing = (k: keyof DesignTokens['spacing'], v: number) =>
    onChange({ ...tokens, spacing: { ...tokens.spacing, [k]: v } });

  const setPers = <K extends keyof DesignTokens['personalization']>(
    k: K,
    v: DesignTokens['personalization'][K]
  ) => onChange({ ...tokens, personalization: { ...tokens.personalization, [k]: v } });

  const contrastText = useMemo(
    () => contrastRatio(tokens.colors.text, tokens.colors.surface),
    [tokens.colors.text, tokens.colors.surface]
  );
  const contrastPrimary = useMemo(
    () => contrastRatio(tokens.colors.primary, tokens.colors.surface),
    [tokens.colors.primary, tokens.colors.surface]
  );

  const applyTemplate = (id: string) => onChange({ ...getTemplatePreset(id), paper: tokens.paper, sectionOrder: tokens.sectionOrder });

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...tokens.sectionOrder];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    set('sectionOrder', next as ResumeSectionKey[]);
  };

  return (
    <div className="space-y-4">
      <section className="space-y-3 border-b border-border pb-4">
        <h3 className="font-semibold text-sm">Paper size</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['A4', 'Letter'] as PaperSize[]).map(paper => <Button key={paper} variant={tokens.paper === paper ? 'primary' : 'outline'} onClick={() => set('paper', paper)}>{paper === 'Letter' ? 'US Letter' : 'A4'}</Button>)}
        </div>
        <p className="text-xs text-muted-foreground">{tokens.paper === 'A4' ? '210 × 297 mm' : '8.5 × 11 in'}</p>
      </section>
      {/* Templates */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_PRESETS.map((p) => (
            <Button
              key={p.id}
              variant={tokens.templateId === p.id ? 'primary' : 'outline'}
              size="sm"
              className="min-w-0 justify-start capitalize"
              onClick={() => applyTemplate(p.id)}
            >
              <span className="truncate">{p.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">Typography</h3>

        <div className="space-y-2">
          <Label>Font pair</Label>
          <Select
            value={tokens.typography.pair.id}
            onValueChange={(id) => setType('pair', FONT_PAIRS[id] ?? tokens.typography.pair)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FONT_PAIRS).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.headingFamily} + {p.bodyFamily}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SliderRow
          label="Heading weight"
          value={tokens.typography.headingWeight}
          min={400}
          max={900}
          step={100}
          onChange={(v) => setType('headingWeight', v)}
        />
        <SliderRow
          label="Body weight"
          value={tokens.typography.bodyWeight}
          min={400}
          max={500}
          step={100}
          onChange={(v) => setType('bodyWeight', v)}
        />
        <SliderRow
          label="Heading scale"
          value={tokens.typography.scaleRatio}
          min={1.15}
          max={1.35}
          step={0.01}
          onChange={(v) => setType('scaleRatio', Number(v.toFixed(2)))}
          format={(v) => v.toFixed(2)}
        />
        <SliderRow
          label="Body size (pt)"
          value={tokens.typography.baseSizePt}
          min={10}
          max={12}
          step={0.5}
          onChange={(v) => setType('baseSizePt', v)}
        />
        <SliderRow
          label="Leading"
          value={tokens.typography.leading}
          min={1.3}
          max={1.65}
          step={0.05}
          onChange={(v) => setType('leading', Number(v.toFixed(2)))}
          format={(v) => v.toFixed(2)}
        />
      </Card>

      {/* Color */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Color</h3>
        <ColorRow label="Primary" value={tokens.colors.primary} onChange={(v) => setColor('primary', v)} />
        {(tokens.layout === 'header-strip' || tokens.layout === 'timeline') && <ColorRow label="Secondary" value={tokens.colors.secondary} onChange={(v) => setColor('secondary', v)} />}
        <ColorRow label="Text" value={tokens.colors.text} onChange={(v) => setColor('text', v)} />
        <ColorRow label="Muted" value={tokens.colors.muted} onChange={(v) => setColor('muted', v)} />
        
        {(tokens.layout === 'sidebar-left' || tokens.layout === 'sidebar-right') && <ColorRow
          label="Sidebar"
          value={tokens.colors.sidebar ?? tokens.colors.primary}
          onChange={(v) => setColor('sidebar', v)}
        />}

        <div className="rounded-md border p-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Text vs Surface</span>
            <ContrastBadge ratio={contrastText} />
          </div>
          <div className="flex justify-between">
            <span>Primary vs Surface</span>
            <ContrastBadge ratio={contrastPrimary} />
          </div>
        </div>
      </Card>

      {/* Layout */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Layout</h3>

        <div className="space-y-2">
          <Label>Structure</Label>
          <Select value={tokens.layout} onValueChange={(v) => set('layout', v as LayoutKind)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single-column">Single column (ATS)</SelectItem>
              <SelectItem value="sidebar-left">Sidebar left</SelectItem>
              <SelectItem value="sidebar-right">Sidebar right</SelectItem>
              <SelectItem value="header-strip">Header strip</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Density</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={tokens.density === d ? 'primary' : 'outline'}
                onClick={() => set('density', d)}
                className="capitalize px-1 text-xs"
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        <SliderRow
          label="Content padding (mm)"
          value={tokens.spacing.pageMarginMm}
          min={2}
          max={10}
          step={0.5}
          onChange={(v) => setSpacing('pageMarginMm', v)}
        />
        <SliderRow
          label="Section gap (mm)"
          value={tokens.spacing.sectionGapMm}
          min={3}
          max={10}
          step={1}
          onChange={(v) => setSpacing('sectionGapMm', v)}
        />
      </Card>

      {/* Section order */}
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold text-sm">Section order</h3>
        <ul className="space-y-1">
          {tokens.sectionOrder.map((k, idx) => (
            <li
              key={k}
              className="flex items-center justify-between rounded-md border px-2 py-1 text-sm capitalize"
            >
              <span>{k}</span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, -1)}
                  aria-label={`Move ${k} up`}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={idx === tokens.sectionOrder.length - 1}
                  onClick={() => moveSection(idx, 1)}
                  aria-label={`Move ${k} down`}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Personalization */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Personalization</h3>

        <div className="space-y-2">
          <Label>Photo shape</Label>
          <Select
            value={tokens.personalization.photoShape}
            onValueChange={(v) => setPers('photoShape', v as PhotoShape)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="squircle">Squircle</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="none">No photo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>"Powered by Lansa" badge</Label>
          <Switch
            checked={tokens.personalization.showLansaBadge}
            onCheckedChange={(v) => setPers('showLansaBadge', v)}
          />
        </div>

        <div className="space-y-2">
          <Label>Watermark (optional)</Label>
          <Input
            value={tokens.personalization.watermark ?? ''}
            placeholder="DRAFT"
            onChange={(e) =>
              setPers('watermark', e.target.value.trim() ? e.target.value : undefined)
            }
          />
        </div>
      </Card>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <Label>{label}</Label>
        <span className="text-muted-foreground tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Convert hsl() to a rough hex fallback for the native color input display.
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={isHex ? value : `#${toRgb(value).map(c => c.toString(16).padStart(2, '0')).join('')}`}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 p-1"
        />
        <span className="self-center text-xs text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function ContrastBadge({ ratio }: { ratio: number }) {
  const grade = contrastGrade(ratio);
  const tone =
    grade === 'AAA' || grade === 'AA'
      ? 'default'
      : grade === 'AA Large'
        ? 'secondary'
        : 'destructive';
  return (
    <Badge variant={tone} className="text-[10px]">
      {ratio.toFixed(2)} · {grade}
    </Badge>
  );
}