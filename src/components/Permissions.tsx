'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

export interface PermissionRole { id: string; label: React.ReactNode }
export interface PermissionAction { id: string; label: React.ReactNode; description?: React.ReactNode }

export interface PermissionMatrixProps extends Omit<React.HTMLAttributes<HTMLTableElement>, 'onChange'> {
  roles: PermissionRole[];
  actions: PermissionAction[];
  /** Map de roleId → set de actionIds permitidos */
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({
  roles, actions, value, onChange, readOnly, className, ...rest
}: PermissionMatrixProps) {
  const has = (roleId: string, actionId: string) => (value[roleId] ?? []).includes(actionId);

  const toggle = (roleId: string, actionId: string) => {
    if (readOnly) return;
    const current = new Set(value[roleId] ?? []);
    if (current.has(actionId)) current.delete(actionId);
    else current.add(actionId);
    onChange({ ...value, [roleId]: Array.from(current) });
  };

  const toggleAllForRole = (roleId: string, allow: boolean) => {
    if (readOnly) return;
    onChange({ ...value, [roleId]: allow ? actions.map((a) => a.id) : [] });
  };

  return (
    <div className={cx('permissions', className)}>
      <table className="permissions__table" {...rest}>
        <thead>
          <tr>
            <th scope="col" className="permissions__action-col">Acción</th>
            {roles.map((r) => {
              const count = (value[r.id] ?? []).length;
              const all = count === actions.length;
              return (
                <th key={r.id} scope="col" className="permissions__role-col">
                  <div className="permissions__role-head">
                    <span>{r.label}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        className="permissions__role-toggle"
                        onClick={() => toggleAllForRole(r.id, !all)}
                      >
                        {all ? 'Quitar todos' : 'Marcar todos'}
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id}>
              <th scope="row" className="permissions__action-cell">
                <div>{a.label}</div>
                {a.description && <div className="permissions__action-desc">{a.description}</div>}
              </th>
              {roles.map((r) => (
                <td key={r.id} className="permissions__cell">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={has(r.id, a.id)}
                    disabled={readOnly}
                    onChange={() => toggle(r.id, a.id)}
                    aria-label={`${typeof a.label === 'string' ? a.label : a.id} para ${typeof r.label === 'string' ? r.label : r.id}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
