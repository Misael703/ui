import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Modal, Drawer } from './Overlay';
import { Button } from './Button';

export default { title: 'Overlay', tags: ['autodocs'] } as Meta;

export const ModalBasico: StoryObj = {
  render: () => {
    const [o, setO] = React.useState(false);
    return (
      <>
        <Button onClick={() => setO(true)}>Abrir Modal</Button>
        <Modal
          open={o}
          onClose={() => setO(false)}
          title="Confirmar pedido"
          footer={<><Button variant="ghost" onClick={() => setO(false)}>Cancelar</Button><Button onClick={() => setO(false)}>Confirmar</Button></>}
        >
          ¿Quieres confirmar el pedido?
        </Modal>
      </>
    );
  },
};

export const DrawerLateral: StoryObj = {
  render: () => {
    const [o, setO] = React.useState(false);
    return (
      <>
        <Button onClick={() => setO(true)}>Abrir Drawer</Button>
        <Drawer open={o} onClose={() => setO(false)} title="Filtros">
          <p>Contenido del drawer.</p>
        </Drawer>
      </>
    );
  },
};
