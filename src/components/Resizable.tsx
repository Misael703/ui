'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

export type ResizableDirection = 'horizontal' | 'vertical';

interface ResizableContextValue {
  direction: ResizableDirection;
  registerPanel: (id: string, defaultSize: number, minSize: number) => void;
  sizes: Record<string, number>;
  startDrag: (panelId: string, e: React.PointerEvent) => void;
}
const ResizableContext = React.createContext<ResizableContextValue | null>(null);

export interface ResizableGroupProps {
  direction?: ResizableDirection;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function ResizableGroup({ direction = 'horizontal', className, children, ariaLabel }: ResizableGroupProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = React.useState<Record<string, number>>({});
  const minsRef = React.useRef<Record<string, number>>({});
  const orderRef = React.useRef<string[]>([]);

  const registerPanel = React.useCallback((id: string, defaultSize: number, minSize: number) => {
    minsRef.current[id] = minSize;
    setSizes((s) => (s[id] !== undefined ? s : { ...s, [id]: defaultSize }));
    if (!orderRef.current.includes(id)) orderRef.current = [...orderRef.current, id];
  }, []);

  const startDrag = (panelId: string, e: React.PointerEvent) => {
    e.preventDefault();
    const idx = orderRef.current.indexOf(panelId);
    const nextId = orderRef.current[idx + 1];
    if (!nextId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const total = direction === 'horizontal' ? rect.width : rect.height;
    const startSize = sizes[panelId] ?? 0;
    const startNextSize = sizes[nextId] ?? 0;
    const startCoord = direction === 'horizontal' ? e.clientX : e.clientY;

    const onMove = (ev: PointerEvent) => {
      const coord = direction === 'horizontal' ? ev.clientX : ev.clientY;
      const deltaPx = coord - startCoord;
      const deltaPct = (deltaPx / total) * 100;
      const minA = minsRef.current[panelId] ?? 5;
      const minB = minsRef.current[nextId] ?? 5;
      const newA = Math.max(minA, Math.min(startSize + startNextSize - minB, startSize + deltaPct));
      const newB = startSize + startNextSize - newA;
      setSizes((s) => ({ ...s, [panelId]: newA, [nextId]: newB }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <ResizableContext.Provider value={{ direction, registerPanel, sizes, startDrag }}>
      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        className={cx('resizable', `resizable--${direction}`, className)}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  );
}

export interface ResizablePanelProps {
  id: string;
  defaultSize?: number;
  minSize?: number;
  className?: string;
  children: React.ReactNode;
}

export function ResizablePanel({ id, defaultSize = 50, minSize = 10, className, children }: ResizablePanelProps) {
  const ctx = React.useContext(ResizableContext);
  if (!ctx) throw new Error('ResizablePanel must be inside ResizableGroup');

  React.useEffect(() => {
    ctx.registerPanel(id, defaultSize, minSize);
  }, [id, defaultSize, minSize, ctx]);

  const size = ctx.sizes[id] ?? defaultSize;
  const sizeStyle =
    ctx.direction === 'horizontal' ? { width: `${size}%` } : { height: `${size}%` };

  return (
    <div className={cx('resizable__panel', className)} style={sizeStyle}>
      {children}
    </div>
  );
}

export interface ResizableHandleProps {
  panelId: string;
  className?: string;
  ariaLabel?: string;
}

export function ResizableHandle({ panelId, className, ariaLabel = 'Redimensionar' }: ResizableHandleProps) {
  const ctx = React.useContext(ResizableContext);
  if (!ctx) throw new Error('ResizableHandle must be inside ResizableGroup');
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={ctx.direction === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel}
      className={cx('resizable__handle', `resizable__handle--${ctx.direction}`, className)}
      onPointerDown={(e) => ctx.startDrag(panelId, e)}
    />
  );
}
