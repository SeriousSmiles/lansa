import { useCallback, useEffect, useRef, useState } from 'react';
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

const LEFT_MIN = 240, LEFT_MAX = 480, RIGHT_MIN = 280, RIGHT_MAX = 520;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Props { profileData: ProfileDataReturn; resumeDesignId?: string }
export function ResumeEditorLayout({ profileData, resumeDesignId }: Props) {
  const { user } = useAuth();
  const { currentDesign, loading, saveDesign } = useResumeDesign(user?.id);
  const [snapshot, setSnapshot] = useState<ResumeSnapshot>(() => ({ tokens: constrainDesign(getTemplatePreset('professional')), data: convertProfileToPDFData(profileData) }));
  const [past, setPast] = useState<ResumeSnapshot[]>([]);
  const [future, setFuture] = useState<ResumeSnapshot[]>([]);
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth >= 1024);
  const [rightOpen, setRightOpen] = useState(() => window.innerWidth >= 1024);
  const [leftWidth, setLeftWidth] = useState(() => clamp(Math.round(window.innerWidth * 0.2), LEFT_MIN, 320));
  const [rightWidth, setRightWidth] = useState(() => clamp(Math.round(window.innerWidth * 0.22), RIGHT_MIN, 352));
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null);
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
    if (saved?.tokens) {
      // Designs saved before version 4 used the old wide page margin (10mm+); reset to the tight default.
      const tokens = (saved.version ?? 0) < 4 ? { ...saved.tokens, spacing: { ...saved.tokens.spacing, pageMarginMm: 5.3 } } : saved.tokens;
      setSnapshot(s => ({ ...s, tokens: constrainDesign(tokens) }));
    }
  }, [loading, currentDesign]);
  // Content always mirrors the profile builder; only the design is saved/restored.
  const profileJson = JSON.stringify(convertProfileToPDFData(profileData));
  useEffect(() => { setSnapshot(s => JSON.stringify(s.data) === profileJson ? s : { ...s, data: JSON.parse(profileJson) }); }, [profileJson]);
  const undo = () => { const previous = past[past.length - 1]; if (!previous) return; setPast(p => p.slice(0, -1)); setFuture(f => [snapshot, ...f]); setSnapshot(previous); setDirty(true); };
  const redo = () => { const next = future[0]; if (!next) return; setFuture(f => f.slice(1)); setPast(p => [...p, snapshot]); setSnapshot(next); setDirty(true); };
  const save = async () => {
    setSaving(true);
    try { await saveDesign({ name: currentDesign?.name ?? 'My resume', design_json: { version: 4, ...snapshot } }, resumeDesignId ?? currentDesign?.id); setDirty(false); }
    finally { setSaving(false); }
  };

  const startDrag = useCallback((side: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(side);
    const startX = e.clientX;
    const startWidth = side === 'left' ? leftWidth : rightWidth;
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      if (side === 'left') setLeftWidth(clamp(startWidth + delta, LEFT_MIN, LEFT_MAX));
      else setRightWidth(clamp(startWidth - delta, RIGHT_MIN, RIGHT_MAX));
    };
    const onUp = () => {
      setDragging(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [leftWidth, rightWidth]);

  const resizeHandle = (side: 'left' | 'right') => (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === 'left' ? 'Resize content panel' : 'Resize design panel'}
      onPointerDown={startDrag(side)}
      className={cn(
        'shrink-0 w-1.5 cursor-col-resize transition-colors hover:bg-primary/40',
        dragging === side ? 'bg-primary/60' : 'bg-transparent'
      )}
    />
  );

  return <div className={cn('h-dvh w-full min-w-0 flex flex-col bg-background', dragging && 'select-none cursor-col-resize')}>
    <EditorToolbar onSave={save} tokens={snapshot.tokens} data={snapshot.data} isSaving={saving} dirty={dirty} onOpenPreview={() => setPreviewOpen(true)} />
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <div className={cn('shrink-0 overflow-y-auto border-r border-border bg-card', !leftOpen && 'w-0 overflow-hidden')} style={leftOpen ? { width: leftWidth } : undefined}>
        {leftOpen && <ResumeContentPanel data={snapshot.data} tokens={snapshot.tokens} onTokensChange={tokens => change({ ...snapshot, tokens })} />}
      </div>
      {leftOpen && resizeHandle('left')}
      <Button variant="ghost" size="icon" className="shrink-0 self-center h-12 w-5 rounded-none border-y border-r border-border bg-card px-0" aria-label={leftOpen ? 'Hide content panel' : 'Show content panel'} onClick={() => setLeftOpen(!leftOpen)}>{leftOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</Button>
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-dashboard-ink/90">
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
      {rightOpen && resizeHandle('right')}
      <div className={cn('shrink-0 overflow-y-auto border-l border-border bg-card', !rightOpen && 'w-0 overflow-hidden')} style={rightOpen ? { width: rightWidth } : undefined}>
        {rightOpen && <div className="p-4 space-y-4"><h2 className="text-lg font-semibold">Design</h2><DesignTokensPanel tokens={snapshot.tokens} onChange={tokens => change({ ...snapshot, tokens })} /></div>}
      </div>
    </div>
    <DocumentPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} data={snapshot.data} tokens={snapshot.tokens} />
  </div>;
}
