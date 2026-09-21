import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LocaleProvider } from '../locale';
import { Modal } from '../components/Overlay';
import { DataTable } from '../components/DataTable';
import { Pagination } from '../components/Inputs';
import { Button } from '../components/Button';
import { SectionTitle } from './_helpers';

const meta = { title: 'Foundations/Localization', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

export const LocaleProviderStory: StoryObj = {
  name: 'LocaleProvider',
  render: () => {
    const [openEs, setOpenEs] = React.useState(false);
    const [openEn, setOpenEn] = React.useState(false);
    const cols = [
      { key: 'name', header: 'Producto', accessor: () => '—' },
      { key: 'sku', header: 'SKU', accessor: () => '—' },
    ];
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <SectionTitle>Localization (LocaleProvider)</SectionTitle>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0 }}>
          ~80 hardcoded Spanish strings live in <code>esMessages</code>. Wrap your tree in{' '}
          <code>{`<LocaleProvider messages={{...}}>`}</code> to override all or some keys.
          Without a provider, everything renders in Spanish (default).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h3 className="h3" style={{ marginTop: 0 }}>Default (Spanish)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Button onClick={() => setOpenEs(true)}>Abrir modal</Button>
              <Modal open={openEs} onClose={() => setOpenEs(false)} title="Confirmar acción">
                <p>Look at the ✕ button above: its <code>aria-label</code> is the locale key.</p>
              </Modal>
              <DataTable rows={[]} rowKey={(r: { id: string }) => r.id} columns={cols} />
              <Pagination page={1} pageSize={10} total={25} onPageChange={() => {}} />
            </div>
          </div>

          <div>
            <h3 className="h3" style={{ marginTop: 0 }}>Override to English</h3>
            <LocaleProvider
              messages={{
                'modal.close': 'Close dialog',
                'table.empty': 'No data',
                'pagination.label': 'Pagination',
                'pagination.prev': 'Previous page',
                'pagination.next': 'Next page',
                'pagination.range': '{from}–{to} of {total}',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Button onClick={() => setOpenEn(true)}>Open modal</Button>
                <Modal open={openEn} onClose={() => setOpenEn(false)} title="Confirm action">
                  <p>Same Modal, close-button aria-label now reads "Close dialog".</p>
                </Modal>
                <DataTable rows={[]} rowKey={(r: { id: string }) => r.id} columns={cols} />
                <Pagination page={1} pageSize={10} total={25} onPageChange={() => {}} />
              </div>
            </LocaleProvider>
          </div>
        </div>

        <p style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 8 }}>
          Tip: pass only the keys you want to change; the rest fall back to <code>esMessages</code> via
          shallow merge. Templates like <code>{`{from}–{to} de {total}`}</code> are resolved with the
          <code>format()</code> helper exported by the kit.
        </p>
      </div>
    );
  },
};
