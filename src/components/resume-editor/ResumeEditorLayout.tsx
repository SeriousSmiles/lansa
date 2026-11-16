import { useEffect, useRef, useState } from 'react';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Undo2, Redo2 } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { ResumeContentPanel } from './ResumeContentPanel';
import { DesignTokensPanel } from './DesignTokensPanel';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTemplatePreset } from '@/config/templatePresets';
import { convertProfileToPDFData } from '@/utils/profileToPDFConverter';
import { constrainDesign, ResumeSnapshot } from '@/lib/resumeDocumentModel';
import { useResumeDesign } from '@/hooks/resume/useResumeDesign';
import { useAuth } from '@/contexts/AuthContext';

interface Props { profileData: ProfileDataReturn; resumeDesignId?: string }
export function ResumeEditorLayout({ profileData, resumeDesignId }: Props) {
  const { user } = useAuth();
  const { currentDesign, loading, saveDesign } = useResumeDesign(user?.id);
  const [snapshot, setSnapshot] = useState<ResumeSnapshot>(() => ({ tokens: constrainDesign(getTemplatePreset('professional')), data: convertProfileToPDFData(profileData) }));
  const [past, setPast] = useState<ResumeSnapshot[]>([]);
  const [future, setFuture] = useState<ResumeSnapshot[]>([]);
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth >= 1024);
  const [rightOpen, setRightOpen] = useState(() => window.innerWidth >= 1024);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [pageCount, setPageCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const restored = useRef(false);
  const change = (next: ResumeSnapshot) => {
    restored.current = true;
    setPast(p => [...p.slice(-49), snapshot]); setFuture([]);
    setSnapshot({ ...next, tokens: constrainDesign(next.tokens) }); setDirty(true);
  };
  useEffect(() => {
    if (loading || restored.current) return;
    restored.current = true;
    const saved = currentDesign?.design_json;
    if (saved?.tokens && saved?.data) setSnapshot({ data: saved.data, tokens: constrainDesign(saved.tokens) });
  }, [loading, currentDesign]);
  const undo = () => { const previous = past[past.length - 1]; if (!previous) return; setPast(p => p.slice(0, -1)); setFuture(f => [snapshot, ...f]); setSnapshot(previous); setDirty(true); };
  const redo = () => { const next = future[0]; if (!next) return; setFuture(f => f.slice(1)); setPast(p => [...p, snapshot]); setSnapshot(next); setDirty(true); };
  const save = async () => {
    setSaving(true);
    try { await saveDesign({ name: currentDesign?.name ?? 'My resume', template_id: snapshot.tokens.templateId, design_json: { version: 2, ...snapshot } }, resumeDesignId ?? currentDesign?.id); setDirty(false); }
    finally { setSaving(false); }
  };
  return <div className="h-dvh w-full min-w-0 flex flex-col bg-background">
    <EditorToolbar onSave={save} tokens={snapshot.tokens} data={snapshot.data} isSaving={saving} dirty={dirty} onOpenPreview={() => setPreviewOpen(true)} />
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <div className={cn('shrink-0 overflow-y-auto border-r border-border bg-card', leftOpen ? 'w-72 xl:w-80' : 'w-0')}>
        {leftOpen && <ResumeContentPanel data={snapshot.data} tokens={snapshot.tokens} onDataChange={data => change({ ...snapshot, data })} onTokensChange={tokens => change({ ...snapshot, tokens })} />}
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 self-center h-12 w-5 rounded-none border-y border-r border-border bg-card px-0" aria-label={leftOpen ? 'Hide content panel' : 'Show content panel'} onClick={() => setLeftOpen(!leftOpen)}>{leftOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</Button>
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-dashboard-blue-surface/30">
        <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-card">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-sm font-medium w-14 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Reset zoom" onClick={() => setZoom(0.75)}><Maximize2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Undo" disabled={!past.length} onClick={undo}><Undo2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Redo" disabled={!future.length} onClick={redo}><Redo2 className="w-4 h-4" /></Button>
          </div>
          <span className="text-xs font-medium text-muted-foreground">{snapshot.tokens.paper} · {pageCount || '…'} {pageCount === 1 ? 'page' : 'pages'}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="flex items-start justify-center w-max min-w-full">
            <div style={{ zoom }} className="shadow-dashboard"><ResumeDocument data={snapshot.data} tokens={snapshot.tokens} onReady={setPageCount} /></div>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 self-center h-12 w-5 rounded-none border-y border-l border-border bg-card px-0" aria-label={rightOpen ? 'Hide design panel' : 'Show design panel'} onClick={() => setRightOpen(!rightOpen)}>{rightOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</Button>
      <div className={cn('shrink-0 overflow-y-auto border-l border-border bg-card', rightOpen ? 'w-80 xl:w-[22rem]' : 'w-0')}>
        {rightOpen && <div className="p-4 space-y-4"><h2 className="text-lg font-semibold">Design</h2><DesignTokensPanel tokens={snapshot.tokens} onChange={tokens => change({ ...snapshot, tokens })} /></div>}
      </div>
    </div>
    <DocumentPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} data={snapshot.data} tokens={snapshot.tokens} />
  </div>;
}
