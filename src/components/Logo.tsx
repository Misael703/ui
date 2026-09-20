import * as React from 'react';
import { cx } from '../utils/cx';
import { getBrand } from '../brand';

export type LogoVariant = 'horizontal' | 'vertical' | 'mark' | 'wordmark';
/** Concrete surface the logo paints on (picks the asset). */
export type LogoBg = 'light' | 'dark';
/** `bg` prop: a fixed surface, or `auto` (surface-aware — see below). */
export type LogoBgProp = LogoBg | 'auto';
export type LogoFormat = 'svg' | 'png';

/** Preferred format per variant. SVG for every variant (better scaling and weight). */
const PREFERRED_FORMAT: Record<LogoVariant, LogoFormat> = {
  horizontal: 'svg',
  vertical: 'svg',
  mark: 'svg',
  wordmark: 'svg',
};

/** Reasonable default height per variant shape. */
const DEFAULT_HEIGHT: Record<LogoVariant, number> = {
  horizontal: 32,
  vertical: 64,
  mark: 32,
  wordmark: 28,
};

function buildPath(
  variant: LogoVariant,
  bg: LogoBg,
  format: LogoFormat,
  basePath: string
) {
  const prefix = variant === 'horizontal' || variant === 'vertical' ? 'logo-' : '';
  return `${basePath}/${prefix}${variant}-${bg}.${format}`;
}

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Logo shape. Default: `mark` (isotype). */
  variant?: LogoVariant;
  /**
   * Surface the logo paints on, picks the asset variant. Default:
   * `auto` — surface-aware: uses the light-surface variant by
   * default, and the dark-surface variant when under an inverse band
   * (`data-tone="inverse"`) or in dark theme (`data-theme="dark"`). No JS, no
   * flash. Pass a fixed `light`/`dark` for fixed-tone surfaces (a white
   * document: `bg="light"`), which should ignore the theme.
   */
  bg?: LogoBgProp;
  /** Force the format (svg|png). Defaults to the variant's preferred format. */
  format?: LogoFormat;
  /**
   * When `true`, renders `mark` on mobile (<768px) and `variant` on desktop.
   * Useful for AppShell / topbars / headers that get narrow.
   */
  responsive?: boolean;
  /** Base URL of the assets. Defaults to `getBrand().logoBasePath`. */
  basePath?: string;
  /** Height in px. Default depends on the variant (mark: 32, horizontal: 32, vertical: 64, wordmark: 28). */
  height?: number;
  /** Alternative text (a11y). Defaults to `brandName`. */
  alt?: string;
  /** Brand name; fallback for `alt`. Defaults to `getBrand().name`. */
  brandName?: string;
}

/**
 * Unified Logo component for every variant (horizontal, vertical, mark, wordmark)
 * with responsive support (`mark` on mobile, chosen variant on desktop).
 *
 * @example
 * <Logo variant="horizontal" bg="light" />
 * <Logo responsive variant="horizontal" bg="light" />   // mark on mobile, horizontal on desktop
 * <Logo variant="mark" bg="dark" height={48} />
 */
export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(function Logo(
  {
    variant = 'mark',
    bg = 'auto',
    format,
    responsive,
    basePath,
    height,
    alt,
    brandName,
    className,
    ...rest
  },
  ref
) {
  const brand = getBrand();
  const resolvedBasePath = basePath ?? brand.logoBasePath;
  const resolvedBrandName = brandName ?? brand.name;
  const fmt = format ?? PREFERRED_FORMAT[variant];
  const h = height ?? DEFAULT_HEIGHT[variant];
  const a = alt ?? resolvedBrandName;

  // One rendered logo (img, or a responsive picture with `mark` on mobile) for a
  // CONCRETE surface variant.
  const renderFor = (surface: LogoBg, cls: string, imgRef?: React.Ref<HTMLImageElement>, key?: string) => {
    const src = buildPath(variant, surface, fmt, resolvedBasePath);
    if (responsive && variant !== 'mark') {
      const mobileSrc = buildPath('mark', surface, format ?? PREFERRED_FORMAT.mark, resolvedBasePath);
      return (
        <picture key={key} className={cls}>
          <source media="(min-width: 768px)" srcSet={src} />
          <img ref={imgRef} src={mobileSrc} alt={a} height={h} {...rest} />
        </picture>
      );
    }
    return <img key={key} ref={imgRef} src={src} alt={a} height={h} className={cls} {...rest} />;
  };

  // `auto`: render BOTH surface variants and let CSS show the one matching the
  // surface (light by default; the dark-surface variant under an inverse band or
  // the dark theme). The hidden variant is `display:none`, so assistive tech only
  // sees the visible one — no JS, no theme flash.
  if (bg === 'auto') {
    return (
      <span className={cx('logo-auto', className)}>
        {renderFor('light', cx('logo', 'logo__v--light'), ref, 'l')}
        {renderFor('dark', cx('logo', 'logo__v--dark'), undefined, 'd')}
      </span>
    );
  }

  return renderFor(bg, cx('logo', className), ref);
});
