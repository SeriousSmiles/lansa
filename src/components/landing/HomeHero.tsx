import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Pause, Play } from "lucide-react";
import { HERO_BUSINESSES, HERO_INTERVAL_MS, NAME_PAIRS } from "./homeHeroContent";
import curly from "@/assets/landing/hero/curly.webp";
import navy from "@/assets/landing/hero/navy.webp";
import wave from "@/assets/landing/hero/wave.webp";
import flag from "@/assets/landing/hero/flag.webp";
import couch from "@/assets/landing/hero/couch.webp";
import friendw from "@/assets/landing/hero/friendw.webp";
import friendm from "@/assets/landing/hero/friendm.webp";
import blazer from "@/assets/landing/hero/blazer.webp";
import laugh from "@/assets/landing/hero/laugh.webp";

type Pin = { src: string; cls: string; blur?: boolean; mobile?: boolean; dur: number; delay: number };

/** Positions keep the centre, navbar and CTA band clear. */
const PINS: Pin[] = [
  { src: curly, cls: "pin-a", mobile: true, dur: 9, delay: 0 },
  { src: navy, cls: "pin-b", blur: true, dur: 11, delay: -3 },
  { src: wave, cls: "pin-c", mobile: true, dur: 10, delay: -6 },
  { src: flag, cls: "pin-d", blur: true, mobile: true, dur: 12, delay: -2 },
  { src: couch, cls: "pin-e", dur: 9.5, delay: -5 },
  { src: friendw, cls: "pin-f", blur: true, dur: 13, delay: -8 },
  { src: friendm, cls: "pin-g", mobile: true, dur: 10.5, delay: -4 },
  { src: blazer, cls: "pin-h", dur: 11.5, delay: -7 },
  { src: laugh, cls: "pin-i", blur: true, mobile: true, dur: 12.5, delay: -1 },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Staggered tick: first name, second name, then business mark. */
function useStaggeredIndex(length: number, delay: number, running: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running) return;
    let t: number | undefined;
    const i = window.setInterval(() => {
      t = window.setTimeout(() => setIndex((n) => (n + 1) % length), delay);
    }, HERO_INTERVAL_MS);
    return () => {
      window.clearInterval(i);
      if (t) window.clearTimeout(t);
    };
  }, [length, delay, running]);
  return index;
}

/** Stacked words; slot width eases to the active word so fixed words never sit beside a large gap. */
function Rotator({ items, active }: { items: readonly string[]; active: number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const measure = () => setWidth(refs.current[active]?.offsetWidth);
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);
  return (
    <span className="hero-rotator" style={width ? { width } : undefined}>
      <span className="hero-rotator-sizer">{items[active]}</span>
      {items.map((w, i) => (
        <span
          key={w}
          ref={(el) => (refs.current[i] = el)}
          className="hero-rotator-item"
          data-state={i === active ? "on" : i === (active - 1 + items.length) % items.length ? "out" : "off"}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

export function HomeHero() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const running = !reduced && !paused;

  const a = useStaggeredIndex(NAME_PAIRS.length, 0, running);
  const b = useStaggeredIndex(NAME_PAIRS.length, 160, running);
  const c = useStaggeredIndex(HERO_BUSINESSES.length, 320, running);

  return (
    <section className="home-hero" data-paused={!running || undefined} aria-labelledby="home-hero-title">
      <div className="home-hero-pins" aria-hidden="true">
        {PINS.map((p) => (
          <span
            key={p.cls}
            className={`home-hero-pin ${p.cls} ${p.blur ? "is-soft" : ""} ${p.mobile ? "" : "desktop-only"}`}
            style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
          >
            <img src={p.src} alt="" width={240} height={240} loading="eager" decoding="async" draggable={false} />
          </span>
        ))}
      </div>

      <div className="home-hero-inner">
        <h1 id="home-hero-title" className="home-hero-title">
          <span className="sr-only">Where people in Curaçao find opportunities that fit.</span>
          <span aria-hidden="true">
            <span className="hero-line">
              Where <Rotator items={NAME_PAIRS.map((p) => p[0])} active={a} />
              <br className="sm:hidden" /> and <Rotator items={NAME_PAIRS.map((p) => p[1])} active={b} />
              <span className="sm:hidden"> find</span>
            </span>
            <span className="hero-line">
              <span className="hidden sm:inline">find </span>opportunities
            </span>
            <span className="hero-line">
              <span className="hero-tile-slot">
                {HERO_BUSINESSES.map((biz, i) => (
                  <span key={biz.name} className={`hero-tile tile-${biz.tile}`} data-state={i === c ? "on" : "off"}>
                    {biz.src ? (
                      <img src={biz.src} alt="" style={{ padding: biz.padding }} draggable={false} />
                    ) : (
                      <span className="hero-tile-word">{biz.name}</span>
                    )}
                  </span>
                ))}
              </span>{" "}
              that fit.
            </span>
          </span>
        </h1>
        <p className="sr-only" aria-live="off">
          Featuring {HERO_BUSINESSES.map((b) => b.name).join(", ")}.
        </p>

        <p className="home-hero-sub">Build your professional profile and connect with employers in Curaçao.</p>

        <div className="home-hero-ctas">
          <button type="button" className="hero-pill hero-pill-primary" onClick={() => navigate("/signup")}>
            Get Started
          </button>
          <button type="button" className="hero-pill hero-pill-secondary" onClick={() => navigate("/login")}>
            Sign In <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!reduced && (
        <button
          type="button"
          className="home-hero-pause"
          aria-pressed={paused}
          aria-label={paused ? "Play hero animation" : "Pause hero animation"}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      )}
    </section>
  );
}
