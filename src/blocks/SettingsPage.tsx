'use client';
/**
 * Block: settings page — narrow section nav on the left + form area on the
 * right. Each section is a vertical group of `FormField`s with a `Save`
 * action at the bottom. The section nav uses local state; in your app, route
 * each section to its own URL (`/settings/cuenta`, `/settings/seguridad`,
 * etc.) and read the active section from the URL instead.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardBody,
  FormField,
  Input,
  Select,
  Switch,
  Button,
  Avatar,
} from '../index';
import { User, Bell, Lock, CreditCard } from '../components/Icons';

interface Section {
  id: 'cuenta' | 'notificaciones' | 'seguridad' | 'facturacion';
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'cuenta',         label: 'Cuenta',         icon: <User size={16} /> },
  { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={16} /> },
  { id: 'seguridad',      label: 'Seguridad',      icon: <Lock size={16} /> },
  { id: 'facturacion',    label: 'Facturación',    icon: <CreditCard size={16} /> },
];

export function SettingsPage(): React.ReactElement {
  const [active, setActive] = React.useState<Section['id']>('cuenta');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title="Configuración"
        description="Administra tu cuenta y preferencias"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start', marginTop: 24 }}>
        {/* Sidebar — vertical section nav */}
        <nav aria-label="Secciones de configuración">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      border: 0,
                      background: isActive ? 'var(--bg-muted)' : 'transparent',
                      color: isActive ? 'var(--fg-default)' : 'var(--fg-muted)',
                      fontWeight: isActive ? 600 : 400,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Form area — one section visible at a time. */}
        <div>
          {active === 'cuenta' && <CuentaSection />}
          {active === 'notificaciones' && <NotificacionesSection />}
          {active === 'seguridad' && <SeguridadSection />}
          {active === 'facturacion' && <FacturacionSection />}
        </div>
      </div>
    </div>
  );
}

function CuentaSection() {
  return (
    <Card>
      <CardBody>
        <h2 className="h4" style={{ marginTop: 0 }}>Cuenta</h2>
        <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>
          Tu información personal y datos de contacto.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar name="Misael Ocas" size={64} />
          <div>
            <Button size="sm" variant="outline">Cambiar foto</Button>
            <p className="caption" style={{ color: 'var(--fg-muted)', margin: '8px 0 0' }}>JPG o PNG. Máx 2 MB.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Nombre" htmlFor="set-name">
            <Input id="set-name" defaultValue="Misael" />
          </FormField>
          <FormField label="Apellido" htmlFor="set-last">
            <Input id="set-last" defaultValue="Ocas" />
          </FormField>
          <FormField label="Correo" htmlFor="set-email">
            <Input id="set-email" type="email" defaultValue="misael@empresa.cl" />
          </FormField>
          <FormField label="Idioma" htmlFor="set-lang">
            <Select id="set-lang" defaultValue="es-CL">
              <option value="es-CL">Español (Chile)</option>
              <option value="es">Español (neutro)</option>
              <option value="en">English</option>
            </Select>
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button variant="ghost">Cancelar</Button>
          <Button>Guardar cambios</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function NotificacionesSection() {
  return (
    <Card>
      <CardBody>
        <h2 className="h4" style={{ marginTop: 0 }}>Notificaciones</h2>
        <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>
          Decide qué te avisamos y por qué canal.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <NotifRow label="Nuevos pedidos" hint="Cuando un cliente confirma un pedido" defaultChecked />
          <NotifRow label="Stock crítico" hint="Cuando un SKU baja de su umbral" defaultChecked />
          <NotifRow label="Resumen semanal" hint="Cada lunes a las 09:00" />
          <NotifRow label="Novedades del producto" hint="Releases y mejoras del kit" />
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button>Guardar preferencias</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function NotifRow({ label, hint, defaultChecked }: { label: string; hint: string; defaultChecked?: boolean }) {
  return (
    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div className="cell-meta">{hint}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </li>
  );
}

function SeguridadSection() {
  return (
    <Card>
      <CardBody>
        <h2 className="h4" style={{ marginTop: 0 }}>Seguridad</h2>
        <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>
          Actualiza tu contraseña y configura segundo factor.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 420 }}>
          <FormField label="Contraseña actual" htmlFor="set-curpass">
            <Input id="set-curpass" type="password" placeholder="••••••••" />
          </FormField>
          <FormField label="Contraseña nueva" htmlFor="set-newpass" hint="Mínimo 12 caracteres">
            <Input id="set-newpass" type="password" />
          </FormField>
          <FormField label="Confirmar nueva" htmlFor="set-confpass">
            <Input id="set-confpass" type="password" />
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button>Actualizar contraseña</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function FacturacionSection() {
  return (
    <Card>
      <CardBody>
        <h2 className="h4" style={{ marginTop: 0 }}>Facturación</h2>
        <p className="body-sm" style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>
          Datos para tus facturas y método de pago.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Razón social" htmlFor="bill-name">
            <Input id="bill-name" defaultValue="Ferretería El Alba SpA" />
          </FormField>
          <FormField label="RUT" htmlFor="bill-rut">
            <Input id="bill-rut" defaultValue="76.512.340-9" />
          </FormField>
          <FormField label="Giro" htmlFor="bill-giro">
            <Input id="bill-giro" defaultValue="Comercio al por menor de ferretería" />
          </FormField>
          <FormField label="Dirección" htmlFor="bill-addr">
            <Input id="bill-addr" defaultValue="Av. Principal 123, Santiago" />
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button>Guardar datos</Button>
        </div>
      </CardBody>
    </Card>
  );
}
