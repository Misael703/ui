import type { Meta, StoryObj } from '@storybook/react';
import { Input, Textarea, Select, Checkbox, Radio, Switch, FormField, Label, InputGroup, InputGroupAddon } from './Form';

const meta: Meta = { title: 'Forms/Controls', tags: ['autodocs'] };
export default meta;

export const InputBasico: StoryObj = {
  render: () => <Input placeholder="SKU del producto" />,
};

export const InputInvalido: StoryObj = {
  render: () => <Input placeholder="email" defaultValue="no-es-mail" invalid />,
};

export const TextareaBasico: StoryObj = {
  render: () => <Textarea placeholder="Notas del pedido" rows={4} />,
};

export const SelectBasico: StoryObj = {
  render: () => (
    <Select defaultValue="cl">
      <option value="cl">Chile</option>
      <option value="ar">Argentina</option>
      <option value="pe">Perú</option>
    </Select>
  ),
};

export const CheckboxYRadio: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label><Checkbox defaultChecked /> Aceptar términos</label>
      <label><Radio name="x" defaultChecked /> Opción A</label>
      <label><Radio name="x" /> Opción B</label>
    </div>
  ),
};

export const SwitchBasico: StoryObj = {
  render: () => <Switch defaultChecked />,
};

export const FormFieldCompleto: StoryObj = {
  render: () => (
    <FormField label="SKU" htmlFor="sku" required hint="Ej. ELT-12-AC">
      <Input id="sku" placeholder="SKU" />
    </FormField>
  ),
};

export const FormFieldConError: StoryObj = {
  render: () => (
    <FormField label="Email" htmlFor="email" error="Formato inválido">
      <Input id="email" defaultValue="no-mail" invalid />
    </FormField>
  ),
};

export const InputGroupConPrefijo: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <Input placeholder="Monto" />
      </InputGroup>
      <InputGroup>
        <Input placeholder="dominio" />
        <InputGroupAddon>.cl</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input placeholder="api.miempresa" />
        <InputGroupAddon>/v1</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
