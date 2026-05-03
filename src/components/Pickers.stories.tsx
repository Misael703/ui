import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Combobox, DatePicker, FileUpload } from './Pickers';

export default { title: 'Forms/Pickers', tags: ['autodocs'] } as Meta;

const opts = [
  { value: 'tld', label: 'Taladro percutor', description: '700W · 13mm' },
  { value: 'srr', label: 'Sierra circular', description: '1500W · 7¼"' },
  { value: 'lij', label: 'Lijadora orbital', description: '300W' },
  { value: 'esm', label: 'Esmeril angular', description: '850W' },
];

export const ComboboxBasico: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<string | null>(null);
    return <Combobox value={v} onChange={setV} options={opts} placeholder="Buscar producto…" />;
  },
};

export const DatePickerBasico: StoryObj = {
  render: () => {
    const [d, setD] = React.useState<Date | null>(null);
    return (
      <div>
        <DatePicker value={d} onChange={setD} />
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-muted)' }}>
          Formato deriva de <code>configureBrand().locale</code> (default <code>es-CL</code> → <code>dd-mm-aaaa</code>).
        </p>
      </div>
    );
  },
};

export const DatePickerFormatos: StoryObj = {
  render: () => {
    const [d, setD] = React.useState<Date | null>(new Date(2026, 4, 2));
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 320 }}>
        <label>
          <strong>auto (es-CL → dmy)</strong>
          <DatePicker value={d} onChange={setD} format="auto" />
        </label>
        <label>
          <strong>iso</strong>
          <DatePicker value={d} onChange={setD} format="iso" />
        </label>
        <label>
          <strong>dmy explícito</strong>
          <DatePicker value={d} onChange={setD} format="dmy" />
        </label>
        <label>
          <strong>mdy explícito</strong>
          <DatePicker value={d} onChange={setD} format="mdy" />
        </label>
      </div>
    );
  },
};

export const FileUploadBasico: StoryObj = {
  render: () => (
    <FileUpload onFiles={(f) => console.log(f)} hint="PDF o imagen, máx 5MB" accept="application/pdf,image/*" />
  ),
};
