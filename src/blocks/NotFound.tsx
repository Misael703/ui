'use client';
/**
 * Block: 404 / not-found page — the URL doesn't match any route or the
 * record was deleted. Returns the user to a known surface (Home, previous
 * page) instead of trapping them on the dead end.
 *
 * Pair with `EmptyStatePage` (no data) and `ErrorPage` (something failed).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Button } from '../index';

export function NotFound(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div
          aria-hidden="true"
          className="cell-mono"
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            color: 'var(--color-primary)',
            letterSpacing: '-0.04em',
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1 className="h2" style={{ margin: '0 0 8px' }}>Esta página no existe</h1>
        <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>
          La dirección que abriste no corresponde a ninguna página. Puede que la hayan movido o que el enlace esté roto.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button onClick={() => history.back()} variant="outline">Volver atrás</Button>
          <Button onClick={() => { window.location.href = '/'; }}>Ir al inicio</Button>
        </div>
      </div>
    </div>
  );
}
