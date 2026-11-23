import { useState, useEffect, useRef, useCallback } from 'react';
import { animate, motion, useMotionValue, useTransform, useReducedMotion, type PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ArrowLeft, Undo2, RefreshCw, Users, AlertCircle, BadgeCheck } from 'lucide-react';
import { EnhancedCandidateCard } from './EnhancedCandidateCard';
import { CandidateDetailSheet } from './CandidateDetailSheet';
import { MatchCelebration } from './MatchCelebration';
import { FilterDrawer } from './MobileFilterModal';
import { CandidateActions } from './CandidateActions';
import { mobileUtils } from '@/utils/mobileAnimations';
import type { DiscoveryProfile } from '@/services/discoveryService';
import { candidateDiscoveryService, type CandidateFilters } from '@/services/candidateDiscoveryService';
import { swipeService, type SwipeDirection } from '@/services/swipeService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ActionGate, initialDeck, receiveProfiles, commitDecision, restorePassed, type DeckState } from './mobileDiscoveryModel';

interface MobileCandidateBrowserProps { userId: string; onBack: () => void; initialFilters?: CandidateFilters; employerName?: string; employerAvatar?: string }
export function MobileCandidateBrowser({ userId, onBack, initialFilters = {}, employerName, employerAvatar }: MobileCandidateBrowserProps) {
  const navigate = useNavigate();
  const [deck, setDeck] = useState(initialDeck);
  const deckRef = useRef(deck);
  const gate = useRef(new ActionGate());
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [matchCandidate, setMatchCandidate] = useState<DiscoveryProfile | null>(null);
  const [messaging, setMessaging] = useState(false);
  const requestId = useRef(0);
  const alive = useRef(true);
  const x = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const rotate = useTransform(x, [-240, 0, 240], reducedMotion ? [0, 0, 0] : [-12, 0, 12]);
  const currentProfile = deck.profiles[0];
  const nextProfile = deck.profiles[1];
  const updateDeck = (state: DeckState) => { deckRef.current = state; setDeck(state); };

  const loadCandidates = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true); setFetchError(false); setActionError('');
    try {
      const profiles = await candidateDiscoveryService.getFilteredCandidates(userId, filters, 20);
      if (!alive.current || id !== requestId.current) return;
      const state = receiveProfiles(deckRef.current, profiles);
      deckRef.current = state; setDeck(state);
    } catch {
      if (alive.current && id === requestId.current) setFetchError(true);
    } finally {
      if (alive.current && id === requestId.current) setIsLoading(false);
    }
  }, [userId, filters]);
  useEffect(() => { alive.current = true; void loadCandidates(); return () => { alive.current = false; }; }, [loadCandidates]);

  const resetMotion = async () => {
    await animate(x, 0, { type: 'spring', stiffness: 400, damping: 30, duration: reducedMotion ? 0 : undefined });
    setSwipeDir(null); setSwipeProgress(0);
  };
  const handleAction = async (direction: SwipeDirection) => {
    if (!currentProfile || isLoading || matchCandidate) return;
    await gate.current.run(async () => {
      const candidate = currentProfile;
      setBusy(true); setActionError('');
      let persisted = false;
      try {
        // Use the existing insert pathway, but do not advance on a refused/duplicate write.
        const swipe = await swipeService.recordSwipe({ swiper_user_id: userId, target_user_id: candidate.user_id, direction, context: 'employee' });
        if (!swipe?.id) throw new Error('Action was not confirmed');
        persisted = true;
        const match = direction === 'left' ? null : await swipeService.checkForMatch(userId, candidate.user_id, 'employee');
        if (!alive.current) return;
        mobileUtils.hapticFeedback('light');
        setDetailOpen(false);
        if (direction !== 'nudge') { setSwipeDir(direction); setSwipeProgress(1); }
        await animate(x, direction === 'left' ? -550 : direction === 'right' ? 550 : 0, { duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' });
        if (!alive.current) return;
        const state = commitDecision(deckRef.current, candidate, direction, swipe.id);
        updateDeck(state); x.set(0); setSwipeDir(null); setSwipeProgress(0);
        if (match) setMatchCandidate(candidate);
        if (!state.profiles.length) void loadCandidates();
      } catch {
        if (alive.current) {
          setActionError(persisted ? 'Your decision was saved. Refresh to continue.' : 'Your decision wasn’t saved. Please try again.');
          await resetMotion();
        }
      } finally { if (alive.current) setBusy(false); }
    });
  };
  const handleUndo = async () => {
    const undo = deckRef.current.undo;
    if (!undo || isLoading) return;
    await gate.current.run(async () => {
      setBusy(true); setActionError('');
      try {
        // Delete ONLY the confirmed pass, never whichever swipe happens to be newest.
        const { data, error } = await supabase.from('swipes').delete().eq('id', undo.swipeId).eq('swiper_user_id', userId).eq('target_user_id', undo.profile.user_id).eq('context', 'employee').eq('direction', 'left').select('id');
        if (error || !data?.length) throw error || new Error('Pass could not be undone');
        if (!alive.current) return;
        updateDeck(restorePassed(deckRef.current)); x.set(0); mobileUtils.hapticFeedback('light');
      } catch { if (alive.current) setActionError('That pass couldn’t be undone. Please try again.'); }
      finally { if (alive.current) setBusy(false); }
    });
  };
  const sendMessage = async () => {
    if (!matchCandidate || messaging) return;
    setMessaging(true); setActionError('');
    try {
      const { data, error } = await supabase.from('chat_threads').select('id').contains('participant_ids', [userId, matchCandidate.user_id]).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      navigate(data?.id ? `/chat/${data.id}` : '/chat');
    } catch { setActionError('Couldn’t open the conversation. Try again from Inbox.'); }
    finally { setMessaging(false); }
  };
  const onDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setSwipeDir(info.offset.x > 8 ? 'right' : info.offset.x < -8 ? 'left' : null);
    setSwipeProgress(Math.min(Math.abs(info.offset.x) / 100, 1));
  };
  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80 || (Math.abs(info.offset.x) > 25 && Math.abs(info.velocity.x) > 550)) void handleAction(info.offset.x > 0 ? 'right' : 'left');
    else void resetMotion();
  };

  return <div className="discovery-browser">
    <header className="discovery-header">
      <Button variant="ghost" size="icon" aria-label="Open hiring workspace" className="h-11 w-11 shrink-0" onClick={onBack} disabled={busy}><ArrowLeft size={21} /></Button>
      <div className="min-w-0 flex-1"><h1 className="text-2xl font-black">Discover</h1><p className="text-xs text-muted-foreground truncate">{employerName || 'Your next great hire'}</p></div>
      <Button variant="ghost" size="icon" aria-label="Refresh candidates" className="h-11 w-11 shrink-0" onClick={() => void loadCandidates()} disabled={busy || isLoading}><RefreshCw size={19} className={isLoading ? 'animate-spin' : ''} /></Button>
      <FilterDrawer filters={filters} onApply={setFilters} disabled={busy || isLoading}><Button variant="ghost" size="icon" aria-label={`Filter candidates${filters.skills?.length ? ', active filters' : ''}`} disabled={busy || isLoading} className="h-11 w-11 shrink-0 relative"><SlidersHorizontal size={22} />{Boolean(filters.skills?.length) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}</Button></FilterDrawer>
    </header>
    <div className="flex items-center justify-between px-4 h-9 shrink-0"><p className="text-xs text-primary font-semibold flex gap-1.5 items-center"><BadgeCheck size={14} />Certified talent</p><Button variant="ghost" className="h-9 gap-1.5 px-2 text-xs" disabled={!deck.undo || busy || isLoading} onClick={() => void handleUndo()}><Undo2 size={15} />Undo pass</Button></div>
    <main className="discovery-deck" aria-busy={isLoading || busy}>
      {isLoading ? <div className="discovery-loading" role="status"><div className="h-20 w-20 rounded-full bg-primary/10 animate-pulse" /><div className="mt-auto space-y-3"><div className="h-8 w-3/4 bg-primary/10 rounded animate-pulse" /><div className="h-20 bg-primary/10 rounded-lg animate-pulse" /><p className="text-sm text-muted-foreground">Finding certified talent…</p></div></div>
        : fetchError ? <div className="discovery-state" role="alert"><AlertCircle size={40} className="text-primary" /><h2>Couldn’t load candidates</h2><p>Your connection may have interrupted discovery.</p><Button variant="outline" className="h-12 gap-2" onClick={() => void loadCandidates()}><RefreshCw size={18} />Try again</Button></div>
        : !currentProfile ? <div className="discovery-state"><Users size={42} className="text-primary" /><h2>{filters.skills?.length ? 'No candidates with these skills' : 'You’re all caught up'}</h2><p>{filters.skills?.length ? 'Try different skills or reset your filters.' : 'You’ve reviewed the available certified talent. Check back for new people.'}</p><FilterDrawer filters={filters} onApply={setFilters}><Button variant="outline" className="h-12 gap-2"><SlidersHorizontal size={18} />Change filters</Button></FilterDrawer>{Boolean(filters.skills?.length) && <Button variant="ghost" className="h-11" onClick={() => setFilters({})}>Reset filters</Button>}<Button variant="ghost" className="h-11" onClick={() => navigate('/chat')}>Open Inbox</Button></div>
        : <>{nextProfile && <EnhancedCandidateCard key={nextProfile.user_id} profile={nextProfile} stackPosition={1} />}
          <motion.div key={currentProfile.user_id} className="discovery-front" style={{ x, rotate, touchAction: 'pan-y' }} drag={busy || detailOpen || Boolean(matchCandidate) ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={1} dragMomentum={false} onDrag={onDrag} onDragEnd={onDragEnd}>
            <EnhancedCandidateCard profile={currentProfile} disabled={busy} swipeDirection={swipeDir} swipeProgress={swipeProgress} onTapExpand={() => { if (!gate.current.busy && swipeProgress < 0.1) setDetailOpen(true); }} />
          </motion.div></>}
    </main>
    <div className="discovery-feedback" role={actionError ? 'alert' : 'status'} aria-live="polite">{actionError || (busy ? 'Saving your decision…' : '')}</div>
    <CandidateActions onAction={direction => void handleAction(direction)} disabled={!currentProfile || busy || isLoading || fetchError || Boolean(matchCandidate)} />
    <CandidateDetailSheet open={detailOpen} onOpenChange={setDetailOpen} profile={currentProfile || null} userId={userId} disabled={busy} onAction={direction => void handleAction(direction)} />
    {matchCandidate && <MatchCelebration candidate={matchCandidate} employerAvatar={employerAvatar} employerName={employerName} messaging={messaging} error={actionError} onSendMessage={() => void sendMessage()} onKeepBrowsing={() => { setMatchCandidate(null); setActionError(''); }} />}
  </div>;
}
