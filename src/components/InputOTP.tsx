'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

export interface InputOTPProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  inputMode?: 'numeric' | 'text';
  className?: string;
  ariaLabel?: string;
}

export function InputOTP({
  value,
  onChange,
  length = 6,
  onComplete,
  disabled = false,
  invalid = false,
  autoFocus = false,
  inputMode = 'numeric',
  className,
  ariaLabel = 'Código de verificación',
}: InputOTPProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const sanitize = (s: string) => (inputMode === 'numeric' ? s.replace(/\D/g, '') : s).slice(0, length);

  const setAt = (idx: number, ch: string) => {
    const arr = value.padEnd(length, ' ').split('');
    arr[idx] = ch;
    const next = arr.join('').replace(/\s+$/, '').slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const onInputChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = sanitize(raw);
    if (cleaned.length === 0) {
      setAt(idx, '');
      return;
    }
    if (cleaned.length === 1) {
      setAt(idx, cleaned);
      const nextIdx = Math.min(idx + 1, length - 1);
      refs.current[nextIdx]?.focus();
      return;
    }
    const merged = (value.slice(0, idx) + cleaned).slice(0, length);
    onChange(merged);
    const focusIdx = Math.min(merged.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (merged.length === length) onComplete?.(merged);
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[idx] && idx > 0) {
        e.preventDefault();
        const arr = value.split('');
        arr[idx - 1] = '';
        onChange(arr.join('').replace(/\s+$/, ''));
        refs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const cleaned = sanitize(e.clipboardData.getData('text'));
    if (!cleaned) return;
    onChange(cleaned);
    const focusIdx = Math.min(cleaned.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (cleaned.length === length) onComplete?.(cleaned);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cx('input-otp', invalid && 'is-invalid', disabled && 'is-disabled', className)}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode={inputMode}
          autoComplete="one-time-code"
          maxLength={length}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Dígito ${i + 1}`}
          className="input-otp__slot"
          value={value[i] ?? ''}
          onChange={(e) => onInputChange(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
}
