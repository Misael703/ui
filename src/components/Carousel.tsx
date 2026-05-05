'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight } from './Icons';

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
  ariaLabel = 'Carrusel',
  className,
  onIndexChange,
}: CarouselProps) {
  const slides = React.Children.toArray(children);
  const total = slides.length;
  const [index, setIndex] = React.useState(0);

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
    if (!autoplay || total <= 1) return;
    const id = setInterval(next, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, autoplayInterval, total, next]);

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
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <div className="carousel__viewport">
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
              aria-label="Anterior"
              onClick={prev}
              disabled={!loop && index === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="carousel__control carousel__control--next"
              aria-label="Siguiente"
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
