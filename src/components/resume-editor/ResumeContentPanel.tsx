import { Link } from 'react-router-dom';
import { PDFResumeData } from '@/types/pdf';
import { DesignTokens, ResumeSectionKey } from '@/types/designTokens';
import { SECTION_KEYS } from '@/lib/resumeDocumentModel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowDown, ArrowUp, UserPen } from 'lucide-react';

interface Props {
  data: PDFResumeData;
  tokens: DesignTokens;
  onTokensChange: (tokens: DesignTokens) => void;
}

/** Content is read-only here: it always comes from the profile builder so the resume never drifts out of sync. */
export function ResumeContentPanel({ data, tokens, onTokensChange }: Props) {
  const order = [...tokens.sectionOrder, ...SECTION_KEYS.filter(k => !tokens.sectionOrder.includes(k))];
  const toggle = (key: ResumeSectionKey, checked: boolean) => onTokensChange({ ...tokens, sectionOrder: checked ? [...tokens.sectionOrder, key] : tokens.sectionOrder.filter(k => k !== key) });
  const move = (key: ResumeSectionKey, direction: number) => {
    const next = [...tokens.sectionOrder]; const i = next.indexOf(key); const target = i + direction;
    if (i < 0 || target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onTokensChange({ ...tokens, sectionOrder: next });
  };
  const count = (key: ResumeSectionKey) => key === 'summary' ? (data.personalInfo.summary ? 1 : 0) : (data[key]?.length ?? 0);
  return <div className="space-y-5 p-4">
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Sections</h2>
      <p className="text-sm text-muted-foreground">Your resume content comes from your profile, so it always stays in sync. Choose which sections to show and their order.</p>
      <Button asChild variant="outline" size="sm" className="w-full"><Link to="/profile"><UserPen className="mr-2 h-4 w-4" />Edit content in profile</Link></Button>
    </div>
    <div className="divide-y divide-border rounded-lg border border-border">
      {order.map(key => {
        const visible = tokens.sectionOrder.includes(key);
        const n = count(key);
        return <div key={key} className="flex items-center justify-between gap-2 px-3 py-2">
          <Label htmlFor={`visible-${key}`} className="min-w-0 truncate capitalize">{key} <span className="text-xs font-normal text-muted-foreground">({n})</span></Label>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${key} up`} disabled={!visible || tokens.sectionOrder.indexOf(key) === 0} onClick={() => move(key, -1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${key} down`} disabled={!visible || tokens.sectionOrder.indexOf(key) === tokens.sectionOrder.length - 1} onClick={() => move(key, 1)}><ArrowDown className="h-4 w-4" /></Button>
            <Switch id={`visible-${key}`} checked={visible} onCheckedChange={v => toggle(key, v)} />
          </div>
        </div>;
      })}
    </div>
  </div>;
}
