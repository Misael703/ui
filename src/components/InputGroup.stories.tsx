import type { Meta, StoryObj } from '@storybook/react';
import { InputGroup, InputGroupAddon, Input } from './Form';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  subcomponents: { InputGroupAddon },
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithPrefix: Story = {
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
