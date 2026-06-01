import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AppShell } from '../src/components/AppShell';

/**
 * AppShell props (v1.31+): single flat interface — no more discriminated
 * union. The `headerLayout` prop was removed when the kit consolidated to a
 * single layout. The `_typeContract` functions below pin removed props as
 * type errors (validated by `tsc --noEmit`, not by the runtime).
 */
const sections = [{ items: [{ id: 'home', label: 'Inicio', href: '#' }] }];

describe('AppShell props', () => {
  it('renders with header slots', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }} sections={sections}>
        contenido
      </AppShell>,
    );
    expect(container.querySelector('.appshell--header-top')).toBeTruthy();
    expect(container.querySelector('.appshell__header-center')).toBeTruthy();
  });

  it('renders without sections (top-bar-only)', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }}>
        contenido
      </AppShell>,
    );
    expect(container.querySelector('.appshell--no-nav')).toBeTruthy();
    expect(container.querySelector('.appshell__sidebar')).toBeNull();
  });
});

// Type-level contract. Each @ts-expect-error MUST suppress a real error;
// if the prop becomes accepted again, tsc fails the build.
function _typeContractRejectsHeaderLayout() {
  return (
    <AppShell
      sections={sections}
      // @ts-expect-error — `headerLayout` was removed in 1.31 (only one layout exists)
      headerLayout="top"
      header={{ center: 'x' }}
    >
      x
    </AppShell>
  );
}

function _typeContractRejectsBrand() {
  return (
    <AppShell
      sections={sections}
      // @ts-expect-error — `brand` was removed in 1.31 (use `header.center`)
      brand="x"
    >
      x
    </AppShell>
  );
}

function _typeContractRejectsTopbar() {
  return (
    <AppShell
      sections={sections}
      // @ts-expect-error — `topbar` was removed in 1.31
      topbar={<span>x</span>}
    >
      x
    </AppShell>
  );
}
