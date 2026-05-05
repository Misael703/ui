import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LocaleProvider,
  useLocale,
  esMessages,
  format,
  type UiKitMessages,
} from '../src/locale';

function Probe({ keyName }: { keyName: keyof UiKitMessages }) {
  const t = useLocale();
  const v = t[keyName];
  return <span data-testid="probe">{Array.isArray(v) ? v.join('|') : (v as string)}</span>;
}

describe('locale', () => {
  describe('useLocale (no provider)', () => {
    it('falls back to esMessages without provider', () => {
      render(<Probe keyName="modal.close" />);
      expect(screen.getByTestId('probe').textContent).toBe('Cerrar');
    });

    it('returns calendar arrays', () => {
      render(<Probe keyName="calendar.weekdays" />);
      expect(screen.getByTestId('probe').textContent).toBe('Lun|Mar|Mié|Jue|Vie|Sáb|Dom');
    });
  });

  describe('LocaleProvider', () => {
    it('overrides only the keys provided, leaving rest as Spanish defaults', () => {
      render(
        <LocaleProvider messages={{ 'modal.close': 'Close' }}>
          <Probe keyName="modal.close" />
        </LocaleProvider>
      );
      expect(screen.getByTestId('probe').textContent).toBe('Close');
    });

    it('non-overridden keys still come from esMessages', () => {
      render(
        <LocaleProvider messages={{ 'modal.close': 'Close' }}>
          <Probe keyName="table.empty" />
        </LocaleProvider>
      );
      expect(screen.getByTestId('probe').textContent).toBe('Sin datos');
    });

    it('accepts a full message dict', () => {
      const full: UiKitMessages = { ...esMessages, 'common.confirm': 'OK' };
      render(
        <LocaleProvider messages={full}>
          <Probe keyName="common.confirm" />
        </LocaleProvider>
      );
      expect(screen.getByTestId('probe').textContent).toBe('OK');
    });

    it('overrides calendar arrays', () => {
      render(
        <LocaleProvider
          messages={{
            'calendar.weekdays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          }}
        >
          <Probe keyName="calendar.weekdays" />
        </LocaleProvider>
      );
      expect(screen.getByTestId('probe').textContent).toBe('Mon|Tue|Wed|Thu|Fri|Sat|Sun');
    });
  });

  describe('format helper', () => {
    it('substitutes single placeholder', () => {
      expect(format('Eliminar {name}', { name: 'foto.jpg' })).toBe('Eliminar foto.jpg');
    });

    it('substitutes multiple placeholders', () => {
      expect(format('{n} de {total}', { n: 3, total: 10 })).toBe('3 de 10');
    });

    it('leaves unknown placeholders intact (so typos surface)', () => {
      expect(format('Hola {nombre}', { name: 'Misa' })).toBe('Hola {nombre}');
    });

    it('handles numbers', () => {
      expect(format('({n} sin leer)', { n: 5 })).toBe('(5 sin leer)');
    });

    it('handles repeated placeholder', () => {
      expect(format('{x} y {x}', { x: 'a' })).toBe('a y a');
    });
  });
});
