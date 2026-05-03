import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible';
import { ChevronDown } from './Icons';

export default { title: 'Layout/Collapsible', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger style={{ fontWeight: 600, color: 'var(--color-brand-blue)' }}>
        Mostrar más detalles
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-subtle)', borderRadius: 8 }}>
          Contenido revelado al hacer click. A diferencia del <code>Accordion</code>,
          aquí no hay grupo: este collapse es independiente y puede ir solo o anidado.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const FiltrosAvanzados: StoryObj = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger
        className="btn btn--outline btn--md"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        Filtros avanzados <ChevronDown size={14} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <div>SKU: <code>ELT-12-AC</code></div>
          <div>Categoría: Eléctrico</div>
          <div>Stock {'>'} 0</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Controlado: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <p style={{ marginBottom: 12, color: 'var(--fg-muted)' }}>
          Estado externo: <strong>{open ? 'abierto' : 'cerrado'}</strong>
        </p>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>
            <span>Toggle controlado</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div style={{ marginTop: 8 }}>El padre maneja el estado.</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};
