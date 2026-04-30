'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown, Star } from './Icons';

// ---------- Hero / Banner ----------------------------------------------
export interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Imagen de fondo. */
  image?: string;
  /** Posiciona el contenido. Default: center. */
  align?: 'start' | 'center' | 'end';
  /** Variantes visuales. */
  tone?: 'brand' | 'inverse' | 'subtle' | 'image';
  /** Altura. */
  size?: 'sm' | 'md' | 'lg';
}

export function Hero({
  eyebrow, title, subtitle, actions, image,
  align = 'center', tone = 'brand', size = 'md',
  className, style, children, ...rest
}: HeroProps) {
  const computedTone = image ? 'image' : tone;
  return (
    <section
      className={cx('hero', `hero--${computedTone}`, `hero--align-${align}`, `hero--${size}`, className)}
      style={image ? { backgroundImage: `url(${image})`, ...style } : style}
      {...rest}
    >
      <div className="hero__inner">
        {eyebrow && <div className="hero__eyebrow">{eyebrow}</div>}
        <h1 className="hero__title">{title}</h1>
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        {actions && <div className="hero__actions">{actions}</div>}
        {children}
      </div>
    </section>
  );
}

// ---------- Testimonial -------------------------------------------------
export interface TestimonialProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  quote: React.ReactNode;
  author: React.ReactNode;
  role?: React.ReactNode;
  company?: React.ReactNode;
  avatarSrc?: string;
  rating?: number;        // 0..5
}

export function Testimonial({
  quote, author, role, company, avatarSrc, rating,
  className, ...rest
}: TestimonialProps) {
  return (
    <figure className={cx('testimonial', className)} {...rest}>
      {rating != null && (
        <div className="testimonial__rating" aria-label={`${rating} de 5 estrellas`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} className={i < rating ? 'is-filled' : ''} />
          ))}
        </div>
      )}
      <blockquote className="testimonial__quote">"{quote}"</blockquote>
      <figcaption className="testimonial__caption">
        {avatarSrc && <img src={avatarSrc} alt="" className="testimonial__avatar" />}
        <div>
          <div className="testimonial__author">{author}</div>
          {(role || company) && (
            <div className="testimonial__meta">
              {role}{role && company ? ' · ' : ''}{company}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

// ---------- CategoryNav (mega menu) ------------------------------------
export interface CategoryItem {
  id: string;
  label: React.ReactNode;
  href?: string;
  /** Subcategorías agrupadas (mega menu). */
  groups?: Array<{ title: React.ReactNode; items: Array<{ label: React.ReactNode; href?: string }> }>;
  /** Si tiene groups, se muestra el mega menu en hover. */
}

export interface CategoryNavProps extends React.HTMLAttributes<HTMLElement> {
  categories: CategoryItem[];
}

export function CategoryNav({ categories, className, ...rest }: CategoryNavProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  return (
    <nav ref={ref} className={cx('category-nav', className)} aria-label="Categorías" {...rest}>
      <ul className="category-nav__list">
        {categories.map((c) => {
          const hasMega = !!(c.groups && c.groups.length);
          const isOpen = openId === c.id;
          return (
            <li key={c.id} className="category-nav__item">
              {hasMega ? (
                <button
                  type="button"
                  className={cx('category-nav__link', isOpen && 'is-open')}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setOpenId(isOpen ? null : c.id)}
                  onMouseEnter={() => setOpenId(c.id)}
                >
                  {c.label}
                  <ChevronDown size={12} />
                </button>
              ) : (
                <a href={c.href ?? '#'} className="category-nav__link">{c.label}</a>
              )}
              {hasMega && isOpen && (
                <div className="category-nav__mega" onMouseLeave={() => setOpenId(null)}>
                  {c.groups!.map((g, i) => (
                    <div key={i} className="category-nav__group">
                      <div className="category-nav__group-title">{g.title}</div>
                      <ul className="category-nav__group-items">
                        {g.items.map((it, j) => (
                          <li key={j}><a href={it.href ?? '#'}>{it.label}</a></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
