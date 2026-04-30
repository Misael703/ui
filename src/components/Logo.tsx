import * as React from 'react';
import { cx } from '../utils/cx';
import { getBrand } from '../brand';

export type LogoVariant = 'horizontal' | 'vertical' | 'mark' | 'wordmark';
export type LogoBg = 'light' | 'dark';
export type LogoFormat = 'svg' | 'png';

/** Formato preferido por variante (SVG si existe, sino PNG). */
const PREFERRED_FORMAT: Record<LogoVariant, LogoFormat> = {
  horizontal: 'svg',
  vertical: 'png',
  mark: 'svg',
  wordmark: 'png',
};

/** Altura razonable por defecto según la forma de la variante. */
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
  /** Forma del logo. Default: `mark` (isotipo). */
  variant?: LogoVariant;
  /** Color del fondo donde se va a pintar. Define si usar la versión normal o invertida. Default: `light`. */
  bg?: LogoBg;
  /** Forza el formato (svg|png). Por defecto se usa el preferido por variante. */
  format?: LogoFormat;
  /**
   * Si `true`, usa `mark` en mobile (<768px) y `variant` en desktop.
   * Útil para AppShell / topbars / headers que se vuelven angostos.
   */
  responsive?: boolean;
  /** Base URL donde están los assets. Default desde `getBrand().logoBasePath`. */
  basePath?: string;
  /** Altura en px. Default depende de la variante (mark: 32, horizontal: 32, vertical: 64, wordmark: 28). */
  height?: number;
  /** Texto alternativo (a11y). Default: el `brandName`. */
  alt?: string;
  /** Nombre de la marca; fallback de `alt`. Default desde `getBrand().name`. */
  brandName?: string;
}

/**
 * Componente Logo unificado para todas las variantes (horizontal, vertical, mark, wordmark)
 * con soporte responsive (`mark` en mobile, variante elegida en desktop).
 *
 * @example
 * <Logo variant="horizontal" bg="light" />
 * <Logo responsive variant="horizontal" bg="light" />   // mark en mobile, horizontal en desktop
 * <Logo variant="mark" bg="dark" height={48} />
 */
export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(function Logo(
  {
    variant = 'mark',
    bg = 'light',
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
  const desktopSrc = buildPath(variant, bg, fmt, resolvedBasePath);

  if (responsive && variant !== 'mark') {
    const mobileFmt = format ?? PREFERRED_FORMAT.mark;
    const mobileSrc = buildPath('mark', bg, mobileFmt, resolvedBasePath);
    return (
      <picture className={cx('logo', className)}>
        <source media="(min-width: 768px)" srcSet={desktopSrc} />
        <img ref={ref} src={mobileSrc} alt={a} height={h} {...rest} />
      </picture>
    );
  }

  return (
    <img
      ref={ref}
      src={desktopSrc}
      alt={a}
      height={h}
      className={cx('logo', className)}
      {...rest}
    />
  );
});
