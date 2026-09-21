import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem } from './DataTable';

// Hoisted into `meta.args.children` (like `Tooltip.stories.tsx`'s
// `TRIGGER`): `children` is a required prop, so satisfying it at the meta
// level lets `Default` drop its own `render` entirely (`Story = {}`).
const ACCORDION_CHILDREN = (
  <>
    <AccordionItem id="envio" title="Envío y plazos">Despachamos en 24-48h hábiles.</AccordionItem>
    <AccordionItem id="dev" title="Devoluciones">Tienes 10 días para devolver productos sin uso.</AccordionItem>
    <AccordionItem id="pago" title="Métodos de pago">Tarjetas, transferencia y crédito empresa.</AccordionItem>
  </>
);

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem },
  tags: ['autodocs'],
  args: { defaultOpen: ['envio'], children: ACCORDION_CHILDREN },
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Each `AccordionItem` wires the trigger to the panel via ARIA (since
 * v1.3.0): the button carries `aria-controls` + `aria-expanded`; the open
 * panel carries `id`, `role="region"` and `aria-labelledby` (stable ids via
 * `React.useId()`). The panel unmounts on close; the behavior didn't change.
 */
export const Default: Story = {};
