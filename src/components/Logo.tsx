import * as React from 'react';
import { cx } from '../utils/cx';
import { getBrand } from '../brand';

export type LogoVariant = 'horizontal' | 'vertical' | 'mark' | 'wordmark';
/** Concrete surface the logo paints on (picks the asset). */
export type LogoBg = 'light' | 'dark';
/** `bg` prop: a fixed surface, or `auto` (surface-aware — see below). */
export type LogoBgProp = LogoBg | 'auto';
export type LogoFormat = 'svg' | 'png';

/** Formato preferido por variante. SVG en todas las variantes (mejor escalado y peso). */
const PREFERRED_FORMAT: Record<LogoVariant, LogoFormat> = {
  horizontal: 'svg',
  vertical: 'svg',
  mark: 'svg',
  wordmark: 'svg',
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
  /**
   * Superficie donde se pinta el logo, elige la variante del asset. Default:
   * `auto` — consciente de la superficie: usa la variante para fondo claro por
   * defecto, y la variante para fondo oscuro cuando está en una banda inverse
   * (`data-tone="inverse"`) o en tema oscuro (`data-theme="dark"`). Sin JS, sin
   * flash. Pasa `light`/`dark` fijo para superficies de tono fijo (un documento
   * blanco: `bg="light"`), que deben ignorar el tema.
   */
  bg?: LogoBgProp;
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
