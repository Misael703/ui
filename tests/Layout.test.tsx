import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  Tabs, TabList, Tab, TabPanel,
  Tooltip, Stepper,
  Divider, Stack, HStack, VStack, Container, Grid,
  KeyValue, KeyValueRow,
  ListGroup, ListGroupItem,
  SectionHeader,
} from '../src/components/Layout';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('Tabs', () => {
  it('shows the active panel', () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">Tab A</Tab>
          <Tab value="b">Tab B</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
      </Tabs>
    );
    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.queryByText('Panel B')).toBeNull();
  });

  it('switches panel on tab click', () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
      </Tabs>
    );
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('Panel B')).toBeInTheDocument();
  });

  const tabs = (variant?: 'underline' | 'plain') => render(
    <Tabs defaultValue="a" variant={variant}>
      <TabList>
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
      </TabList>
      <TabPanel value="a">Panel A</TabPanel>
    </Tabs>
  );

  it('renders ONE shared sliding indicator (aria-hidden), not a per-tab one', () => {
    const { container } = tabs();
    const indicators = container.querySelectorAll('.tabs__indicator');
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).toHaveAttribute('aria-hidden', 'true');
    // It lives inside the tablist, as a sibling of the tabs.
    expect(container.querySelector('.tabs__list > .tabs__indicator')).not.toBeNull();
  });

  it("default variant has no plain modifier; variant='plain' adds it", () => {
    const { container: def } = tabs();
    expect(def.querySelector('.tabs')!.className).not.toContain('tabs--plain');
    const { container: plain } = tabs('plain');
    expect(plain.querySelector('.tabs')!.className).toContain('tabs--plain');
  });

  it('moves aria-selected to the clicked tab (indicator remeasures off it)', () => {
    const { container } = tabs();
    const [a, b] = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(a).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(b);
    expect(b).toHaveAttribute('aria-selected', 'true');
    expect(a).toHaveAttribute('aria-selected', 'false');
  });

  describe('CSS', () => {
    it('per-tab border-bottom indicator is gone (replaced by the slider)', () => {
      const tab = css.match(/\.tabs__tab\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(tab).not.toMatch(/border-bottom/);
      const active = css.match(/\.tabs__tab\.is-active\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(active).not.toMatch(/border-bottom/);
      expect(active).toMatch(/color:\s*var\(--color-primary\)/);
    });

    it('the list is a positioned containing block for the indicator', () => {
      const list = css.match(/\.tabs__list\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(list).toMatch(/position:\s*relative/);
    });

    it("plain variant zeroes the baseline color (keeps the box → no shift)", () => {
      expect(css).toMatch(/\.tabs--plain \.tabs__list\s*\{\s*border-bottom-color:\s*transparent/);
    });

    it('the indicator transitions only when ready and respects reduced motion', () => {
      expect(css).toMatch(/\.tabs__indicator\.is-ready\s*\{[\s\S]*?transition:/);
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.tabs__indicator\.is-ready\s*\{\s*transition:\s*none/);
    });
  });
});

describe('Tooltip', () => {
  it('renders children and shows the tooltip on hover', async () => {
    render(<Tooltip label="Info"><span>Trigger</span></Tooltip>);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    // Tooltip is now JS-driven: not in the DOM until hover/focus.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    const wrap = screen.getByText('Trigger').parentElement as HTMLElement;
    fireEvent.mouseEnter(wrap);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Info');
  });
});

describe('Stepper', () => {
  it('marks current and done steps', () => {
    const { container } = render(
      <Stepper
        current={1}
        steps={[
          { label: 'Cliente' },
          { label: 'Productos' },
          { label: 'Pago' },
        ]}
      />
    );
    expect(container.querySelectorAll('.is-done')).toHaveLength(1);
    expect(container.querySelectorAll('.is-current')).toHaveLength(1);
  });
});

describe('Divider', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('.divider')).toBeInTheDocument();
    expect(container.querySelector('.divider--vertical')).toBeNull();
  });

  it('renders vertical when orientation=vertical', () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.querySelector('.divider--vertical')).toBeInTheDocument();
  });
});

describe('Stack / HStack / VStack', () => {
  it('Stack renders with row direction', () => {
    const { container } = render(<Stack direction="row" gap={4}>x</Stack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.flexDirection).toBe('row');
  });

  it('HStack defaults to row + center align', () => {
    const { container } = render(<HStack>x</HStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.flexDirection).toBe('row');
    expect(el.style.alignItems).toBe('center');
  });

  it('VStack defaults to column', () => {
    const { container } = render(<VStack>x</VStack>);
    expect((container.firstElementChild as HTMLElement).style.flexDirection).toBe('column');
  });
});

describe('Container', () => {
  it('applies size class', () => {
    const { container } = render(<Container size="md">x</Container>);
    expect(container.querySelector('.container--md')).toBeInTheDocument();
  });

  it('is border-box so width:100% includes the inline gutter (no parent overflow)', () => {
    // Regression: content-box + width:100% + paddingInline made the
    // container 2×var(--space-4) wider than its parent, overflowing any
    // width-constrained context. The responsive smoke sweep caught it.
    const { container } = render(<Container size="md">x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.boxSizing).toBe('border-box');
  });
});

describe('Grid', () => {
  it('uses minColWidth template when provided', () => {
    const { container } = render(<Grid minColWidth={200}>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toContain('200px');
  });

  it('uses columns count when minColWidth not provided', () => {
    const { container } = render(<Grid columns={3}>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toContain('repeat(3');
  });
});

describe('KeyValue', () => {
  it('renders rows', () => {
    render(
      <KeyValue>
        <KeyValueRow label="K">V</KeyValueRow>
      </KeyValue>
    );
    expect(screen.getByText('K')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  it('CSS: the value cell can shrink and wraps unspaced tokens (no overflow)', () => {
    // `.kv__v` is the `1fr` grid cell — without `min-width: 0` it keeps its
    // content's min-content width and a long no-space value overflows the card.
    expect(css).toMatch(/\.kv__v \{[^}]*min-width:\s*0[^}]*overflow-wrap:\s*anywhere/);
  });
});

describe('ListGroup', () => {
  it('renders items', () => {
    render(
      <ListGroup>
        <ListGroupItem>A</ListGroupItem>
        <ListGroupItem interactive>B</ListGroupItem>
      </ListGroup>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('TabList horizontal overflow (CSS)', () => {
  const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  it('the strip scrolls horizontally and hides the (phantom) vertical scrollbar', () => {
    const list = css.match(/\.tabs__list\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(list).toMatch(/overflow-x:\s*auto/);
    expect(list).toMatch(/overflow-y:\s*hidden/);
    expect(list).toMatch(/scrollbar-width:\s*none/);
  });

  it('tabs do not shrink when the strip scrolls', () => {
    const tab = css.match(/\.tabs__tab\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(tab).toMatch(/flex-shrink:\s*0/);
  });

  it('the active indicator sits inside the strip so overflow-y:hidden cannot clip it', () => {
    const ind = css.match(/\.tabs__indicator\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(ind).toMatch(/bottom:\s*0/);
    expect(ind).not.toMatch(/bottom:\s*-1px/);
  });
});

describe('SectionHeader', () => {
  it('renders the title at the default heading level (h3) and an actions slot', () => {
    render(<SectionHeader title="Pedidos recientes" actions={<a href="#">Ver todos</a>} />);
    const heading = screen.getByRole('heading', { level: 3, name: 'Pedidos recientes' });
    expect(heading).toHaveClass('section-header__title');
    expect(screen.getByRole('link', { name: 'Ver todos' })).toBeInTheDocument();
  });

  it('honors the `level` prop for the document outline', () => {
    render(<SectionHeader title="Sub" level={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Sub' })).toBeInTheDocument();
  });

  it('wires `titleId` onto the heading so a wrapping <section aria-labelledby> can point at it', () => {
    render(
      <section aria-labelledby="s1">
        <SectionHeader title="Ventas" titleId="s1" />
      </section>
    );
    expect(screen.getByRole('heading', { name: 'Ventas' })).toHaveAttribute('id', 's1');
    expect(screen.getByRole('region', { name: 'Ventas' })).toBeInTheDocument();
  });

  it('omits the actions wrapper when there are no actions', () => {
    const { container } = render(<SectionHeader title="X" />);
    expect(container.querySelector('.section-header__actions')).toBeNull();
  });

  it('CSS: baseline-aligned row, title on the display scale', () => {
    const root = css.match(/\.section-header\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(root).toMatch(/align-items:\s*baseline/);
    expect(root).toMatch(/justify-content:\s*space-between/);
    const title = css.match(/\.section-header__title\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(title).toMatch(/font-family:\s*var\(--font-display\)/);
  });
});
