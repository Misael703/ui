'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight } from './Icons';
import { useLocale } from '../locale';

export interface CarouselProps {
  children: React.ReactNode;
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
  className?: string;
  onIndexChange?: (index: number) => void;
}

export function Carousel({
  children,
  loop = false,
  autoplay = false,
  autoplayInterval = 4000,
  showControls = true,
  showDots = true,
  ariaLabel,
  className,
  onIndexChange,
}: CarouselProps) {
  const t = useLocale();
  const label = ariaLabel ?? t['carousel.label'];
  const slides = React.Children.toArray(children);
  const total = slides.length;
  const [index, setIndex] = React.useState(0);
  // Autoplay pauses while the pointer or keyboard focus is inside (WCAG 2.2.2
  // Pause, Stop, Hide) and never runs under prefers-reduced-motion.
  const [paused, setPaused] = React.useState(false);

  // Stable handlers: use the functional setIndex form so the callbacks
  // don't have to close over `index`. They re-create only when `loop`,
  // `total`, or `onIndexChange` change — meaning carousel arrow buttons
  // and autoplay can rely on referential stability across navigations.
  const go = React.useCallback(
    (target: number) => {
      const clamped = loop ? (target + total) % total : Math.max(0, Math.min(target, total - 1));
      setIndex(clamped);
      onIndexChange?.(clamped);
    },
    [loop, total, onIndexChange]
  );

  const next = React.useCallback(() => {
    setIndex((i) => {
      const t = loop ? (i + 1) % total : Math.min(i + 1, total - 1);
      onIndexChange?.(t);
      return t;
    });
  }, [loop, total, onIndexChange]);

  const prev = React.useCallback(() => {
    setIndex((i) => {
      const t = loop ? (i - 1 + total) % total : Math.max(0, i - 1);
      onIndexChange?.(t);
      return t;
    });
  }, [loop, total, onIndexChange]);

  React.useEffect(() => {
    if (!autoplay || total <= 1 || paused) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(next, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, autoplayInterval, total, next, paused]);

  const onKey = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [next, prev]
  );

  return (
    <div
      className={cx('carousel', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* The landmark above carries the region's identity; arrow-key
          navigation is a supplementary shortcut layered on the viewport
          itself (the Prev/Next buttons remain the primary, fully keyboard-
          operable control — role="presentation" here is overridden by the
          browser's focusable-element conflict resolution, so this stays in
          the a11y tree as a plain focusable container, not hidden). */}
      <div className="carousel__viewport" role="presentation" tabIndex={0} onKeyDown={onKey}>
        <div className="carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className="carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={i !== index}
            >
              {slide}
            </div>
          ))}
        </div>
        {showControls && total > 1 && (
          <>
            <button
              type="button"
              className="carousel__control carousel__control--prev"
              aria-label={t['carousel.prev']}
              onClick={prev}
              disabled={!loop && index === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="carousel__control carousel__control--next"
              aria-label={t['carousel.next']}
              onClick={next}
              disabled={!loop && index === total - 1}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {showDots && total > 1 && (
        <ul className="carousel__dots" role="tablist">
          {slides.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                className={cx('carousel__dot', i === index && 'is-active')}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
