import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Modal, Drawer } from './Overlay';
import { Button } from './Button';

export default { title: 'Overlay/Modal & Drawer', tags: ['autodocs'] } as Meta;

/**
 * Foco gestionado (a11y): al abrir, el foco entra al diálogo y queda atrapado
 * (Tab/Shift+Tab ciclan dentro); Esc cierra; al cerrar, el foco vuelve al
 * disparador. `role="dialog"` + `aria-modal` + `aria-labelledby` al título.
 */
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

/**
 * Pit of success (post-1.10.0): un grid de 2 columnas que antes provocaba
 * scrollbar horizontal feo ahora se contiene/reflowea con gracia. El body
 * clipea en x y sólo scrollea en y.
 */
export const ModalGridDosColumnas: StoryObj = {
  render: () => {
    const [o, setO] = React.useState(true);
    return (
      <>
        <Button onClick={() => setO(true)}>Abrir Modal</Button>
        <Modal open={o} onClose={() => setO(false)} title="Editar chofer" size="md">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['Nombre', 'RUT', 'Patente asignada', 'Teléfono de contacto largo', 'Email', 'Licencia clase'].map((l) => (
              <label key={l} style={{ display: 'grid', gap: 4, minWidth: 0 }}>
                <span className="label">{l}</span>
                <input className="input" placeholder={l} />
              </label>
            ))}
          </div>
        </Modal>
      </>
    );
  },
};
