'use client';
/**
 * Block: full-page empty state — what the user sees when a collection
 * (orders, products, customers…) has no rows yet. Wraps the `EmptyState`
 * component in a centered page layout with a primary CTA.
 *
 * Pair this with `ErrorPage` (something failed) and `NotFound` (404). The
 * three states share the same composition: icon + title + description +
 * CTA — only the tone, icon, and copy change.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { EmptyState, Button } from '../index';
import { Package } from '../components/Icons';

export function EmptyStatePage(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      {/* Bare centered layout (no Card) — matches NotFound; a full-page state
          doesn't need a bordered container around it. */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <EmptyState
          icon={<Package size={40} />}
          title="Aún no hay pedidos"
          description="Cuando un cliente confirme su primer pedido, vas a verlo aparecer acá."
          action={<Button>Crear pedido manual</Button>}
        />
      </div>
    </div>
  );
}
