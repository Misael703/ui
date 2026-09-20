import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabList, Tab, TabPanel } from './Layout';

// Hoisted: holds React elements.
const TABS_CHILDREN = (
  <>
    <TabList>
      <Tab value="general">General</Tab>
      <Tab value="inventario">Inventario</Tab>
      <Tab value="pagos">Pagos</Tab>
    </TabList>
    <TabPanel value="general">Datos del producto.</TabPanel>
    <TabPanel value="inventario">Stock por sucursal.</TabPanel>
    <TabPanel value="pagos">Historial de pagos.</TabPanel>
  </>
);

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  tags: ['autodocs'],
  args: { defaultValue: 'general', children: TABS_CHILDREN },
  argTypes: {
    variant: { control: 'inline-radio', options: ['underline', 'plain'] },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * **Variants + sliding indicator.** The active indicator is ONE element that
 * slides between tabs (not a per-tab cross-fade) — switch tabs to see it.
 * `variant="underline"` (default) keeps the full-width gray baseline;
 * `variant="plain"` omits it (indicator only), for open canvas where the
 * baseline would float. The slide respects `prefers-reduced-motion`.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>variant=&quot;underline&quot; (default · con baseline)</div>
        <Tabs defaultValue="general">
          <TabList>
            <Tab value="general">General</Tab>
            <Tab value="inventario">Inventario</Tab>
            <Tab value="pagos">Historial de pagos</Tab>
          </TabList>
          <TabPanel value="general">Datos del producto.</TabPanel>
          <TabPanel value="inventario">Stock por sucursal.</TabPanel>
          <TabPanel value="pagos">Historial de pagos.</TabPanel>
        </Tabs>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>variant=&quot;plain&quot; (sin baseline · canvas abierto)</div>
        <Tabs defaultValue="general" variant="plain">
          <TabList>
            <Tab value="general">General</Tab>
            <Tab value="inventario">Inventario</Tab>
            <Tab value="pagos">Historial de pagos</Tab>
          </TabList>
          <TabPanel value="general">Datos del producto.</TabPanel>
          <TabPanel value="inventario">Stock por sucursal.</TabPanel>
          <TabPanel value="pagos">Historial de pagos.</TabPanel>
        </Tabs>
      </div>
    </div>
  ),
};
