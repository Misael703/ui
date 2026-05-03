import type { Meta, StoryObj } from '@storybook/react';
import { Hero, Testimonial, CategoryNav } from './Marketing';
import { Button } from './Button';

export default { title: 'ERP/Marketing', tags: ['autodocs'] } as Meta;

export const HeroBrand: StoryObj = {
  render: () => (
    <Hero
      eyebrow="Patio Constructor"
      title="Materiales para tu obra"
      subtitle="Despachamos en 24h dentro de Santiago. Cotiza en línea o llámanos."
      actions={
        <>
          <Button>Empezar a cotizar</Button>
          <Button variant="outline">Ver catálogo</Button>
        </>
      }
    />
  ),
};

export const HeroImage: StoryObj = {
  render: () => (
    <Hero
      image="https://picsum.photos/id/1015/1200/400"
      eyebrow="Oferta de la semana"
      title="20% off en cementos"
      subtitle="Solo del 29 al 5 de mayo"
      actions={<Button>Aprovechar</Button>}
      size="lg"
    />
  ),
};

export const HeroSubtle: StoryObj = {
  render: () => (
    <Hero
      tone="subtle"
      align="start"
      size="sm"
      title="¿Eres empresa?"
      subtitle="Crea una cuenta corriente y obtén precios mayoristas."
      actions={<Button>Conocer más</Button>}
    />
  ),
};

export const TestimonialDemo: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Testimonial
        quote="Llevo 3 años comprándoles. Despachan rápido y los precios son honestos. Recomendado para constructoras chicas."
        author="Patricio Rojas"
        role="Gerente de obra"
        company="Constructora Norte SpA"
        rating={5}
      />
    </div>
  ),
};

export const CategoryNavDemo: StoryObj = {
  render: () => (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 8 }}>
      <CategoryNav
        categories={[
          {
            id: 'construccion',
            label: 'Construcción',
            groups: [
              { title: 'Cementos y áridos', items: [{ label: 'Cemento gris' }, { label: 'Cemento blanco' }, { label: 'Arena' }] },
              { title: 'Fierros', items: [{ label: 'Corrugado 8mm' }, { label: 'Corrugado 12mm' }, { label: 'Mallas' }] },
            ],
          },
          {
            id: 'electrico',
            label: 'Eléctrico',
            groups: [
              { title: 'Cables', items: [{ label: 'THHN' }, { label: 'NYM' }] },
              { title: 'Enchufes', items: [{ label: 'Schuko' }, { label: 'USA' }] },
            ],
          },
          { id: 'pintura', label: 'Pintura', href: '#' },
          { id: 'herramientas', label: 'Herramientas', href: '#' },
        ]}
      />
    </div>
  ),
};
