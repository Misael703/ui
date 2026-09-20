import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tree, type TreeNodeData } from './Display3';
import { Folder, Package } from './Icons';

// Hoisted: nodes hold React elements (icon).
const TREE_NODES: TreeNodeData[] = [
  {
    id: 'northwind', label: 'Northwind Builders', icon: <Folder size={14} />,
    children: [
      {
        id: 'centro', label: 'Sucursal Centro', icon: <Folder size={14} />,
        children: [
          { id: 'bodega-a', label: 'Bodega A', icon: <Package size={14} />, meta: '142' },
          { id: 'bodega-b', label: 'Bodega B', icon: <Package size={14} />, meta: '89' },
        ],
      },
      {
        id: 'sur', label: 'Sucursal Sur', icon: <Folder size={14} />,
        children: [
          { id: 'bodega-c', label: 'Bodega C', icon: <Package size={14} /> },
        ],
      },
    ],
  },
  { id: 'proveedores', label: 'Proveedores', icon: <Folder size={14} />, meta: '67' },
];

const meta = {
  title: 'Components/Tree',
  component: Tree,
  tags: ['autodocs'],
  args: { nodes: TREE_NODES },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Keyboard-operable (WAI-ARIA TreeView, since v1.3.0). Focus the tree with
 * Tab and try: ↑/↓ move between visible nodes, →/← expand/collapse or jump
 * to child/parent, Home/End go to the first/last, Enter/Space select. The
 * chevron is decorative (outside the tab order); state is exposed on the
 * `treeitem` via `aria-expanded`.
 */
export const Default: Story = {
  render: (a) => {
    const [selected, setSelected] = React.useState('bodega-a');
    return (
      <Tree
        {...a}
        defaultExpanded={['northwind', 'centro']}
        selectedId={selected}
        onSelect={setSelected}
      />
    );
  },
};
