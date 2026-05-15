import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Badge, Alert, Skeleton, Spinner, Chip, ChipGroup, ProductCard } from './Display';
import { Button } from './Button';

export default { title: 'Display/General', tags: ['autodocs'] } as Meta;

export const CardBasica: StoryObj = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader>Pedido #1042</CardHeader>
      <CardBody>Cliente: Northwind Builders. 14 ítems.</CardBody>
      <CardFooter>$1.245.000</CardFooter>
    </Card>
  ),
};

export const CardConAccent: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 720 }}>
      <Card accent="brand">
        <CardHeader>Pedido destacado</CardHeader>
        <CardBody>Cliente VIP — atención prioritaria.</CardBody>
      </Card>
      <Card accent="secondary">
        <CardHeader>Promo activa</CardHeader>
        <CardBody>Usa el color secundario de la marca (token `--accent-secondary`).</CardBody>
      </Card>
      <Card accent="success">
        <CardHeader>Despachado</CardHeader>
        <CardBody>Entregado el 28/04 a las 14:32.</CardBody>
      </Card>
      <Card accent="warning">
        <CardHeader>Stock bajo</CardHeader>
        <CardBody>Quedan 3 unidades de SKU ELT-12-AC.</CardBody>
      </Card>
      <Card accent="danger">
        <CardHeader>Pedido vencido</CardHeader>
        <CardBody>5 días de retraso. Contactar al cliente.</CardBody>
      </Card>
      <Card accent="info">
        <CardHeader>Nuevo cliente</CardHeader>
        <CardBody>Registrado hoy desde la web.</CardBody>
      </Card>
      <Card interactive accent="brand">
        <CardHeader>Card clickeable</CardHeader>
        <CardBody>Pasa el mouse para ver el efecto hover.</CardBody>
      </Card>
    </div>
  ),
};

export const Badges: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success" dot>Activo</Badge>
      <Badge variant="warning">Pendiente</Badge>
      <Badge variant="danger">Vencido</Badge>
      <Badge variant="info">Nuevo</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
};

export const Alerts: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert variant="info" title="Aviso">Mantenimiento el sábado.</Alert>
      <Alert variant="success" title="Listo">Pedido confirmado.</Alert>
      <Alert variant="warning" title="Atención">Stock bajo.</Alert>
      <Alert variant="danger" title="Error">No pudimos procesar el pago.</Alert>
    </div>
  ),
};

export const Skeletons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={120} />
    </div>
  ),
};

export const Spinners: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  ),
};

export const Chips: StoryObj = {
  render: () => {
    const [filtros, setFiltros] = React.useState(['Eléctrico', 'Pintura', 'Stock>0']);
    return (
      <ChipGroup>
        {filtros.map((f) => (
          <Chip key={f} active onRemove={() => setFiltros((curr) => curr.filter((x) => x !== f))}>
            {f}
          </Chip>
        ))}
        <Chip>Plomería</Chip>
        <Chip>Construcción</Chip>
      </ChipGroup>
    );
  },
};

export const ProductCardDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720 }}>
      <ProductCard
        sku="ELT-12-AC"
        name="Cemento gris 42.5 kg"
        price="$5.490"
        tag="Oferta"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
      <ProductCard
        sku="FRR-08"
        name="Fierro corrugado 12mm"
        price="$3.290"
        footer={<Button size="sm" variant="outline" fullWidth>Cotizar</Button>}
      />
      <ProductCard
        sku="PNT-01"
        name="Pintura látex blanca 1gal"
        price="$12.990"
        tag="Nuevo"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
    </div>
  ),
};
