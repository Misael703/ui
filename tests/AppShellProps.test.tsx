import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AppShell } from '../src/components/AppShell';

/**
 * AppShell props are a discriminated union keyed on `headerLayout`:
 * - `side` (default): brand / brandCollapsed / topbar / user
 * - `top`: header.{left,center,right}
 *
 * Passing a prop that doesn't belong to the active layout is a COMPILE
 * error (not silently ignored at runtime). The runtime tests below prove
 * each layout renders with its own props; the `_typeContract*` functions
 * below pin the type-level contract — validated by `tsc --noEmit`, not by
 * the runtime. If the union ever regresses to a flat interface, the
 * `@ts-expect-error` lines stop erroring and the build fails.
 */
const sections = [{ items: [{ id: 'home', label: 'Inicio', href: '#' }] }];

describe('AppShell discriminated props', () => {
  it('side layout (default) renders with brand/topbar/user', () => {
    const { container } = render(
      <AppShell brand="ALBA" topbar={<span>buscar</span>} user={<span>MO</span>} sections={sections}>
        contenido
      </AppShell>,
    );
    expect(container.querySelector('.appshell')).toBeTruthy();
    expect(container.querySelector('.appshell__brand')).toBeTruthy();
  });

  it('top layout renders with header slots', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'brand' }} sections={sections}>
        contenido
      </AppShell>,
    );
    expect(container.querySelector('.appshell--header-top')).toBeTruthy();
    expect(container.querySelector('.appshell__header-center')).toBeTruthy();
  });
});

// Type-level contract. Each @ts-expect-error MUST suppress a real error;
// if the prop becomes accepted again, tsc fails the build.
function _typeContractSideRejectsHeader() {
  return (
    <AppShell
      sections={sections}
      // @ts-expect-error — `header` solo es válido con headerLayout="top"
      header={{ center: 'x' }}
    >
      x
    </AppShell>
  );
}

function _typeContractTopRejectsBrand() {
  return (
    <AppShell
      headerLayout="top"
      sections={sections}
      // @ts-expect-error — `brand` no es válido en headerLayout="top"
      brand="x"
    >
      x
    </AppShell>
  );
}
