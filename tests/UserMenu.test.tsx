import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserMenu } from '../src/components/UserMenu';

/**
 * UserMenu — topbar avatar that opens a popover with name/role + actions.
 * The key behaviour (and the reason it's a kit component, not a story
 * recipe) is the 900px collapse: below the breakpoint the trigger text +
 * chevron hide so a narrow header never overflows. That lives in CSS, so a
 * source guard asserts the media query stays present.
 */
const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');

const items = [
  { label: 'Mi perfil' },
  { label: 'Configuración' },
  'separator' as const,
  { label: 'Cerrar sesión', danger: true },
];

describe('UserMenu', () => {
  it('shows name + role in the trigger, panel closed by default', () => {
    const { queryByRole, getByText } = render(<UserMenu name="Ada Lovelace" role="Admin" items={items} />);
    expect(getByText('Ada Lovelace')).toBeTruthy();
    expect(getByText('Admin')).toBeTruthy();
    expect(queryByRole('dialog')).toBeNull();
  });

  it('opens the popover on click with all items', () => {
    const { getByLabelText, getByRole } = render(<UserMenu name="Ada Lovelace" items={items} />);
    fireEvent.click(getByLabelText('Abrir menú de usuario'));
    const dialog = getByRole('dialog');
    expect(within(dialog).getByText('Mi perfil')).toBeTruthy();
    expect(within(dialog).getByText('Cerrar sesión')).toBeTruthy();
  });

  it('marks danger items and closes on select firing onSelect', () => {
    const onSelect = vi.fn();
    const its = [{ label: 'Cerrar sesión', danger: true, onSelect }];
    const { getByLabelText, getByText, queryByRole } = render(<UserMenu name="Ada" items={its} />);
    fireEvent.click(getByLabelText('Abrir menú de usuario'));
    const item = getByText('Cerrar sesión').closest('.usermenu__item') as HTMLElement;
    expect(item.className).toContain('usermenu__item--danger');
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(queryByRole('dialog')).toBeNull();
  });

  it('renders a divider for the "separator" sentinel', () => {
    const { getByLabelText, getByRole } = render(<UserMenu name="Ada" items={items} />);
    fireEvent.click(getByLabelText('Abrir menú de usuario'));
    const dialog = getByRole('dialog');
    // header divider + one separator sentinel = 2 dividers
    expect(dialog.querySelectorAll('.usermenu__divider').length).toBe(2);
  });

  it('renders href items as anchors, honouring linkAs', () => {
    const linkAs = ({ href, className, children }: { href: string; className: string; children: React.ReactNode }) =>
      <a data-link href={href} className={className}>{children}</a>;
    const { getByLabelText, getByText } = render(
      <UserMenu name="Ada" items={[{ label: 'Perfil', href: '/me' }]} linkAs={linkAs} />,
    );
    fireEvent.click(getByLabelText('Abrir menú de usuario'));
    const a = getByText('Perfil').closest('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/me');
    expect(a.hasAttribute('data-link')).toBe(true);
  });

  it('CSS: collapses trigger text + chevron below 900px (anti-overflow guard)', () => {
    expect(css).toMatch(/@media \(max-width: 900px\) \{[\s\S]*\.usermenu__trigger \.usermenu__text/);
    expect(css).toMatch(/\.usermenu__trigger \.usermenu__chevron \{ display: none/);
  });

  it('CSS: hover shape is hybrid — rounded square expanded, circle collapsed', () => {
    // expanded trigger matches the kit squared hover (menu toggle): --radius-md
    expect(css).toMatch(/\.usermenu__trigger \{[\s\S]*?border-radius: var\(--radius-md\)/);
    // collapsed (mobile, avatar-only) goes round so the hover hugs the circular avatar
    expect(css).toMatch(/@media \(max-width: 900px\)[\s\S]*?\.usermenu__trigger \{ padding: 0; gap: 0; border-radius: 999px/);
  });
});
