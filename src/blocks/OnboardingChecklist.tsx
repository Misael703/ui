'use client';
/**
 * Block: onboarding / activation checklist. A card with a sequenced set of
 * setup tasks; each task has a clickable CTA that opens the right flow.
 * Progress bar at the top shows the completion ratio.
 *
 * The actual completion state lives in the consumer (the user's profile,
 * a feature flag, a count from the API). This recipe stubs it with local
 * state — replace the `useState` with your real source of truth.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Card, CardHeader, CardBody, Button, Progress } from '../index';
import { Check } from '../components/Icons';

interface Task {
  id: string;
  title: string;
  description: string;
  cta: string;
}

const TASKS: Task[] = [
  { id: 'profile',  title: 'Completa tu perfil',         description: 'Sube una foto y verifica tu correo.', cta: 'Ir a perfil' },
  { id: 'company',  title: 'Configura tu empresa',       description: 'Razón social, RUT y datos de facturación.', cta: 'Configurar' },
  { id: 'products', title: 'Carga tus primeros productos', description: 'Importa desde CSV o crea uno manual.', cta: 'Cargar productos' },
  { id: 'team',     title: 'Invita a tu equipo',         description: 'Da acceso a vendedores y administradores.', cta: 'Invitar' },
  { id: 'payment',  title: 'Conecta un método de pago',  description: 'Necesario para emitir facturas electrónicas.', cta: 'Conectar' },
];

export function OnboardingChecklist(): React.ReactElement {
  // Replace with real state from your backend / store.
  const [done, setDone] = React.useState<Set<string>>(new Set(['profile']));

  const total = TASKS.length;
  const completed = done.size;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
            <div>
              <h2 className="h3" style={{ margin: '0 0 4px' }}>Configura tu cuenta</h2>
              <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: 0 }}>
                {allDone
                  ? '¡Listo! Ya tienes todo configurado.'
                  : `${completed} de ${total} pasos completados`}
              </p>
            </div>
            <span className="cell-mono" style={{ fontWeight: 600, fontSize: 18 }}>{pct}%</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Progress value={pct} variant={allDone ? 'success' : 'blue'} />
          </div>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {TASKS.map((task) => {
              const isDone = done.has(task.id);
              return (
                <li
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: '0 0 auto',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isDone ? 'var(--color-success, #16a34a)' : 'var(--bg-muted)',
                        color: isDone ? 'var(--color-white)' : 'var(--fg-muted)',
                        display: 'grid',
                        placeItems: 'center',
                        border: isDone ? 'none' : '1px solid var(--border-default)',
                      }}
                    >
                      {isDone && <Check size={16} />}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--fg-muted)' : 'var(--fg-default)' }}>
                        {task.title}
                      </div>
                      <div className="cell-meta">{task.description}</div>
                    </div>
                  </div>
                  {!isDone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDone((curr) => new Set(curr).add(task.id))}
                    >
                      {task.cta}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
