'use client';
/**
 * Block: split-screen auth — narrow form on the left, brand panel on the
 * right. On mobile the brand panel hides and the form takes the full width.
 *
 * Iterated from the real El Alba login: the right side carries the Logo as
 * a large watermark on a brand-colored canvas, the left stays neutral with
 * a tight focused form. Compare with the simpler centered `AuthScreen`.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { FormField, Input, Button, Logo } from '../index';

export function AuthSplit(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(!email || !password ? 'Ingresa tu correo y contraseña' : undefined);
  };

  return (
    <div
      className="auth-split"
      style={{
        minHeight: '100vh',
        display: 'grid',
        background: 'var(--bg-canvas)',
      }}
    >
      {/* LEFT — form column */}
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: '48px 24px',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <Logo variant="horizontal" bg="light" height={32} />
          </div>
          <h1 className="h2" style={{ margin: '0 0 4px' }}>Inicia sesión</h1>
          <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 32px' }}>
            Accede a tu cuenta para continuar
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <FormField label="Correo" htmlFor="split-email" error={!email && error ? error : undefined}>
              <Input
                id="split-email"
                type="email"
                placeholder="tu@empresa.cl"
                value={email}
                invalid={!email && !!error}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Contraseña" htmlFor="split-pass">
              <Input
                id="split-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                invalid={!password && !!error}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
              <a href="#" className="caption">¿Olvidaste tu contraseña?</a>
            </div>
            <Button type="submit" fullWidth>Entrar</Button>
          </form>
          <p className="caption" style={{ marginTop: 24, color: 'var(--fg-muted)' }}>
            ¿No tienes cuenta? <a href="#">Crear cuenta</a>
          </p>
        </div>
      </div>

      {/* RIGHT — brand panel. Hidden on narrow viewports. */}
      <div
        className="auth-split__brand"
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Logo variant="mark" bg="dark" height={220} style={{ opacity: 0.95 }} />
        {/* Caption under the watermark — optional, often replaced by a product
            tagline or testimonial in real apps. */}
        <p
          style={{
            position: 'absolute',
            bottom: 32,
            left: 32,
            right: 32,
            margin: 0,
            opacity: 0.85,
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          La operación de tu negocio, en un solo lugar.
        </p>
      </div>

      {/* Columns live in CSS (not inline) so the media query can override them:
          on mobile the brand panel hides AND the grid collapses to one track,
          so the form reclaims the full width instead of staying at 50%. */}
      <style>{`
        .auth-split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .auth-split__brand { display: grid; place-items: center; }
        @media (max-width: 768px) {
          .auth-split { grid-template-columns: 1fr; }
          .auth-split__brand { display: none; }
        }
      `}</style>
    </div>
  );
}
