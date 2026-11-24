import { ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

type Props = {
  stepKey: string;
  direction: 1 | -1;
  progress?: { index: number; total: number };
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
  media?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  busy?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  swipeable?: boolean;
  error?: string | null;
};

/** One card per step: announced progress, Back/Next, and a footer that stays above the keyboard. */
export function CarouselFrame(p: Props) {
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  // A fast double tap must not land on the next card's button and submit it too.
  const shownAt = useRef(0);
  useEffect(() => { shownAt.current = Date.now(); }, [p.stepKey]);
  const guardedNext = () => { if (Date.now() - shownAt.current < 450) return; p.onNext?.(); };

  // Move focus to the new card's heading once it has mounted (not on first load).
  const focusHeading = () => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  };

  const offset = reduce ? 0 : 36 * p.direction;
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!p.swipeable) return;
    if (info.offset.x < -80 && p.onNext && !p.nextDisabled && !p.busy) guardedNext();
    else if (info.offset.x > 80 && p.onBack) p.onBack();
  };

  return (
    <div className="ob-root seeker-theme">
      <header className="ob-top">
        {p.onBack ? (
          <button type="button" className="ee-icon-btn" onClick={p.onBack} aria-label="Back" disabled={p.busy}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : <span className="ob-top-spacer" />}
        {p.progress && p.progress.total > 0 ? (
          <div className="ob-progress" role="progressbar" aria-valuemin={0} aria-valuemax={p.progress.total} aria-valuenow={p.progress.index} aria-label={`Step ${p.progress.index} of ${p.progress.total}`}>
            {Array.from({ length: p.progress.total }).map((_, i) => (
              <span key={i} className={i < p.progress!.index ? 'is-on' : ''} />
            ))}
          </div>
        ) : <span className="flex-1" />}
        {p.onSkip ? (
          <button type="button" className="ob-skip" onClick={p.onSkip} disabled={p.busy}>{p.skipLabel || 'Skip'}</button>
        ) : <span className="ob-top-spacer" />}
      </header>
      <p className="sr-only" aria-live="polite">{p.progress && p.progress.total && p.progress.index > 0 ? `Step ${p.progress.index} of ${p.progress.total}: ${p.title}` : p.title}</p>

      <div className="ob-stage">
        <AnimatePresence mode="wait" initial={false} custom={p.direction}>
          <motion.section
            key={p.stepKey}
            className={`ob-card${p.aside ? ' has-aside' : ''}`}
            initial={{ opacity: 0, x: offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -offset }}
            transition={{ duration: reduce ? 0.01 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            drag={p.swipeable && !reduce ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
            onAnimationComplete={focusHeading}
          >
            <div className="ob-main">
              {p.media && <div className="ob-media"><img src={p.media} alt="" draggable={false} /></div>}
              {p.progress && p.progress.total > 0 && p.progress.index > 0 && (
                <p className="ob-count">Step {p.progress.index} of {p.progress.total}</p>
              )}
              {p.eyebrow && <p className="ob-eyebrow">{p.eyebrow}</p>}
              <h1 ref={headingRef} tabIndex={-1} className="ob-title">{p.title}</h1>
              {p.lead && <p className="ob-lead">{p.lead}</p>}
              {p.children && <div className="ob-content">{p.children}</div>}
            </div>
            {p.aside && <aside className="ob-aside" aria-label="Live preview">{p.aside}</aside>}
          </motion.section>
        </AnimatePresence>
      </div>

      {(p.onNext || p.error) && (
        <footer className="ob-foot">
          {p.error && <p className="ob-error" role="alert">{p.error}</p>}
          {p.onNext && (
            <button type="button" className="ee-primary ob-next" onClick={guardedNext} disabled={p.nextDisabled || p.busy} aria-busy={p.busy}>
              {p.busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {p.nextLabel || 'Next'}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="ob-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p id={`${id}-err`} className="ob-field-err" role="alert">{error}</p> : hint ? <p className="ob-hint">{hint}</p> : null}
    </div>
  );
}

export function ChoiceList<T extends string>({ name, value, onChange, options }: { name: string; value: T | null; onChange: (v: T) => void; options: { value: T; label: string; detail?: string; icon?: ReactNode }[] }) {
  return (
    <div className="ob-choices" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={`ob-choice${value === o.value ? ' is-on' : ''}`} onClick={() => onChange(o.value)}>
          {o.icon && <span className="ob-choice-icon">{o.icon}</span>}
          <span className="ob-choice-text"><strong>{o.label}</strong>{o.detail && <small>{o.detail}</small>}</span>
          <span className="ob-radio" aria-hidden />
        </button>
      ))}
    </div>
  );
}
