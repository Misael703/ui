import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeBlock, JsonViewer } from '../src/components/Code';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock>{'const x = 1;'}</CodeBlock>);
    expect(screen.getByText(/const x = 1;/)).toBeInTheDocument();
  });

  it('shows filename and language when provided', () => {
    render(<CodeBlock filename="main.ts" language="typescript">{'a'}</CodeBlock>);
    expect(screen.getByText('main.ts')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('toggles to "Copiado" after copy click', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<CodeBlock>{'hola'}</CodeBlock>);
    const btn = screen.getByLabelText(/Copiar/);
    fireEvent.click(btn);
    // Esperar al cambio de estado
    await screen.findByText('Copiado');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hola');
  });
});

describe('JsonViewer', () => {
  it('renders primitives', () => {
    render(<JsonViewer data={{ name: 'Misael', age: 30, active: true }} />);
    expect(screen.getByText(/"Misael"/)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('collapses arrays/objects past defaultExpandDepth', () => {
    render(
      <JsonViewer
        data={{ list: [1, 2, 3] }}
        defaultExpandDepth={1}
      />
    );
    // El array (depth 1) está colapsado mostrando "3 items"
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it('expands node on toggle click', () => {
    render(<JsonViewer data={{ list: [10, 20] }} defaultExpandDepth={0} />);
    // Está colapsado, no muestra los números
    expect(screen.queryByText('10')).toBeNull();
    fireEvent.click(screen.getAllByLabelText(/Expandir|Colapsar/)[0]);
    // Después de expandir el root, "list" key visible
    expect(screen.getByText(/"list"/)).toBeInTheDocument();
  });
});
