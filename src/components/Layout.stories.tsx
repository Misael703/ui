import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
  Tabs, TabList, Tab, TabPanel, Tooltip, Stepper,
  Divider, Stack, HStack, VStack, Container, Grid,
  KeyValue, KeyValueRow, ListGroup, ListGroupItem,
} from './Layout';
import { Button } from './Button';
import { Badge } from './Display';

export default { title: 'Layout/General', tags: ['autodocs'] } as Meta;

export const TabsBasicos: StoryObj = {
  render: () => (
    <Tabs defaultValue="general">
      <TabList>
        <Tab value="general">General</Tab>
        <Tab value="inventario">Inventario</Tab>
        <Tab value="pagos">Pagos</Tab>
      </TabList>
      <TabPanel value="general">Datos del producto.</TabPanel>
      <TabPanel value="inventario">Stock por sucursal.</TabPanel>
      <TabPanel value="pagos">Historial de pagos.</TabPanel>
    </Tabs>
  ),
};

export const TooltipBasico: StoryObj = {
  render: () => (
    <Tooltip label="Esto es un tooltip">
      <Button variant="ghost">Pasa el mouse</Button>
    </Tooltip>
  ),
};

export const DividerHorizontal: StoryObj = {
  render: () => (
    <div style={{ width: 320 }}>
      <p>Bloque superior</p>
      <Divider />
      <p>Bloque inferior</p>
    </div>
  ),
};

export const DividerVertical: StoryObj = {
  render: () => (
    <HStack gap={4} align="center" style={{ height: 40 }}>
      <span>Item A</span>
      <Divider orientation="vertical" />
      <span>Item B</span>
      <Divider orientation="vertical" />
      <span>Item C</span>
    </HStack>
  ),
};

export const StackHorizontal: StoryObj = {
  render: () => (
    <HStack gap={3}>
      <Button>Guardar</Button>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="outline">Vista previa</Button>
    </HStack>
  ),
};

export const StackVertical: StoryObj = {
  render: () => (
    <VStack gap={2} style={{ maxWidth: 280 }}>
      <Button>Acción 1</Button>
      <Button variant="outline">Acción 2</Button>
      <Button variant="ghost">Acción 3</Button>
    </VStack>
  ),
};

export const GridDemo: StoryObj = {
  render: () => (
    <Grid minColWidth={180} gap={4}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8, textAlign: 'center' }}>
          Item {n}
        </div>
      ))}
    </Grid>
  ),
};

export const ContainerDemo: StoryObj = {
  render: () => (
    <Container size="md">
      <div style={{ padding: 24, background: 'var(--bg-subtle)', borderRadius: 8 }}>
        Container size="md" — limita el ancho a 768px y centra horizontalmente.
      </div>
    </Container>
  ),
};

export const KeyValueDemo: StoryObj = {
  render: () => (
    <KeyValue>
      <KeyValueRow label="Cliente">Constructora Norte SpA</KeyValueRow>
      <KeyValueRow label="RUT">76.123.456-7</KeyValueRow>
      <KeyValueRow label="Pedido">#1042</KeyValueRow>
      <KeyValueRow label="Estado"><Badge variant="success">Despachado</Badge></KeyValueRow>
      <KeyValueRow label="Total">$1.245.000</KeyValueRow>
      <KeyValueRow label="Fecha">2026-04-29 14:32</KeyValueRow>
    </KeyValue>
  ),
};

export const ListGroupDemo: StoryObj = {
  render: () => (
    <ListGroup style={{ maxWidth: 420 }}>
      {['Cemento gris 42.5kg', 'Fierro corrugado 12mm', 'Pintura látex 1gal', 'Brocha angular 2"'].map((item, i) => (
        <ListGroupItem key={i} interactive>
          <HStack gap={3} justify="space-between" style={{ width: '100%' }}>
            <span>{item}</span>
            <Badge variant="neutral">x{i + 1}</Badge>
          </HStack>
        </ListGroupItem>
      ))}
    </ListGroup>
  ),
};

export const StepperBasico: StoryObj = {
  render: () => {
    const [c, setC] = React.useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Stepper
          current={c}
          steps={[
            { label: 'Cliente', description: 'Datos básicos' },
            { label: 'Productos', description: 'Selección' },
            { label: 'Pago', description: 'Método y total' },
            { label: 'Confirmar' },
          ]}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => setC((c) => Math.max(0, c - 1))}>Atrás</Button>
          <Button onClick={() => setC((c) => Math.min(3, c + 1))}>Siguiente</Button>
        </div>
      </div>
    );
  },
};
