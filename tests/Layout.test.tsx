import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Tabs, TabList, Tab, TabPanel,
  Tooltip, Stepper,
  Divider, Stack, HStack, VStack, Container, Grid,
  KeyValue, KeyValueRow,
  ListGroup, ListGroupItem,
} from '../src/components/Layout';

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
});

describe('Tooltip', () => {
  it('renders children and tooltip label', () => {
    render(<Tooltip label="Info"><span>Trigger</span></Tooltip>);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Info');
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
