import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeAgo, TimeAgoDate } from './TimeAgo';

export default { title: 'Time/TimeAgo', tags: ['autodocs'] } as Meta;

// A pinned `now` keeps the story output stable in the docs and visual
// snapshot tools. Real apps pass `undefined` and let it default to
// `new Date()` (the relative label flips on each render).
const NOW = new Date('2026-06-02T14:30:00');

const Row: React.FC<{ label: string; iso: string }> = ({ label, iso }) => (
  <tr>
    <td style={{ padding: '6px 12px', color: 'var(--fg-muted)', fontSize: 12 }}>{label}</td>
    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: 'var(--fg-muted)' }}>{iso}</td>
    <td style={{ padding: '6px 12px' }}><TimeAgo iso={iso} now={NOW} /></td>
  </tr>
);

const DateRow: React.FC<{ label: string; iso: string }> = ({ label, iso }) => (
  <tr>
    <td style={{ padding: '6px 12px', color: 'var(--fg-muted)', fontSize: 12 }}>{label}</td>
    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: 'var(--fg-muted)' }}>{iso}</td>
    <td style={{ padding: '6px 12px' }}><TimeAgoDate iso={iso} now={NOW} /></td>
  </tr>
);

export const Casos: StoryObj = {
  name: 'TimeAgo · scale table',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16 }}>
        Reference <code>now</code>: <strong>2026-06-02 14:30 (mar)</strong>. Hover any row to see the absolute tooltip.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
        <tbody>
          <Row label="< 1 min, past" iso="2026-06-02T14:29:35" />
          <Row label="< 1 min, future" iso="2026-06-02T14:30:25" />
          <Row label="hace 5 min" iso="2026-06-02T14:25:00" />
          <Row label="hace 30 min" iso="2026-06-02T14:00:00" />
          <Row label="en 15 min" iso="2026-06-02T14:45:00" />
          <Row label="hoy 09:15" iso="2026-06-02T09:15:00" />
          <Row label="ayer 18:00" iso="2026-06-01T18:00:00" />
          <Row label="mañana 08:00" iso="2026-06-03T08:00:00" />
          <Row label="weekday + hora (< 7d)" iso="2026-05-30T11:00:00" />
          <Row label="weekday sin hora (T00:00Z heuristic)" iso="2026-05-30T00:00:00Z" />
          <Row label="mismo año (> 7d)" iso="2026-03-12T10:00:00" />
          <Row label="otro año" iso="2025-03-12T10:00:00" />
        </tbody>
      </table>
    </div>
  ),
};

export const SoloFecha: StoryObj = {
  name: 'TimeAgoDate · date-only scale',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16 }}>
        Reference <code>now</code>: <strong>2026-06-02 (mar)</strong>. Time-of-day is always ignored.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
        <tbody>
          <DateRow label="hoy" iso="2026-06-02" />
          <DateRow label="ayer" iso="2026-06-01" />
          <DateRow label="mañana" iso="2026-06-03" />
          <DateRow label="weekday (< 7d)" iso="2026-05-30" />
          <DateRow label="mismo año" iso="2026-03-12" />
          <DateRow label="otro año" iso="2025-03-12" />
        </tbody>
      </table>
    </div>
  ),
};
