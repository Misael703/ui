'use client';
/**
 * Block: return inspection / check-in (Domain → Rentools). When a tool comes
 * back, the yard runs a condition checklist, notes any damage, attaches
 * photos, and the deposit is settled: full refund, or a retention for
 * damage / cleaning / missing parts.
 *
 * This pattern exists in NO other domain (not sale, not dispatch) — it's
 * the most rental-specific block.
 *
 * UX rationale:
 * - The deposit math is LIVE: every retention the inspector adds subtracts
 *   from the refund, shown in real time. The renter is standing right
 *   there; the number must be transparent and immediate.
 * - Checklist items are pass/fail switches, not free text — fast to run at
 *   the counter. Free text + photos are for the exceptions (damage).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  Switch,
  Textarea,
  Button,
  Badge,
  Checkbox,
} from '../index';
import { Upload, Check } from '../components/Icons';

const RENTAL = {
  id: 'R-1015',
  tool: 'Cortadora de pavimento',
  sku: 'COR-PV',
  cliente: 'Pavimentos RM',
  deposit: 180000,
};

interface CheckItem {
  id: string;
  label: string;
  hint: string;
}

const CHECKS: CheckItem[] = [
  { id: 'works',    label: 'Funciona correctamente', hint: 'Enciende y opera sin fallas' },
  { id: 'clean',    label: 'Limpio',                 hint: 'Sin barro, concreto ni residuos' },
  { id: 'complete', label: 'Completo',               hint: 'Accesorios y manuales incluidos' },
  { id: 'nodamage', label: 'Sin daños',              hint: 'Carcasa, cable y discos en buen estado' },
];

// Retentions the inspector can apply against the deposit.
const RETENTIONS = [
  { id: 'cleaning', label: 'Limpieza', amount: 20000 },
  { id: 'damage',   label: 'Reparación de daños', amount: 75000 },
  { id: 'missing',  label: 'Accesorios faltantes', amount: 35000 },
  { id: 'late',     label: 'Multa por atraso', amount: 36000 },
];

export function ReturnInspection(): React.ReactElement {
  const [checks, setChecks] = React.useState<Record<string, boolean>>({
    works: true, clean: true, complete: true, nodamage: true,
  });
  const [retentions, setRetentions] = React.useState<Set<string>>(new Set());
  const [notes, setNotes] = React.useState('');

  const setCheck = (id: string, v: boolean) => setChecks((c) => ({ ...c, [id]: v }));
  const toggleRetention = (id: string) =>
    setRetentions((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const retained = RETENTIONS.filter((r) => retentions.has(r.id)).reduce((sum, r) => sum + r.amount, 0);
  const refund = Math.max(0, RENTAL.deposit - retained);
  const allPass = CHECKS.every((c) => checks[c.id]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title="Inspección de devolución"
        description={`${RENTAL.id} · ${RENTAL.tool} (${RENTAL.sku}) · ${RENTAL.cliente}`}
        meta={allPass ? <Badge variant="success">Todo OK</Badge> : <Badge variant="warning">Con observaciones</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 32, alignItems: 'start', marginTop: 24 }}>
        {/* Inspection form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Estado del equipo</h3></CardHeader>
            <CardBody>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {CHECKS.map((c) => (
                  <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.label}</div>
                      <div className="cell-meta">{c.hint}</div>
                    </div>
                    <Switch checked={checks[c.id]} onChange={(e) => setCheck(c.id, e.target.checked)} />
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Observaciones y evidencia</h3></CardHeader>
            <CardBody>
              <Textarea
                rows={3}
                placeholder="Describe cualquier daño o anomalía encontrada…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[0, 1].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label="Adjuntar foto"
                    style={{
                      width: 90, height: 90,
                      border: '1px dashed var(--border-default)',
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      display: 'grid', placeItems: 'center',
                      color: 'var(--fg-muted)', cursor: 'pointer',
                    }}
                  >
                    <Upload size={20} />
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Live deposit settlement — sticky */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Liquidación de garantía</h3></CardHeader>
            <CardBody>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="cell-meta">Garantía retenida</span>
                <span className="cell-mono">${RENTAL.deposit.toLocaleString('es-CL')}</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Retenciones</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RETENTIONS.map((r) => (
                  <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Checkbox checked={retentions.has(r.id)} onChange={() => toggleRetention(r.id)} />
                      <span style={{ fontSize: 13 }}>{r.label}</span>
                    </label>
                    <span className="cell-mono cell-meta">−${r.amount.toLocaleString('es-CL')}</span>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  paddingTop: 12, borderTop: '1px solid var(--border-default)',
                }}
              >
                <span style={{ fontWeight: 600 }}>A devolver</span>
                <span className="cell-mono" style={{ fontWeight: 700, fontSize: 18, color: refund > 0 ? 'var(--color-success, #16a34a)' : 'var(--fg-muted)' }}>
                  ${refund.toLocaleString('es-CL')}
                </span>
              </div>

              <Button fullWidth style={{ marginTop: 16 }}>
                <Check size={16} style={{ marginRight: 6 }} /> Cerrar devolución
              </Button>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
