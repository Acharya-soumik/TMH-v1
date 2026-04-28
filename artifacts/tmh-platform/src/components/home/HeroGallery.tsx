import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STRIP_COUNT = 8;
const ROTATE_INTERVAL_MS = 5000;
const STRIP_DURATION_MS = 700;
const STRIP_STAGGER_MS = 35;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export interface HeroPoster {
  src: string;
  question: string;
  href: string;
}

function placeholderSrc(idx: number): string {
  const hue = (idx * 36 + 350) % 360;
  const num = String(idx + 1).padStart(2, "0");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><pattern id="d${idx}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" fill="rgba(0,0,0,0.18)"/></pattern></defs><rect width="300" height="400" fill="hsl(${hue},22%,28%)"/><rect width="300" height="400" fill="url(#d${idx})"/><text x="150" y="230" font-family="serif" font-weight="900" font-size="180" text-anchor="middle" fill="rgba(255,255,255,0.88)">${num}</text><text x="150" y="290" font-family="serif" font-size="13" text-anchor="middle" fill="rgba(255,255,255,0.55)" letter-spacing="6">PLACEHOLDER</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_POSTERS: HeroPoster[] = [
  { src: placeholderSrc(0), question: "Should Lebanese bankers face criminal trials for the 2019 deposit theft?", href: "/debates" },
  { src: placeholderSrc(1), question: "Should Arab states sever all ties with Israel until a permanent ceasefire?", href: "/debates" },
  { src: placeholderSrc(2), question: "Is the Saudi-Iran reconciliation real, or political theater?", href: "/debates" },
  { src: placeholderSrc(3), question: "Has MBS's Vision 2030 actually changed Saudi Arabia, or rebranded it?", href: "/debates" },
  { src: placeholderSrc(4), question: "Is Sisi's Egypt economically worse off than Mubarak's?", href: "/debates" },
  { src: placeholderSrc(5), question: "Is the world deliberately ignoring Sudan's collapse?", href: "/debates" },
  { src: placeholderSrc(6), question: "Did the Arab Spring end with Tunisia, or never really happen?", href: "/debates" },
  { src: placeholderSrc(7), question: "Would a second Trump term help or hurt the Middle East?", href: "/debates" },
  { src: placeholderSrc(8), question: "Did Gulf elites buy their names off the Epstein client list?", href: "/debates" },
  { src: placeholderSrc(9), question: "Will AI save the Gulf economies, or accelerate their collapse?", href: "/debates" },
];

export interface HeroGalleryProps {
  posters?: HeroPoster[];
}

export function HeroGallery({ posters = DEFAULT_POSTERS }: HeroGalleryProps) {
  const [, navigate] = useLocation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || posters.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % posters.length);
    }, ROTATE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, posters.length]);

  const current = posters[currentIdx];
  const stripIndices = useMemo(() => Array.from({ length: STRIP_COUNT }, (_, i) => i), []);

  const handleClick = () => {
    if (current?.href) navigate(current.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    } else if (e.key === "ArrowRight") {
      setCurrentIdx((i) => (i + 1) % posters.length);
    } else if (e.key === "ArrowLeft") {
      setCurrentIdx((i) => (i - 1 + posters.length) % posters.length);
    }
  };

  return (
    <div
      className="group relative w-full aspect-[3/4] overflow-hidden bg-secondary border border-border cursor-pointer select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Featured debate: ${current.question}`}
    >
      {reduceMotion ? (
        <img
          src={current.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        stripIndices.map((i) => {
          const goingDown = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 overflow-hidden"
              style={{
                left: `${(i / STRIP_COUNT) * 100}%`,
                width: `${100 / STRIP_COUNT}%`,
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentIdx}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("${current.src}")`,
                    backgroundSize: `${STRIP_COUNT * 100}% 100%`,
                    backgroundPosition: `${(i / Math.max(STRIP_COUNT - 1, 1)) * 100}% 0%`,
                    backgroundRepeat: "no-repeat",
                  }}
                  initial={{ y: goingDown ? "-101%" : "101%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: goingDown ? "101%" : "-101%" }}
                  transition={{
                    duration: STRIP_DURATION_MS / 1000,
                    ease: EASE_OUT_EXPO,
                    delay: (i * STRIP_STAGGER_MS) / 1000,
                  }}
                />
              </AnimatePresence>
            </div>
          );
        })
      )}

      {/* Gradient scrim for legibility of overlay text */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

      {/* Top label */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-bold font-serif text-white/80">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Today's Debate
        </span>
        <span className="tabular-nums text-white/60">
          {String(currentIdx + 1).padStart(2, "0")}/{String(posters.length).padStart(2, "0")}
        </span>
      </div>

      {/* Bottom: question + CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: 0.15 }}
            className="font-serif font-black uppercase text-white text-[15px] sm:text-base leading-tight tracking-tight mb-3"
          >
            {current.question}
          </motion.p>
        </AnimatePresence>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-bold font-serif text-primary group-hover:text-white transition-colors">
          Cast Your Vote →
        </span>
      </div>

      {/* Progress dots */}
      <div className="absolute top-12 right-3 flex flex-col gap-1.5">
        {posters.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIdx(i);
            }}
            aria-label={`Go to poster ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIdx ? "bg-primary scale-125" : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
