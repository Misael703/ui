'use client';
/**
 * Block: full-page error state — something failed (server error, fetch
 * timeout, broken integration). Includes a primary retry CTA and a
 * secondary support contact. Pair with `EmptyStatePage` (no data) and
 * `NotFound` (wrong URL).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Button } from '../index';
import { AlertTriangle } from '../components/Icons';

export interface ErrorPageProps {
  /** Optional retry handler (e.g. re-fetch the page data). */
  onRetry?: () => void;
}

export function ErrorPage({ onRetry }: ErrorPageProps = {}): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      {/* Bare centered layout (no Card) — matches NotFound. */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
            <div
              aria-hidden="true"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--bg-danger-subtle, rgba(239, 68, 68, 0.1))',
                color: 'var(--fg-danger, #b91c1c)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <div>
              <h1 className="h3" style={{ margin: '0 0 4px' }}>Algo salió mal</h1>
              <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: 0 }}>
                No pudimos cargar la información. Intenta de nuevo o contacta soporte si el error persiste.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, alignItems: 'center' }}>
              {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
              <a href="mailto:soporte@empresa.cl" className="caption">Contactar soporte</a>
            </div>
      </div>
    </div>
  );
}
