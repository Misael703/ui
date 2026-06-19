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

export default { title: 'Forms/Advanced Inputs', tags: ['autodocs'] } as Meta;

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

/**
 * `granularity` parametriza la precisión. El control es un popover custom on-brand
 * (columnas spinner), no el control nativo del navegador. `'minute'` (default)
 * muestra columnas hora + minuto y acepta cualquier minuto (p. ej. 14:37);
 * `'second'` agrega columna de segundos (HH:mm:ss); `'hour'` es una sola columna
 * (value HH:00). `step` adelgaza la columna más fina de la granularity.
 */
export const TimePickerGranularity: StoryObj = {
  render: () => {
    const [minute, setMinute] = React.useState('14:37');
    const [second, setSecond] = React.useState('14:37:09');
    const [hour, setHour] = React.useState('14:00');
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 280 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Minuto (cualquiera) — {minute}</span>
          <TimePicker value={minute} onChange={setMinute} granularity="minute" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Segundo — {second}</span>
          <TimePicker value={second} onChange={setSecond} granularity="second" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Solo hora — {hour}</span>
          <TimePicker value={hour} onChange={setHour} granularity="hour" />
        </label>
      </div>
    );
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
