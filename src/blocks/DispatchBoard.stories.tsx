import type { Meta, StoryObj } from '@storybook/react';
import { DispatchBoard } from './DispatchBoard';

/**
 * Copy-paste recipe (not shipped). Dispatch operations board — kanban
 * columns mirror the real lifecycle (Por confirmar → Preparando → Listo
 * → En ruta → Entregado), cards surface cliente/zona/ETA/paradas/driver
 * at a glance. The center-of-operation view. Source:
 * `src/blocks/DispatchBoard.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Despachos/Dispatch board',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DispatchBoard /> };
