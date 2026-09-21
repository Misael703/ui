import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle, Caption } from './_helpers';

const meta = { title: 'Foundations/Motion', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

/** Demo runs at 5x actual duration so the difference is perceptible. */
const DEMO_SCALE = 5;

function useTrigger(): number {
  const [trigger, setTrigger] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTrigger((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  return trigger;
}

function MotionTrack({
  durationMs,
  easing,
  trigger,
}: {
  durationMs: number;
  easing: string;
  trigger: number;
}) {
  return (
    <div
      style={{
        position: 'relative',
        height: 32,
        width: '100%',
        maxWidth: 480,
        background: 'var(--bg-subtle)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes motion-demo-slide {
          from { left: 4px; }
          to   { left: calc(100% - 28px); }
        }
      `}</style>
      <div
        key={trigger}
        style={{
          position: 'absolute',
          top: 4,
          width: 24,
          height: 24,
          background: 'var(--color-secondary)',
          borderRadius: 4,
          animation: `motion-demo-slide ${durationMs}ms ${easing} 0s 1 forwards`,
        }}
      />
    </div>
  );
}

export const Durations: StoryObj = {
  render: () => {
    const trigger = useTrigger();
    const durations: Array<[string, number]> = [
      ['fast', 120],
      ['base', 200],
      ['slow', 320],
    ];
    return (
      <div>
        <SectionTitle>Durations</SectionTitle>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 16 }}>
          Demos run at <strong>{DEMO_SCALE}×</strong> real speed so the difference is perceptible.
          The real values (on the left) are what the kit uses in transitions and interactions.
          Loops every 2.2s.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 80px 1fr', gap: 12, alignItems: 'center' }}>
          {durations.map(([k, ms]) => (
            <React.Fragment key={k}>
              <Caption>--duration-{k}</Caption>
              <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ms}ms</span>
              <MotionTrack durationMs={ms * DEMO_SCALE} easing="var(--ease-standard)" trigger={trigger} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};

export const Easing: StoryObj = {
  render: () => {
    const trigger = useTrigger();
    const easings: Array<[string, string, string]> = [
      ['out-quint', 'cubic-bezier(0.22, 1, 0.36, 1)', "the kit's standard (--ease-standard / --ease-out): exponential decel, confident"],
      ['out-expo', 'cubic-bezier(0.16, 1, 0.3, 1)', 'more decisive (overlays, reveals)'],
      ['out-quart', 'cubic-bezier(0.25, 1, 0.5, 1)', 'smoother (micro-interactions)'],
      ['in', 'cubic-bezier(0.4, 0, 1, 1)', '--ease-in: accelerates on exit (elements leaving)'],
    ];
    return (
      <div>
        <SectionTitle>Easings</SectionTitle>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 16 }}>
          Same duration (<code>--duration-slow</code>, 320ms at {DEMO_SCALE}× = {320 * DEMO_SCALE}ms),
          different curve. Notice how the square starts and ends differently in each row.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'center' }}>
          {easings.map(([k, bezier, desc]) => (
            <React.Fragment key={k}>
              <div>
                <Caption>--ease-{k}</Caption>
                <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 2 }}>{bezier}</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: 11, marginTop: 2 }}>{desc}</div>
              </div>
              <MotionTrack durationMs={320 * DEMO_SCALE} easing={`var(--ease-${k})`} trigger={trigger} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};
