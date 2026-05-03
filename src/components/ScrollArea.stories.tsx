import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './Primitives';

export default { title: 'Layout/ScrollArea', tags: ['autodocs'] } as Meta;

const items = Array.from({ length: 40 }, (_, i) => `Producto ${String(i + 1).padStart(3, '0')}`);

export const Vertical: StoryObj = {
  render: () => (
    <ScrollArea
      maxHeight={240}
      style={{
        width: 320,
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        background: 'var(--bg-surface)',
      }}
    >
      <ul style={{ margin: 0, padding: 12, listStyle: 'none' }}>
        {items.map((it) => (
          <li
            key={it}
            style={{ padding: '8px 4px', borderBottom: '1px solid var(--border-default)' }}
          >
            {it}
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
};

export const Horizontal: StoryObj = {
  render: () => (
    <ScrollArea
      orientation="horizontal"
      style={{ width: 480, border: '1px solid var(--border-default)', borderRadius: 8, padding: 12 }}
    >
      <div style={{ display: 'flex', gap: 12, paddingBottom: 6 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              minWidth: 120,
              height: 80,
              background: 'var(--bg-subtle)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            Card {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Ambos: StoryObj = {
  render: () => (
    <ScrollArea
      orientation="both"
      maxHeight={240}
      style={{ width: 360, border: '1px solid var(--border-default)', borderRadius: 8 }}
    >
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Array.from({ length: 8 }, (_, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-subtle)',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid var(--border-default)',
                }}
              >
                Columna {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 30 }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: 8 }, (_, c) => (
                <td key={c} style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                  R{r + 1}-C{c + 1}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  ),
};
