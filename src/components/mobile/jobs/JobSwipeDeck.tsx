import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { JobListing } from "@/services/jobFeedService";
import { savedJobsService } from "@/services/savedJobsService";
import { prefetchJobAISummary } from "@/hooks/useJobAISummary";
import { JobSwipeCard } from "./JobSwipeCard";
import { SwipeActionBar } from "./SwipeActionBar";
import { Button } from "@/components/ui/button";

interface JobSwipeDeckProps {
  jobs: JobListing[];
  swiperId: string;
  onOpenDetails: (job: JobListing) => void;
  onExhausted?: () => void;
  onRefresh?: () => void;
  onJobSwiped?: (jobId: string, direction: 'left' | 'right') => void;
}

export function JobSwipeDeck({
  jobs,
  swiperId,
  onOpenDetails,
  onExhausted,
  onRefresh,
  onJobSwiped,
}: JobSwipeDeckProps) {
  const [deck, setDeck] = useState<JobListing[]>(jobs);
  const [exitDir, setExitDir] = useState<0 | 1 | -1>(0);
  const [isSettling, setIsSettling] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
  const animating = useRef(false);
  const latestJobs = useRef(jobs);
  const dismissedIds = useRef(new Set<string>());

  const current = deck[0];
  const upcoming = useMemo(() => deck.slice(1, 3), [deck]);

  useEffect(() => {
    latestJobs.current = jobs;
    if (animating.current) return;
    setDeck(jobs.filter((job) => !dismissedIds.current.has(job.id)));
  }, [jobs]);

  // Prefetch summaries for next cards
  useEffect(() => {
    upcoming.forEach((j) => prefetchJobAISummary(j.id));
    if (current) prefetchJobAISummary(current.id);
  }, [current, upcoming]);

  useEffect(() => {
    if (deck.length === 0 && jobs.length > 0) onExhausted?.();
  }, [deck.length, jobs.length, onExhausted]);

  const reconcileDeck = () => {
    setDeck(latestJobs.current.filter((job) => !dismissedIds.current.has(job.id)));
  };

  const commit = (direction: 'left' | 'right') => {
    const swipedJob = current;
    if (!swipedJob || animating.current) return;
    animating.current = true;
    setIsSettling(true);
    setExitDir(direction === 'right' ? 1 : -1);

    dismissedIds.current.add(swipedJob.id);
    window.setTimeout(() => {
      reconcileDeck();
      x.set(0);
      setExitDir(0);
      animating.current = false;
      setIsSettling(false);
    }, 220);

    savedJobsService.recordJobSwipe({ swiperId, job: swipedJob, direction })
      .then(() => {
        onJobSwiped?.(swipedJob.id, direction);
      if (direction === 'right') {
        toast.success("Saved to your Interested list");
      }
      })
      .catch(() => {
        dismissedIds.current.delete(swipedJob.id);
        if (!animating.current) reconcileDeck();
        toast.error("Couldn't record swipe");
      });
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (animating.current) return;
    const dx = info.offset.x;
    const vx = info.velocity.x;
    const threshold = 110;
    if (dx > threshold || vx > 700) commit('right');
    else if (dx < -threshold || vx < -700) commit('left');
  };

  const handleUndo = async () => {
    if (animating.current) return;
    const removed = await savedJobsService.undoLastSwipe(swiperId);
    if (removed) {
      dismissedIds.current.delete(removed);
      reconcileDeck();
      toast("Undone");
    } else {
      toast("Nothing to undo");
    }
  };

  // Keyboard a11y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') commit('left');
      else if (e.key === 'ArrowRight') commit('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <Sparkles className="w-8 h-8 text-primary mb-3" />
        <p className="text-base text-foreground">No opportunities to show right now</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Adjust your filters or check back tomorrow — new roles are added regularly.
        </p>
        {onRefresh && (
          <Button variant="outline" className="mt-4" onClick={onRefresh}>Refresh</Button>
        )}
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <p className="text-base text-foreground">You're all caught up</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          You've reviewed every match. Check the Saved tab to apply, or come back later for more.
        </p>
        {onRefresh && (
          <Button variant="outline" className="mt-4" onClick={onRefresh}>Reload feed</Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col items-center">
      {/* Deck — fills available height so action bar stays pinned without scrolling */}
      <div
        className="relative w-full max-w-[420px] mx-auto flex-1 min-h-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Background cards (peek) */}
        {upcoming.map((j, i) => {
          const depth = i + 1;
          const scale = 1 - depth * 0.04;
          const translateY = depth * 10;
          return (
            <div
              key={j.id}
              className="absolute inset-0"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                zIndex: 10 - depth,
                opacity: 1 - depth * 0.15,
              }}
            >
              <JobSwipeCard job={j} depth={depth} />
            </div>
          );
        })}

        {/* Active card */}
        <AnimatePresence>
          <motion.div
            key={current.id}
            className="absolute inset-0"
            style={{ x, rotate, zIndex: 20, touchAction: 'pan-y' }}
            drag={isSettling ? false : "x"}
            dragElastic={0.6}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              x: exitDir === 1 ? 600 : exitDir === -1 ? -600 : 0,
              opacity: 0,
              transition: { duration: 0.22 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <JobSwipeCard
              job={current}
              x={x}
              isTop
              depth={0}
              onTap={() => onOpenDetails(current)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <SwipeActionBar
        onPass={() => commit('left')}
        onInterested={() => commit('right')}
        onUndo={handleUndo}
        onDetails={() => onOpenDetails(current)}
        disabled={isSettling}
      />
    </div>
  );
}