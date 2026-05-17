'use client';
/**
 * Block: centered auth / login screen. Copy-paste recipe. Replace `../index`
 * with `@misael703/ui`. Looks branded under the El Alba preset (toggle the
 * preset in the Storybook toolbar to see it).
 */
import * as React from 'react';
import { Card, CardBody, FormField, Input, Button, Logo } from '../index';

export function AuthScreen(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(!email || !password ? 'Ingresa tu correo y contraseña' : undefined);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-canvas)',
        padding: 24,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 380 }}>
        <CardBody>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Logo variant="horizontal" bg="light" height={36} />
          </div>
          <h1 className="h3" style={{ margin: '0 0 4px', textAlign: 'center' }}>Inicia sesión</h1>
          <p className="body-sm" style={{ color: 'var(--fg-muted)', textAlign: 'center', margin: '0 0 24px' }}>
            Accede al panel de operación
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <FormField label="Correo" htmlFor="auth-email" error={!email && error ? error : undefined}>
              <Input
                id="auth-email"
                type="email"
                placeholder="tu@empresa.cl"
                value={email}
                invalid={!email && !!error}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Contraseña" htmlFor="auth-pass">
              <Input
                id="auth-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                invalid={!password && !!error}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <Button type="submit" fullWidth>Entrar</Button>
          </form>
          <p className="caption" style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
