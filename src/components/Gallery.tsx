'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight, X } from './Icons';

// ---------- ImageGallery ------------------------------------------------
export interface GalleryImage {
  src: string;
  alt?: string;
  thumbnail?: string;       // si no se pasa, se usa src
}

export interface ImageGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  images: GalleryImage[];
  /** Index inicial. */
  defaultIndex?: number;
  /** Click en imagen principal abre lightbox. Default: true. */
  enableLightbox?: boolean;
  /** Layout de thumbnails. */
  thumbnailPosition?: 'bottom' | 'left';
}

export function ImageGallery({
  images, defaultIndex = 0, enableLightbox = true,
  thumbnailPosition = 'bottom', className, ...rest
}: ImageGalleryProps) {
  const [index, setIndex] = React.useState(defaultIndex);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  if (images.length === 0) return null;
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  const current = images[safeIndex];

  return (
    <>
      <div className={cx('gallery', `gallery--thumbs-${thumbnailPosition}`, className)} {...rest}>
        <div className="gallery__main">
          <img
            src={current.src}
            alt={current.alt ?? ''}
            className="gallery__image"
            onClick={() => enableLightbox && setLightboxOpen(true)}
            style={{ cursor: enableLightbox ? 'zoom-in' : 'default' }}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery__nav gallery__nav--prev"
                aria-label="Imagen anterior"
                onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="gallery__nav gallery__nav--next"
                aria-label="Imagen siguiente"
                onClick={() => setIndex((i) => (i + 1) % images.length)}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="gallery__thumbs" role="tablist" aria-label="Miniaturas">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Imagen ${i + 1}`}
                className={cx('gallery__thumb', i === safeIndex && 'is-active')}
                onClick={() => setIndex(i)}
              >
                <img src={img.thumbnail ?? img.src} alt={img.alt ?? ''} />
              </button>
            ))}
          </div>
        )}
      </div>

      {enableLightbox && (
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={images}
          index={safeIndex}
          onChange={setIndex}
        />
      )}
    </>
  );
}

// ---------- Lightbox ---------------------------------------------------
export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  images: GalleryImage[];
  index: number;
  onChange?: (i: number) => void;
}

export function Lightbox({ open, onClose, images, index, onChange }: LightboxProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onChange) onChange((index - 1 + images.length) % images.length);
      else if (e.key === 'ArrowRight' && onChange) onChange((index + 1) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onChange, onClose]);

  if (!open || images.length === 0) return null;
  const current = images[Math.max(0, Math.min(index, images.length - 1))];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visor de imagen" onClick={onClose}>
      <button
        type="button"
        className="lightbox__close"
        aria-label="Cerrar"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {images.length > 1 && onChange && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          aria-label="Imagen anterior"
          onClick={(e) => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length); }}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <img src={current.src} alt={current.alt ?? ''} className="lightbox__image" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && onChange && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          aria-label="Imagen siguiente"
          onClick={(e) => { e.stopPropagation(); onChange((index + 1) % images.length); }}
        >
          <ChevronRight size={24} />
        </button>
      )}
      {images.length > 1 && (
        <div className="lightbox__counter">{index + 1} / {images.length}</div>
      )}
    </div>
  );
}
