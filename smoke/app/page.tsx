// Server Component (NO 'use client'). Importing kit components here exercises
// the RSC boundary: a kit component that needs client APIs but is missing the
// 'use client' directive will fail the Next build/render. Only serializable
// props (no function props from a Server to a Client Component).
import Link from 'next/link';
import { Button, Badge, Card, CardBody, Alert, Spinner, Divider, Input, Kpi } from '@misael703/ui';

export default function Home() {
  return (
    <main style={{ padding: 24, display: 'grid', gap: 12 }}>
      <h1>kit smoke · server route (RSC)</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/client">/client</Link>
        <Link href="/gallery">/gallery</Link>
      </nav>
      <Card>
        <CardBody>
          <Button variant="primary">Botón</Button>{' '}
          <Badge variant="success">ok</Badge>
        </CardBody>
      </Card>
      <Alert variant="info" title="Server-rendered">
        Estos componentes del kit se renderizan dentro de un Server Component.
      </Alert>
      <Spinner />
      <Divider />
      <Input placeholder="input en RSC" />
      <Kpi label="Render" value="SSR" />
    </main>
  );
}
