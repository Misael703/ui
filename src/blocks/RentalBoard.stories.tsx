import type { Meta, StoryObj } from '@storybook/react';
import { RentalBoard } from './RentalBoard';

/**
 * Copy-paste recipe (not shipped). Rental lifecycle kanban: Reservado →
 * Entregado → En uso → Por devolver → Devuelto + an Atrasado column that
 * pulls overdue rentals out of the flow. Cards show días restantes / días
 * de atraso. Source: `src/blocks/RentalBoard.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Rental board',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RentalBoard /> };
