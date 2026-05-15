import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu } from './NavigationMenu';

export default { title: 'Navigation/Navigation Menu', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => (
    <NavigationMenu
      items={[
        { id: 'home', label: 'Inicio', href: '/' },
        {
          id: 'productos',
          label: 'Productos',
          links: [
            { id: 'p1', label: 'Eléctrico', description: 'Tableros, cables, automatización', href: '/productos/electrico' },
            { id: 'p2', label: 'Construcción', description: 'Cementos, áridos, pinturas', href: '/productos/construccion' },
            { id: 'p3', label: 'Herramientas', description: 'Manuales y eléctricas', href: '/productos/herramientas' },
            { id: 'p4', label: 'Plomería', description: 'Tuberías, fittings, válvulas', href: '/productos/plomeria' },
          ],
        },
        {
          id: 'recursos',
          label: 'Recursos',
          links: [
            { id: 'r1', label: 'Catálogo', description: 'Descarga el catálogo completo', href: '/catalogo' },
            { id: 'r2', label: 'Asesoría', description: 'Habla con un experto', href: '/asesoria' },
          ],
        },
        { id: 'contacto', label: 'Contacto', href: '/contacto' },
      ]}
    />
  ),
};
