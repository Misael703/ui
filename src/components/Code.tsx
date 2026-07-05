'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Copy, Check } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// ---------- CodeBlock ---------------------------------------------------
export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLPreElement>, 'children'> {
  children: string;
  language?: string;
  showCopy?: boolean;
  filename?: React.ReactNode;
}

export function CodeBlock({ children, language, showCopy = true, filename, className, ...rest }: CodeBlockProps) {
  const t = useLocale();
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // navegador sin permiso de clipboard, no hacemos nada
    }
  };

  return (
    <div className={cx('codeblock', className)}>
      {(filename || language || showCopy) && (
        <div className="codeblock__head">
          <div className="codeblock__meta">
            {filename && <span className="codeblock__filename">{filename}</span>}
            {language && <span className="codeblock__lang">{language}</span>}
          </div>
          {showCopy && (
            <button type="button" className="codeblock__copy" aria-label={t['code.copyAria']} onClick={onCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t['code.copied'] : t['code.copy']}</span>
            </button>
          )}
        </div>
      )}
      <pre className="codeblock__body" {...rest}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ---------- JsonViewer --------------------------------------------------
export interface JsonViewerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: unknown;
  /** Profundidad inicial expandida. Default: 2. */
  defaultExpandDepth?: number;
}

export function JsonViewer({ data, defaultExpandDepth = 2, className, ...rest }: JsonViewerProps) {
  return (
    <div className={cx('jsonviewer', className)} {...rest}>
      <JsonNode value={data} depth={0} keyName={null} expandDepth={defaultExpandDepth} />
    </div>
  );
}

interface JsonNodeProps {
  value: unknown;
  depth: number;
  keyName: string | number | null;
  expandDepth: number;
}

function JsonNode({ value, depth, keyName, expandDepth }: JsonNodeProps) {
  const t = useLocale();
  const [expanded, setExpanded] = React.useState(depth < expandDepth);

  const renderKey = keyName !== null ? <span className="json__key">{JSON.stringify(keyName)}: </span> : null;

  if (value === null) return <span className="json__line">{renderKey}<span className="json__null">null</span></span>;
  if (typeof value === 'boolean') return <span className="json__line">{renderKey}<span className="json__bool">{String(value)}</span></span>;
  if (typeof value === 'number') return <span className="json__line">{renderKey}<span className="json__num">{value}</span></span>;
  if (typeof value === 'string') return <span className="json__line">{renderKey}<span className="json__str">{JSON.stringify(value)}</span></span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="json__line">{renderKey}<span className="json__brace">[]</span></span>;
    return (
      <span className="json__node">
        <span className="json__line">
          <button type="button" className="json__toggle" onClick={() => setExpanded((e) => !e)} aria-label={expanded ? t['json.collapse'] : t['json.expand']}>
            {expanded ? '▾' : '▸'}
          </button>
          {renderKey}
          <span className="json__brace">[</span>
          {!expanded && <span className="json__count">{format(t['json.itemCount'], { n: value.length })}</span>}
          {!expanded && <span className="json__brace">]</span>}
        </span>
        {expanded && (
          <>
            <div className="json__children">
              {value.map((item, i) => (
                <JsonNode key={i} value={item} depth={depth + 1} keyName={i} expandDepth={expandDepth} />
              ))}
            </div>
            <span className="json__brace">]</span>
          </>
        )}
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="json__line">{renderKey}<span className="json__brace">{'{}'}</span></span>;
    return (
      <span className="json__node">
        <span className="json__line">
          <button type="button" className="json__toggle" onClick={() => setExpanded((e) => !e)} aria-label={expanded ? t['json.collapse'] : t['json.expand']}>
            {expanded ? '▾' : '▸'}
          </button>
          {renderKey}
          <span className="json__brace">{'{'}</span>
          {!expanded && <span className="json__count">{format(t['json.keyCount'], { n: entries.length })}</span>}
          {!expanded && <span className="json__brace">{'}'}</span>}
        </span>
        {expanded && (
          <>
            <div className="json__children">
              {entries.map(([k, v]) => (
                <JsonNode key={k} value={v} depth={depth + 1} keyName={k} expandDepth={expandDepth} />
              ))}
            </div>
            <span className="json__brace">{'}'}</span>
          </>
        )}
      </span>
    );
  }

  return <span className="json__line">{renderKey}<span>{String(value)}</span></span>;
}
