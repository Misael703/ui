import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PaginaDeListadoPlayground } from './Filters.stories';

export default { title: 'Foundations/Registro', tags: ['autodocs'] } as Meta;

interface RegisterArgs {
  compare: boolean;
  controls: 38 | 36;
  dividers: 'kit' | 'tonal';
  controlBorder: 'kit' | 'light' | 'tonal';
}

/* Scoped overrides — an EXPERIMENT, not kit CSS. The v4.0.0 product register
   promoted the knobs that convinced (sentence-case buttons, 20px badges,
   collapse bar, 8px radius, 6px cells, body-face title, 16px icons, 40px
   footer). What is left here are the three that were looked at and NOT
   adopted, kept so the comparison can be re-run:
   - controls:      --control-h-md 38 → 36 (measured: not what reads "big").
   - dividers:      the surface's hairlines → tone only (the column header
                    loses its anchor; on a near-white canvas the table melts).
   - controlBorder: 'kit' = --border-control (3:1, WCAG 1.4.11) · 'light' =
                    --border-strong hairline (~1.5:1) · 'tonal' = no border, a
                    subtle fill (the shadcn look; 1.13:1, fails 1.4.11).
                    Deferred: "tonal fill + 3:1 border" may be worth polishing. */
const CSS = `
.reg--36 { --control-h-md: 36px; --field-min-h: 36px; }
.reg--36 .btn--md { min-height: 36px; }
.reg--36 .btn--sm { min-height: 32px; font-size: var(--text-data); padding: 6px 12px; }
.reg--36 .btn--icon.btn--sm, .reg--36 .btn--hide-label.btn--sm { width: 32px; }
.reg--tonal .table-surface { border-color: transparent; }
.reg--tonal .table-surface__bar { border-bottom-color: transparent; }
.reg--tonal .table-surface__footer { border-top-color: transparent; }
.reg--tonal .table th { background: transparent; }
.reg--cb-light .input, .reg--cb-light .select, .reg--cb-light .textarea, .reg--cb-light .combobox__input, .reg--cb-light .combobox__trigger, .reg--cb-light .datepicker__input, .reg--cb-light .daterange__trigger, .reg--cb-light .gridpicker__input { border-color: var(--border-strong); }
.reg--cb-tonal .input, .reg--cb-tonal .select, .reg--cb-tonal .textarea, .reg--cb-tonal .combobox__input, .reg--cb-tonal .combobox__trigger, .reg--cb-tonal .datepicker__input, .reg--cb-tonal .daterange__trigger, .reg--cb-tonal .gridpicker__input { border-color: transparent; background: var(--bg-muted); }
.reg > div { min-height: 0 !important; padding-bottom: 8px !important; }
.reg__label { font: 600 var(--text-xs)/1 var(--font-body); color: var(--fg-muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); padding: 0 24px; }
`;

const LIST_ARGS = { fields: 5, layout: 'collapse', visibleCount: 'auto', barMobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: true, exportAction: true, sort: true, rowActions: 'inline', pagination: 'inside' } as const;

function Page({ cls }: { cls: string }) {
  // The list page as the specimen: header (primary), filter bar (tertiary
  // actions), table, pagination — every register at once.
  return <div className={cls}>{PaginaDeListadoPlayground.render!(LIST_ARGS as never, {} as never)}</div>;
}

/**
 * **Playground · registro.** El registro producto de 4.0.0 es el default del
 * kit; acá quedan las tres variantes que se miraron y NO se adoptaron, para
 * volver a compararlas: controles a 36px, divisores tonales y el borde de los
 * controles (3:1 actual · hairline claro · relleno tonal sin borde). `compare`
 * apila el kit tal cual arriba y la variante abajo.
 */
export const Registro: StoryObj<RegisterArgs> = {
  name: 'Playground · registro',
  parameters: { layout: 'fullscreen' },
  args: { compare: true, controls: 38, dividers: 'kit', controlBorder: 'kit' },
  argTypes: {
    compare: { control: 'boolean', description: 'Kit tal cual arriba, variante abajo' },
    controls: { control: 'inline-radio', options: [38, 36] },
    dividers: { control: 'inline-radio', options: ['kit', 'tonal'] },
    controlBorder: { control: 'inline-radio', options: ['kit', 'light', 'tonal'], description: 'kit 3:1 · light hairline · tonal = relleno sin borde' },
  },
  render: (a) => {
    const cls = [
      'reg',
      a.controls === 36 && 'reg--36',
      a.dividers === 'tonal' && 'reg--tonal',
      a.controlBorder === 'light' && 'reg--cb-light',
      a.controlBorder === 'tonal' && 'reg--cb-tonal',
    ].filter(Boolean).join(' ');
    return (
      <>
        <style>{CSS}</style>
        {a.compare && (
          <>
            <div className="reg__label" style={{ paddingTop: 16 }}>Kit tal cual</div>
            <Page cls="reg" />
            <div className="reg__label">Variante · {a.controls}px · {a.dividers === 'tonal' ? 'sin hairlines' : 'hairlines'} · borde {a.controlBorder}</div>
          </>
        )}
        <Page cls={cls} />
      </>
    );
  },
};
