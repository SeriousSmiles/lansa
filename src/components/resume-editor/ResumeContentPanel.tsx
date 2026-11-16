import { PDFResumeData } from '@/types/pdf';
import { DesignTokens, ResumeSectionKey } from '@/types/designTokens';
import { SECTION_KEYS } from '@/lib/resumeDocumentModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: PDFResumeData;
  tokens: DesignTokens;
  onDataChange: (data: PDFResumeData) => void;
  onTokensChange: (tokens: DesignTokens) => void;
}

export function ResumeContentPanel({ data, tokens, onDataChange, onTokensChange }: Props) {
  const personal = (key: keyof PDFResumeData['personalInfo'], value: string) => onDataChange({ ...data, personalInfo: { ...data.personalInfo, [key]: value } });
  const setEntries = (key: Exclude<ResumeSectionKey, 'summary'>, entries: unknown[]) => onDataChange({ ...data, [key]: entries } as PDFResumeData);
  const order = [...tokens.sectionOrder, ...SECTION_KEYS.filter(k => !tokens.sectionOrder.includes(k))];
  const toggle = (key: ResumeSectionKey, checked: boolean) => onTokensChange({ ...tokens, sectionOrder: checked ? [...tokens.sectionOrder, key] : tokens.sectionOrder.filter(k => k !== key) });
  const move = (key: ResumeSectionKey, direction: number) => {
    const next = [...tokens.sectionOrder]; const i = next.indexOf(key); const target = i + direction;
    if (i < 0 || target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onTokensChange({ ...tokens, sectionOrder: next });
  };
  return <div className="space-y-6 p-4">
    <h2 className="text-lg font-semibold">Resume content</h2>
    <section className="space-y-3 border-b border-border pb-5">
      <h3 className="font-semibold">Contact details</h3>
      {(['name', 'title', 'email', 'phone', 'location'] as const).map(key => <Field key={key} label={key === 'title' ? 'Professional title' : key} value={data.personalInfo[key] ?? ''} onChange={v => personal(key, v)} />)}
    </section>
    {order.map(key => {
      const visible = tokens.sectionOrder.includes(key);
      const entries = key === 'summary' ? [] : data[key] ?? [];
      const update = (index: number, field: string, value: string) => setEntries(key as Exclude<ResumeSectionKey, 'summary'>, entries.map((e, i) => i !== index ? e : key === 'skills' ? value : { ...(e as object), [field]: field === 'startYear' || field === 'endYear' ? (value ? Number(value) : undefined) : value }));
      return <section key={key} className="space-y-3 border-b border-border pb-5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`visible-${key}`} className="font-semibold capitalize">{key}</Label>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${key} up`} disabled={!visible || tokens.sectionOrder.indexOf(key) === 0} onClick={() => move(key, -1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${key} down`} disabled={!visible || tokens.sectionOrder.indexOf(key) === tokens.sectionOrder.length - 1} onClick={() => move(key, 1)}><ArrowDown className="h-4 w-4" /></Button>
            <Switch id={`visible-${key}`} checked={visible} onCheckedChange={v => toggle(key, v)} />
          </div>
        </div>
        {visible && (key === 'summary' ? <>
          <Field label="Summary" value={data.personalInfo.summary} multiline onChange={v => personal('summary', v)} />
          <Field label="Professional goal" value={data.personalInfo.professionalGoal} multiline onChange={v => personal('professionalGoal', v)} />
        </> : <>
          {entries.map((entry, index) => {
            const obj = typeof entry === 'string' ? { skill: entry } : entry as unknown as Record<string, unknown>;
            const fields = key === 'skills' ? ['skill'] : key === 'languages' ? ['name'] : key === 'experience' || key === 'education' ? ['title', 'description', 'startYear', 'endYear'] : key === 'certifications' || key === 'awards' ? ['title', 'issuer', 'date'] : key === 'volunteer' ? ['title', 'organization', 'description'] : ['title', 'description'];
            return <div key={index} className="space-y-2 border-l-2 border-secondary/30 pl-3">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{index + 1}</span><Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove ${key} ${index + 1}`} onClick={() => setEntries(key, entries.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>
              {fields.map(field => <Field key={field} label={`${key} ${index + 1} ${field === 'startYear' ? 'start year' : field === 'endYear' ? 'end year' : field}`} value={String(obj[field] ?? '')} multiline={field === 'description'} onChange={v => update(index, field, v)} />)}
            </div>;
          })}
          <Button variant="outline" size="sm" className="w-full" onClick={() => {
            const entry = key === 'skills' ? '' : key === 'languages' ? { name: '', level: 3 } : key === 'certifications' || key === 'awards' ? { title: '', issuer: '' } : key === 'achievements' ? { title: '', description: '', type: 'work' } : { title: '', description: '', ...(key === 'volunteer' ? { organization: '' } : {}) };
            setEntries(key, [...entries, entry]);
          }}><Plus className="mr-2 h-4 w-4" />Add {key === 'skills' ? 'skill' : key === 'languages' ? 'language' : 'entry'}</Button>
        </>)}
      </section>;
    })}
  </div>;
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return <div className="space-y-1"><Label className="text-xs capitalize" htmlFor={`resume-${label}`}>{label}</Label>{multiline ? <Textarea id={`resume-${label}`} value={value} onChange={e => onChange(e.target.value)} rows={4} /> : <Input id={`resume-${label}`} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}