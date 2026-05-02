import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PermissionMatrix } from '../src/components/Permissions';

const roles = [{ id: 'admin', label: 'Admin' }, { id: 'viewer', label: 'Viewer' }];
const actions = [{ id: 'read', label: 'Leer' }, { id: 'write', label: 'Escribir' }];

describe('PermissionMatrix', () => {
  it('renders roles as columns and actions as rows', () => {
    render(
      <PermissionMatrix
        roles={roles}
        actions={actions}
        value={{ admin: ['read', 'write'], viewer: ['read'] }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Leer')).toBeInTheDocument();
    expect(screen.getByText('Escribir')).toBeInTheDocument();
  });

  it('toggles a permission on checkbox click', () => {
    const onChange = vi.fn();
    render(
      <PermissionMatrix
        roles={roles}
        actions={actions}
        value={{ admin: ['read'], viewer: [] }}
        onChange={onChange}
      />
    );
    const cb = screen.getByLabelText('Escribir para Admin') as HTMLInputElement;
    expect(cb.checked).toBe(false);
    fireEvent.click(cb);
    expect(onChange).toHaveBeenCalledWith({ admin: ['read', 'write'], viewer: [] });
  });

  it('marks/unmarks all permissions for a role', () => {
    const onChange = vi.fn();
    render(
      <PermissionMatrix
        roles={roles}
        actions={actions}
        value={{ admin: [], viewer: [] }}
        onChange={onChange}
      />
    );
    const buttons = screen.getAllByText('Marcar todos');
    fireEvent.click(buttons[0]); // Admin
    expect(onChange).toHaveBeenCalledWith({ admin: ['read', 'write'], viewer: [] });
  });

  it('uses styled Checkbox component (not raw input)', () => {
    const { container } = render(
      <PermissionMatrix roles={roles} actions={actions} value={{}} onChange={() => {}} />
    );
    const checks = container.querySelectorAll('td.permissions__cell label.check');
    expect(checks.length).toBe(roles.length * actions.length);
    expect(checks[0].querySelector('.check__box')).not.toBeNull();
  });
});
