import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Slider,
  Progress,
  ProgressCircle,
  TagInput,
  MoneyInput,
  PhoneInput,
  TimePicker,
  RadioGroup,
  CheckboxGroup,
} from './InputsExtra';

export default { title: 'Forms/Avanzados', tags: ['autodocs'] } as Meta;

export const SliderBasico: StoryObj = {
  render: () => {
    const [v, setV] = React.useState(40);
    return <Slider value={v} onChange={setV} showValue />;
  },
};

export const ProgressLineal: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Progress value={25} variant="blue" showLabel />
      <Progress value={60} variant="orange" showLabel />
      <Progress value={90} variant="success" showLabel />
      <Progress value={45} variant="warning" showLabel />
      <Progress value={10} variant="danger" showLabel />
    </div>
  ),
};

export const ProgressCircular: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ProgressCircle value={25} />
      <ProgressCircle value={60} variant="orange" />
      <ProgressCircle value={92} variant="success" size={80} />
    </div>
  ),
};

export const TagInputDemo: StoryObj = {
  render: () => {
    const [tags, setTags] = React.useState<string[]>(['diseño', 'urgente']);
    return <TagInput value={tags} onChange={setTags} placeholder="Agrega un tag y presiona Enter" />;
  },
};

export const MoneyInputCLP: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(125000);
    return <MoneyInput value={v} onChange={setV} />;
  },
};

export const PhoneInputCL: StoryObj = {
  render: () => {
    const [v, setV] = React.useState('');
    return <PhoneInput value={v} onChange={setV} />;
  },
};

export const TimePickerDemo: StoryObj = {
  render: () => {
    const [v, setV] = React.useState('09:30');
    return <TimePicker value={v} onChange={setV} />;
  },
};

export const RadioGroupDemo: StoryObj = {
  render: () => {
    const [v, setV] = React.useState('retiro');
    return (
      <RadioGroup
        value={v}
        onChange={setV}
        name="entrega"
        options={[
          { value: 'retiro', label: 'Retiro en tienda' },
          { value: 'despacho', label: 'Despacho a domicilio' },
          { value: 'obra', label: 'Despacho a obra' },
        ]}
      />
    );
  },
};

export const CheckboxGroupDemo: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<string[]>(['email']);
    return (
      <CheckboxGroup
        value={v}
        onChange={setV}
        options={[
          { value: 'email', label: 'Notificar por email' },
          { value: 'sms', label: 'Notificar por SMS' },
          { value: 'whatsapp', label: 'Notificar por WhatsApp' },
        ]}
      />
    );
  },
};
