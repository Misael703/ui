'use client';
/**
 * Block: multi-step form (a "wizard"). Horizontal Stepper at the top
 * spanning the full width, then the form area below (centered, max ~720px),
 * then Back/Next/Finish in a footer. This is the layout Shopify, Stripe
 * Checkout and most modern wizards use — the kit's `Stepper` is designed
 * horizontal (`flex; align-items: center; .stepper__item { flex: 1 }`),
 * so wrap-and-go in a sidebar collapses the labels.
 *
 * State is local. In your app, persist the draft to a store between steps
 * (Redux/Zustand/localStorage) so the user doesn't lose progress on
 * refresh, and use react-hook-form (or similar) per step.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardBody,
  Stepper,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
} from '../index';

const STEPS = [
  { label: 'Cliente',     description: 'Destinatario' },
  { label: 'Productos',   description: 'Items a despachar' },
  { label: 'Despacho',    description: 'Dirección y horario' },
  { label: 'Confirmar',   description: 'Revisa y crea' },
];

export function WizardPage(): React.ReactElement {
  const [step, setStep] = React.useState(0);

  // Replace with react-hook-form or Zustand. Local state shown for clarity.
  const [form, setForm] = React.useState({
    cliente: '',
    items: '',
    direccion: '',
    horario: 'manana',
    notas: '',
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const isLast = step === STEPS.length - 1;
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <PageHeader title="Nueva orden de despacho" description={`Paso ${step + 1} de ${STEPS.length}`} />

      {/* Horizontal stepper — full width, this is what the kit's Stepper is
          designed for (flex; items: flex 1). */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* Form area — centered, narrower than the stepper for readability. */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Card>
          <CardBody>
            {step === 0 && (
              <>
                <h2 className="h4" style={{ marginTop: 0 }}>Cliente</h2>
                <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 16px' }}>
                  Busca o selecciona el cliente destinatario.
                </p>
                <FormField label="Cliente" htmlFor="w-cli">
                  <Input
                    id="w-cli"
                    placeholder="Empezar a tipear…"
                    value={form.cliente}
                    onChange={(e) => set('cliente', e.target.value)}
                  />
                </FormField>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="h4" style={{ marginTop: 0 }}>Productos</h2>
                <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 16px' }}>
                  Lista los SKUs y cantidades. En tu app reemplaza este textarea con un picker real.
                </p>
                <FormField label="Items" htmlFor="w-items" hint="Un SKU por línea, separado del qty por coma">
                  <Textarea
                    id="w-items"
                    rows={6}
                    placeholder="TLD-700, 3&#10;SRR-7, 1&#10;PNT-01, 4"
                    value={form.items}
                    onChange={(e) => set('items', e.target.value)}
                  />
                </FormField>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="h4" style={{ marginTop: 0 }}>Despacho</h2>
                <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 16px' }}>
                  Dirección y ventana de despacho.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label="Dirección" htmlFor="w-addr">
                    <Input
                      id="w-addr"
                      placeholder="Calle, número, comuna"
                      value={form.direccion}
                      onChange={(e) => set('direccion', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Horario" htmlFor="w-time">
                    <Select id="w-time" value={form.horario} onChange={(e) => set('horario', e.target.value)}>
                      <option value="manana">Mañana (9-13h)</option>
                      <option value="tarde">Tarde (14-18h)</option>
                      <option value="full">Todo el día</option>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Notas (opcional)" htmlFor="w-notes">
                  <Textarea
                    id="w-notes"
                    rows={3}
                    placeholder="Llamar al llegar, frágil, dejar con conserje, etc."
                    value={form.notas}
                    onChange={(e) => set('notas', e.target.value)}
                  />
                </FormField>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="h4" style={{ marginTop: 0 }}>Confirmar</h2>
                <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 16px' }}>
                  Revisa los datos antes de crear la orden.
                </p>
                <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8, margin: 0 }}>
                  <dt style={{ color: 'var(--fg-muted)' }}>Cliente</dt>
                  <dd style={{ margin: 0 }}>{form.cliente || <em>—</em>}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>Items</dt>
                  <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{form.items || <em>—</em>}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>Dirección</dt>
                  <dd style={{ margin: 0 }}>{form.direccion || <em>—</em>}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>Horario</dt>
                  <dd style={{ margin: 0 }}>{form.horario}</dd>
                </dl>
              </>
            )}
          </CardBody>
        </Card>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <Button variant="ghost" onClick={back} disabled={step === 0}>Atrás</Button>
          {isLast ? (
            <Button onClick={() => alert('Orden creada')}>Crear orden</Button>
          ) : (
            <Button onClick={next}>Siguiente</Button>
          )}
        </div>
      </div>
    </div>
  );
}
