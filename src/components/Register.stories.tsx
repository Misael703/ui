import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PaginaDeListadoPlayground } from './Filters.stories';

export default { title: 'Foundations/Registro', tags: ['autodocs'] } as Meta;

interface RegisterArgs {
  compare: boolean;
  buttons: 'kit' | 'sentence';
  controls: 38 | 36;
  dividers: 'kit' | 'tonal';
  badges: 'kit' | 'low' | 'dot';
  barCollapse: boolean;
  barPad: 12 | 8;
  headerGap: 40 | 24;
  radius: 12 | 8;
  cellPad: 7 | 6;
  title: 'display' | 'product';
  icons: 18 | 16;
  footer: 45 | 40;
}

/* Scoped overrides — an EXPERIMENT, not kit CSS. Each knob maps to one
   hypothesis about why a shadcn page reads more compact than the kit at
   the same control height:
   - buttons:  MAYÚSCULAS + tracking + 700 → sentence case + 600, no tracking.
   - controls: --control-h-md 38 → 36 (and btn sm 36/12px → 32/13px).
   - dividers: the surface's hairlines → separation by tone only. */
const CSS = `
.reg--sentence .btn { text-transform: none; letter-spacing: 0; font-weight: 600; }
.reg--sentence .btn--md { font-size: var(--text-sm); }
.reg--36 { --control-h-md: 36px; --field-min-h: 36px; }
.reg--36 .btn--md { min-height: 36px; }
.reg--36 .btn--sm { min-height: 32px; font-size: var(--text-data); padding: 6px 12px; }
.reg--36 .btn--icon.btn--sm, .reg--36 .btn--hide-label.btn--sm { width: 32px; }
.reg--tonal .table-surface { border-color: transparent; }
.reg--tonal .table-surface__bar { border-bottom-color: transparent; }
.reg--tonal .table-surface__footer { border-top-color: transparent; }
.reg--tonal .table th { background: transparent; }
/* badges: 'low' = 20px cell chip · 'dot' = colour dot + plain text (shadcn lists) */
.reg--badge-low .table .badge { padding: 1px 8px; min-height: 20px; line-height: 18px; }
.reg--badge-dot .table .badge { background: transparent; border-color: transparent; padding: 0; color: var(--fg-default); font-weight: 500; }
.reg--badge-dot .table .badge::before { content: ''; width: 8px; height: 8px; border-radius: 999px; background: currentColor; }
.reg--badge-dot .table .badge--success::before { background: var(--color-success); }
.reg--badge-dot .table .badge--warning::before { background: var(--color-warning); }
.reg--badge-dot .table .badge--info::before { background: var(--color-info); }
.reg--badge-dot .table .badge--danger::before { background: var(--color-danger); }
.reg--badge-dot .table .badge--neutral::before { background: var(--fg-subtle); }
/* bar padding 12 → 8 */
.reg--barpad-8 .table-surface__bar > .filter-bar { padding-block: 8px; }
/* header → surface gap 40 → 24: PageHeader margin + page grid gap */
.reg--gap-24 .page-header { margin-bottom: 8px; }
/* radius 12 → 8 on surfaces */
.reg--radius-8 { --radius-lg: 8px; }
/* cell padding 7 → 6 */
.reg--cell-6 .table td { padding-top: 6px; padding-bottom: 6px; }
/* title: display 24px → product 20px body 600 */
.reg--title-product .page-header__title { font-family: var(--font-body); font-weight: 600; font-size: var(--text-xl, 20px); letter-spacing: 0; text-transform: none; }
/* icons 18 → 16 in ghost / icon buttons */
.reg--icons-16 .btn svg { width: 16px; height: 16px; }
/* footer 45 → 40 */
.reg--footer-40 .table-surface__footer .table-pagination { padding-block: 4px; }
.reg > div { min-height: 0 !important; padding-bottom: 8px !important; }
.reg__label { font: 600 var(--text-xs)/1 var(--font-body); color: var(--fg-muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); padding: 0 24px; }
`;

const LIST_ARGS = { fields: 5, layout: 'inline', visibleCount: 'auto', barMobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: true, exportAction: true, sort: true, rowActions: 'inline', pagination: 'inside' } as const;

function Page({ cls, collapse = false }: { cls: string; collapse?: boolean }) {
  // The list page as the specimen: header (primary), filter bar (tertiary
  // actions), table, pagination — every register at once.
  const args = { ...LIST_ARGS, layout: collapse ? 'collapse' : 'inline' };
  return <div className={cls}>{PaginaDeListadoPlayground.render!(args as never, {} as never)}</div>;
}

/**
 * **Playground · registro compacto.** ¿Por qué una página shadcn lee más
 * compacta que el kit con controles casi iguales (36 vs 38px)? Tres
 * hipótesis, cada una con su control; `compare` apila el kit tal cual arriba
 * y la variante abajo. Los overrides viven en esta story, no en el kit:
 * lo que convenza se promueve a tokens en un release aparte (es un cambio
 * de registro global, visible en todas las apps).
 *
 * - **buttons**: el label en MAYÚSCULAS con tracking y peso 700 ocupa más
 *   ancho y pesa más que sentence case en 600. `--tt-label` está documentado
 *   como "solo micro-labels" y el botón lo usa igual.
 * - **controls**: 38 → 36 en md; el botón sm de 36/12px a 32/13px.
 * - **dividers**: sin los hairlines de la superficie, separando por tono
 *   (el borde de los inputs se queda: es contraste 3:1, accesibilidad).
 *
 * Segunda tanda, medida sobre la página (fila con badge 43px vs 31 sin él;
 * barra 164px a dos líneas; header→superficie 40px):
 * - **badges**: `low` = chip de celda de 20px · `dot` = punto de color +
 *   texto plano (fila de ~33px, el mayor efecto en una lista).
 * - **barCollapse**: `layout="collapse"` para que el grupo final comparta la
 *   línea con los campos. **barPad** 12 → 8.
 * - **headerGap** 40 → 24 · **radius** 12 → 8 · **cellPad** 7 → 6 ·
 *   **title** display 24px → producto 20px/600 · **icons** 18 → 16 ·
 *   **footer** 45 → 40.
 */
export const RegistroCompacto: StoryObj<RegisterArgs> = {
  name: 'Playground · registro compacto',
  parameters: { layout: 'fullscreen' },
  args: { compare: true, buttons: 'sentence', controls: 36, dividers: 'kit', badges: 'low', barCollapse: true, barPad: 8, headerGap: 24, radius: 8, cellPad: 6, title: 'product', icons: 16, footer: 40 },
  argTypes: {
    compare: { control: 'boolean', description: 'Kit tal cual arriba, variante abajo' },
    buttons: { control: 'inline-radio', options: ['kit', 'sentence'] },
    controls: { control: 'inline-radio', options: [38, 36] },
    dividers: { control: 'inline-radio', options: ['kit', 'tonal'] },
    badges: { control: 'inline-radio', options: ['kit', 'low', 'dot'], description: 'kit 24px · low 20px · dot = punto + texto' },
    barCollapse: { control: 'boolean', description: 'layout="collapse": el grupo final comparte la línea' },
    barPad: { control: 'inline-radio', options: [12, 8] },
    headerGap: { control: 'inline-radio', options: [40, 24] },
    radius: { control: 'inline-radio', options: [12, 8] },
    cellPad: { control: 'inline-radio', options: [7, 6] },
    title: { control: 'inline-radio', options: ['display', 'product'] },
    icons: { control: 'inline-radio', options: [18, 16] },
    footer: { control: 'inline-radio', options: [45, 40] },
  },
  render: (a) => {
    const cls = [
      'reg',
      a.buttons === 'sentence' && 'reg--sentence',
      a.controls === 36 && 'reg--36',
      a.dividers === 'tonal' && 'reg--tonal',
      a.badges === 'low' && 'reg--badge-low',
      a.badges === 'dot' && 'reg--badge-dot',
      a.barPad === 8 && 'reg--barpad-8',
      a.headerGap === 24 && 'reg--gap-24',
      a.radius === 8 && 'reg--radius-8',
      a.cellPad === 6 && 'reg--cell-6',
      a.title === 'product' && 'reg--title-product',
      a.icons === 16 && 'reg--icons-16',
      a.footer === 40 && 'reg--footer-40',
    ].filter(Boolean).join(' ');
    return (
      <>
        <style>{CSS}</style>
        {a.compare && (
          <>
            <div className="reg__label" style={{ paddingTop: 16 }}>Kit tal cual</div>
            <Page cls="reg" />
            <div className="reg__label">Variante · {a.buttons === 'sentence' ? 'sentence case' : 'mayúsculas'} · {a.controls}px · {a.dividers === 'tonal' ? 'sin hairlines' : 'hairlines'} · badges {a.badges} · barra {a.barCollapse ? 'collapse' : 'inline'}/{a.barPad}px · gap {a.headerGap} · radio {a.radius} · celda {a.cellPad} · título {a.title} · íconos {a.icons} · pie {a.footer}</div>
          </>
        )}
        <Page cls={cls} collapse={a.barCollapse} />
      </>
    );
  },
};
