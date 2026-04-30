import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Combobox, DatePicker, FileUpload } from './Pickers';

export default { title: 'Avanzados/Pickers', tags: ['autodocs'] } as Meta;

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
    return <DatePicker value={d} onChange={setD} />;
  },
};

export const FileUploadBasico: StoryObj = {
  render: () => (
    <FileUpload onFiles={(f) => console.log(f)} hint="PDF o imagen, máx 5MB" accept="application/pdf,image/*" />
  ),
};
