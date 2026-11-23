import { useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, SlidersHorizontal, BadgeCheck } from 'lucide-react';
import type { CandidateFilters } from '@/services/candidateDiscoveryService';

interface FilterDrawerProps { filters: CandidateFilters; onApply: (filters: CandidateFilters) => void; children?: React.ReactNode; disabled?: boolean }
export function FilterDrawer({ filters, onApply, children, disabled }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>(filters.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const addSkill = () => {
    const value = newSkill.trim();
    if (value && !skills.some(s => s.toLowerCase() === value.toLowerCase())) setSkills(prev => [...prev, value]);
    setNewSkill('');
  };
  return <Drawer open={open} onOpenChange={value => { if (disabled && value) return; setOpen(value); if (value) { setSkills(filters.skills || []); setNewSkill(''); } }} shouldScaleBackground={false}>
    <DrawerTrigger asChild>{children || <Button variant="ghost" aria-label="Filter candidates" disabled={disabled}><SlidersHorizontal size={20} /></Button>}</DrawerTrigger>
    <DrawerContent className="employer-theme discovery-sheet">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border">
        <DrawerTitle className="text-xl">Find your next hire</DrawerTitle>
        <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Close filters" onClick={() => setOpen(false)}><X size={22} /></Button>
      </div>
      <DrawerDescription className="sr-only">Filter certified candidates by skills listed on their professional profile.</DrawerDescription>
      <div className="p-5 min-h-0 overflow-y-auto space-y-6">
        <p className="flex items-center gap-2 text-sm text-primary"><BadgeCheck size={18} />Lansa-certified talent</p>
        <div><Label htmlFor="candidate-skill">Skills</Label><form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); addSkill(); }}>
          <Input id="candidate-skill" placeholder="Add a professional skill" value={newSkill} onChange={e => setNewSkill(e.target.value)} className="h-12 min-w-0" />
          <Button type="submit" variant="outline" aria-label="Add skill filter" disabled={!newSkill.trim()} className="h-12 w-12 shrink-0 p-0"><Plus size={20} /></Button>
        </form>
        <div className="flex flex-wrap gap-2 mt-3">{skills.map(skill => <Button key={skill} variant="outline" className="h-11 gap-2 px-3" aria-label={`Remove ${skill} filter`} onClick={() => setSkills(prev => prev.filter(s => s !== skill))}>{skill}<X size={14} /></Button>)}</div></div>
      </div>
      <div className="discovery-sheet-footer flex gap-3">
        <Button variant="outline" className="flex-1 h-12" onClick={() => { onApply({}); setOpen(false); }}>Reset</Button>
        <Button variant="outline" className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" onClick={() => { onApply(skills.length ? { skills } : {}); setOpen(false); }}>Show candidates</Button>
      </div>
    </DrawerContent>
  </Drawer>;
}
export { FilterDrawer as FilterModal };
