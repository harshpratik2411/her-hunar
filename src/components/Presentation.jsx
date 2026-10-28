import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import deck from '../data/slides.json';
import SlideRenderer from './SlideRenderer.jsx';
import { cx } from '../lib/utils.js';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconExpand,
  IconPause,
  IconPlay,
  IconPresentation,
} from './icons.jsx';

const AUTOPLAY_MS = 6500;

/** Tracks an element's width so the fixed-size slide stage can be scaled to fit. */
function useElementWidth(ref) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => setWidth(element.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export default function Presentation() {
  const slides = deck.slides ?? [];
  const stageWidth = deck.meta?.width ?? 960;
  const stageHeight = deck.meta?.height ?? 540;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const frameRef = useRef(null);
  const measureRef = useRef(null);

  const frameWidth = useElementWidth(measureRef);
  const scale = frameWidth ? frameWidth / stageWidth : 0;
  const active = slides[index];
  const total = slides.length;

  const go = useCallback(
    (next) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const previous = useCallback(() => go(index - 1), [go, index]);

  /* Keyboard navigation: ← / → while the landing page is open. */
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((current) => (total ? (current + 1) % total : 0));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((current) => (total ? (current - 1 + total) % total : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [total]);

  /* Autoplay */
  useEffect(() => {
    if (!playing || total < 2) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [playing, total]);

  /* Fullscreen */
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    const element = frameRef.current;
    if (!element) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else element.requestFullscreen?.();
  };

  const thumbnails = useMemo(() => slides.map((slide) => ({ n: slide.n, title: slide.title })), [slides]);

  if (!total) {
    return (
      <section id="deck" className="shell py-16">
        <div className="card p-10 text-center">
          <h2 className="section-title">Discover How herHunar Works</h2>
          <p className="mt-2 text-sm text-ink-500">
            No slides found yet. Add your <code className="rounded bg-mist px-1.5 py-0.5">.pptx</code> to{' '}
            <code className="rounded bg-mist px-1.5 py-0.5">public/herhunar.pptx</code> and run{' '}
            <code className="rounded bg-mist px-1.5 py-0.5">npm run slides</code>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="deck" className="relative overflow-hidden border-y border-brand-100/70 bg-gradient-to-b from-brand-50/70 via-white to-white py-16 sm:py-20">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <IconPresentation size={14} />
            Project deck · {total} slides
          </span>
          <h2 className="section-title mt-4">Discover How herHunar Works</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
            Walk through the full HerHunar concept — the problem, the website map, the page designs, the business
            model, and the four-week build plan. Use the arrows, the slide strip, or your keyboard.
          </p>
        </div>

        <div className="mt-9">
          <div ref={frameRef} className="relative rounded-3xl bg-brand-900/5 p-2 shadow-card ring-1 ring-brand-100 sm:p-3">
            <div ref={measureRef} className="relative w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80">
              <div style={{ aspectRatio: `${stageWidth} / ${stageHeight}` }} className="relative w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.n}
                    className="absolute inset-0 origin-top-left"
                    style={{ width: stageWidth, height: stageHeight, transform: `scale(${scale})` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <SlideRenderer slide={active} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Previous slide"
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-ink-700 shadow-card ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-brand-700 sm:left-4 sm:p-3"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next slide"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-ink-700 shadow-card ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-brand-700 sm:right-4 sm:p-3"
                  >
                    <IconChevronRight size={18} />
                  </button>
                </>
              )}

              <span className="absolute right-3 bottom-3 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {index + 1} / {total}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button type="button" className="btn-outline btn-sm" onClick={previous} disabled={total < 2}>
                  <IconChevronLeft size={15} />
                  Prev
                </button>
                <button
                  type="button"
                  className={cx('btn-sm', playing ? 'btn-outline' : 'btn-primary')}
                  onClick={() => setPlaying((value) => !value)}
                  disabled={total < 2}
                >
                  {playing ? <IconPause size={15} /> : <IconPlay size={15} />}
                  {playing ? 'Pause' : 'Play slideshow'}
                </button>
                <button type="button" className="btn-outline btn-sm" onClick={next} disabled={total < 2}>
                  Next
                  <IconChevronRight size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className="btn-outline btn-sm" onClick={toggleFullscreen}>
                  <IconExpand size={15} />
                  {isFullscreen ? 'Exit full screen' : 'Full screen'}
                </button>
                <a className="btn-outline btn-sm" href="/herhunar.pptx" download>
                  <IconDownload size={15} />
                  Download .pptx
                </a>
              </div>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-out"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <p className="truncate text-sm font-semibold text-ink-800">{active.title}</p>
              <p className="hidden shrink-0 text-xs text-ink-400 sm:block">
                Tip: use <kbd className="rounded border border-slate-200 bg-mist px-1.5 py-0.5 font-sans">←</kbd>{' '}
                <kbd className="rounded border border-slate-200 bg-mist px-1.5 py-0.5 font-sans">→</kbd> to move through
                slides
              </p>
            </div>

            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {thumbnails.map((slide, slideIndex) => (
                <button
                  key={slide.n}
                  type="button"
                  onClick={() => go(slideIndex)}
                  className={cx(
                    'group flex w-40 shrink-0 flex-col gap-1 rounded-xl border p-3 text-left transition',
                    slideIndex === index
                      ? 'border-brand-300 bg-brand-50 shadow-card'
                      : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/50',
                  )}
                >
                  <span
                    className={cx(
                      'text-[11px] font-bold tracking-wide uppercase',
                      slideIndex === index ? 'text-brand-700' : 'text-ink-400',
                    )}
                  >
                    Slide {slide.n}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium text-ink-700">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
