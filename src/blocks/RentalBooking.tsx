'use client';
/**
 * Block: rental booking (Domain → Rentools). The core flow of the business:
 * pick a tool, choose a date range, see the cost break down (días × tarifa
 * + garantía), confirm. Two columns: the form on the left, a sticky cost
 * summary on the right that recalculates as the dates change.
 *
 * UX rationale:
 * - The cost summary is LIVE and sticky: the renter's main question is
 *   "¿cuánto me sale?" and the answer must update the instant they pick
 *   dates, always in view.
 * - The deposit (garantía) is shown as a SEPARATE line from the rental
 *   cost — it's refundable, not a charge, and conflating them erodes trust.
 * - Uses the kit's `DateRangePicker` (locale-aware, es-CL dd-mm-aaaa by
 *   default) for the period, the single most important input.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  DateRangePicker,
  OrderSummary,
  Button,
  Badge,
  Select,
  FormField,
  type DateRange,
} from '../index';

const TOOL = {
  name: 'Generador eléctrico 5kVA',
  sku: 'GEN-5K',
  ratePerDay: 25000,
  deposit: 200000,
};

// Inclusive day count between two dates (a 1-day rental = same from/to + 1).
function dayCount(range: DateRange): number {
  if (!range.from || !range.to) return 0;
  const ms = range.to.getTime() - range.from.getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function RentalBooking(): React.ReactElement {
  const [range, setRange] = React.useState<DateRange>({ from: null, to: null });
  const [delivery, setDelivery] = React.useState('retiro');

  const days = dayCount(range);
  const rental = days * TOOL.ratePerDay;
  const deliveryFee = delivery === 'despacho' ? 15000 : 0;
  const total = rental + deliveryFee;
  const hasRange = days > 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <PageHeader title="Reservar equipo" description={TOOL.name} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 32, alignItems: 'start', marginTop: 24 }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="h4" style={{ margin: 0 }}>{TOOL.name}</h3>
                  <span className="cell-meta cell-mono">{TOOL.sku}</span>
                </div>
                <Badge variant="success">Disponible</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <FormField label="Periodo de arriendo" htmlFor="rb-range" hint="Selecciona las fechas de retiro y devolución">
                <DateRangePicker id="rb-range" value={range} onChange={setRange} minDate={new Date()} />
              </FormField>

              <FormField label="Entrega" htmlFor="rb-delivery">
                <Select id="rb-delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                  <option value="retiro">Retiro en sucursal (gratis)</option>
                  <option value="despacho">Despacho a obra (+$15.000)</option>
                </Select>
              </FormField>
            </CardBody>
          </Card>
        </div>

        {/* Live cost summary — sticky */}
        <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardBody>
              <h3 className="h4" style={{ marginTop: 0, marginBottom: 4 }}>Resumen</h3>
              <p className="cell-meta" style={{ margin: '0 0 16px' }}>
                {hasRange ? `${days} ${days === 1 ? 'día' : 'días'} de arriendo` : 'Selecciona el periodo'}
              </p>

              <OrderSummary
                rows={[
                  { label: `Tarifa (${days} × $${TOOL.ratePerDay.toLocaleString('es-CL')})`, value: `$${rental.toLocaleString('es-CL')}` },
                  ...(deliveryFee ? [{ label: 'Despacho', value: `$${deliveryFee.toLocaleString('es-CL')}` }] : []),
                  { label: 'Total arriendo', value: `$${total.toLocaleString('es-CL')}`, emphasis: true },
                ]}
              />

              {/* Deposit is a separate, refundable line — never mixed with the charge. */}
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="cell-meta">Garantía (reembolsable)</span>
                <span className="cell-mono">${TOOL.deposit.toLocaleString('es-CL')}</span>
              </div>

              <Button fullWidth disabled={!hasRange} style={{ marginTop: 16 }}>
                {hasRange ? 'Confirmar reserva' : 'Elige las fechas'}
              </Button>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
