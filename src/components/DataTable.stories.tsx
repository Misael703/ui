import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs, TableToolbar, TablePagination, ColumnToggle } from './DataTable';
import { Badge, Card, CardBody } from './Display';
import { Input, Select } from './Form';
import { Button } from './Button';
import { Modal } from './Overlay';

export default { title: 'Data Display/DataTable', tags: ['autodocs'] } as Meta;

const rows = [
  { id: '1', name: 'Taladro percutor', sku: 'TLD-700', stock: 24, price: 89990 },
  { id: '2', name: 'Sierra circular', sku: 'SRR-7', stock: 8, price: 159990 },
  { id: '3', name: 'Lijadora orbital', sku: 'LIJ-300', stock: 0, price: 49990 },
];

export const DataTableBasica: StoryObj = {
  render: () => {
    const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        selectable
        selectedKeys={sel}
        onSelectionChange={setSel}
        columns={[
          { key: 'name', header: 'Producto', sortable: true },
          { key: 'sku', header: 'SKU' },
          {
            key: 'stock', header: 'Stock', sortable: true, align: 'right',
            accessor: (r) => r.stock === 0 ? <Badge variant="danger">Agotado</Badge> : r.stock < 10 ? <Badge variant="warning">{r.stock}</Badge> : r.stock,
          },
          { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

/**
 * **Virtualización** (v1.51.0): `virtualizeRows` ventanea 5.000 filas a
 * ~30 nodos DOM con spacers pixel-exactos. Requiere `maxHeight` y alturas
 * uniformes — se auto-desactiva con `renderExpanded` o `cards`. La
 * selección opera sobre el dataset completo (solo el DOM se ventanea).
 * El sticky header + footer de totales conviven con el windowing.
 */
export const Virtualizada: StoryObj = {
  render: () => {
    const big = React.useMemo(() => Array.from({ length: 5000 }, (_, i) => ({
      id: String(i),
      name: `Producto ${i}`,
      sku: `SKU-${10000 + i}`,
      price: 990 + (i % 90) * 1000,
    })), []);
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    const total = React.useMemo(() => big.reduce((s, r) => s + r.price, 0), [big]);
    return (
      <DataTable
        rows={big}
        rowKey={(r) => r.id}
        stickyHeader
        maxHeight={400}
        virtualizeRows={{ rowHeight: 31 }}
        selectable
        selectedKeys={sel}
        onSelectionChange={setSel}
        columns={[
          { key: 'name', header: 'Producto', footer: 'Total (5.000)' },
          { key: 'sku', header: 'SKU' },
          { key: 'price', header: 'Precio', numeric: true,
            accessor: (r) => `$${r.price.toLocaleString('es-CL')}`,
            footer: `$${total.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

/**
 * **Visibilidad de columnas** (v1.49.0): `hiddenColumnKeys` filtra columnas
 * sin mutar el array canónico — header, celdas, footer y colSpans siguen
 * solos. `<ColumnToggle>` en el toolbar es el menú listo: popover con
 * checkboxes que queda abierto entre toggles; la última columna visible se
 * deshabilita (cero columnas es un estado roto inalcanzable).
 */
export const ConVisibilidadDeColumnas: StoryObj = {
  render: () => {
    const [hidden, setHidden] = React.useState<Set<string>>(new Set(['sku']));
    const cols = [
      { key: 'name', header: 'Producto' },
      { key: 'sku', header: 'SKU' },
      { key: 'stock', header: 'Stock', numeric: true },
      { key: 'price', header: 'Precio', numeric: true, accessor: (r: typeof rows[number]) => `$${r.price.toLocaleString('es-CL')}` },
    ];
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        hiddenColumnKeys={hidden}
        columns={cols}
        toolbar={
          <TableToolbar>
            <span className="grow" />
            <ColumnToggle columns={cols} hiddenKeys={hidden} onChange={setHidden} />
          </TableToolbar>
        }
      />
    );
  },
};

/**
 * **Expansión de filas** (v1.48.0): `renderExpanded` agrega la columna de
 * chevron; el panel abierto es un `<tr>` extra que abarca todas las columnas,
 * recostado sobre la banda gris del header. Controlado igual que la
 * selección (`expandedKeys`/`onExpandedChange`). El toggle es un `<button>`
 * real con `aria-expanded` + `aria-controls`.
 */
export const ConExpansion: StoryObj = {
  render: () => {
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['1']));
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        renderExpanded={(r) => (
          <div style={{ display: 'grid', gap: 4, fontSize: 'var(--text-sm)' }}>
            <strong>{r.name}</strong>
            <span>SKU {r.sku} · {r.stock} unidades en bodega central</span>
            <span>Último movimiento: hace 3 días</span>
          </div>
        )}
        columns={[
          { key: 'name', header: 'Producto' },
          { key: 'sku', header: 'SKU' },
          { key: 'stock', header: 'Stock', numeric: true },
        ]}
      />
    );
  },
};

/**
 * **Fila de totales** (v1.47.0): `Column.footer` renderiza un `<tfoot>` con
 * la banda gris del header pero registro de dato (peso 600) — los totales
 * son datos, no labels. Con `maxHeight` el footer queda fijo al fondo del
 * scroll box (sticky bottom), espejo del sticky header: los totales siguen
 * visibles mientras las filas scrollean. El kit NO suma por ti: las rows
 * pueden ser una página del server y el total de página ≠ total del
 * dataset — el agregado lo trae el consumer.
 */
export const ConTotales: StoryObj = {
  render: () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${100 + i}`,
      stock: (i * 7) % 30,
      price: 9990 + i * 5000,
    }));
    const totalStock = many.reduce((s, r) => s + r.stock, 0);
    const totalPrice = many.reduce((s, r) => s + r.price, 0);
    return (
      <DataTable
        rows={many}
        rowKey={(r) => r.id}
        stickyHeader
        maxHeight={320}
        columns={[
          { key: 'name', header: 'Producto', footer: 'Total (20 productos)' },
          { key: 'sku', header: 'SKU' },
          { key: 'stock', header: 'Stock', numeric: true, footer: totalStock },
          { key: 'price', header: 'Precio', numeric: true,
            accessor: (r) => `$${r.price.toLocaleString('es-CL')}`,
            footer: `$${totalPrice.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

/** Estado vacío: pasa `rows={[]}`. Muestra el mensaje por defecto o el `empty` slot. */
export const SinDatos: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Estado de carga: skeleton de 5 filas mientras `loading=true`. */
export const Cargando: StoryObj = {
  render: () => (
    <DataTable
      loading
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Empty slot custom: pasa un nodo arbitrario via `empty`. */
export const SinDatosCustom: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      empty={
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Sin productos en este filtro</strong>
          <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
            Ajusta los filtros o limpia la búsqueda para ver más resultados.
          </span>
        </div>
      }
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
      ]}
    />
  ),
};

/**
 * Toolbar / filter zone + DataTable en UNA superficie redondeada. Se pasa
 * por el prop `toolbar`: el DataTable **posee** la superficie
 * (borde+radio+overflow), la toolbar queda clipeada al radio, hay UNA sola
 * divisoria con el header y la esquina queda limpia — sin apilar
 * card-border + filtro + header-top, sin costura. Esta ES la forma de
 * combinar una toolbar con un DataTable; no los envuelvas a mano en tu
 * propio contenedor bordeado (eso reintroduce la costura).
 */
export const ConToolbar: StoryObj = {
  render: () => {
    const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        toolbar={
          <TableToolbar>
            <div className="grow"><Input placeholder="Buscar producto…" /></div>
            <Button variant="outline" size="sm">Filtros</Button>
            <Button size="sm">Exportar</Button>
          </TableToolbar>
        }
        columns={[
          { key: 'name', header: 'Producto', sortable: true },
          { key: 'sku', header: 'SKU' },
          { key: 'stock', header: 'Stock', sortable: true, align: 'right' },
          { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

/** Estado de error: pasa `error` para mostrar un mensaje rojo con `role="alert"`. */

export const ConError: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      error="No pudimos cargar los productos. Reintenta en unos segundos."
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Sticky header: el thead queda visible al scrollear el body. El propio
 * wrapper es el contenedor de scroll (no lo envuelvas en tu propio
 * `overflow-y:auto`). Default `max-height:70vh`; aquí se override con un
 * `className`. */
const stickyCols = [
  { key: 'name', header: 'Producto' },
  { key: 'sku', header: 'SKU' },
  { key: 'stock', header: 'Stock', align: 'right' as const },
  { key: 'price', header: 'Precio', align: 'right' as const, accessor: (r: { price: number }) => `$${r.price.toLocaleString('es-CL')}` },
];
const stickyRows = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `Producto ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(3, '0')}`,
  stock: (i * 7) % 100,
  price: 10000 + i * 4500,
}));

/**
 * **`stickyHeader` + `maxHeight`** (v1.41.0): a bounded scroll region. The wrap
 * caps at `maxHeight` and scrolls its body; the header pins to the box. Use
 * this for a standalone table with an internal scroll area. (Before 1.41.0
 * `stickyHeader` implied `max-height: 70vh` — that cap is now the explicit
 * `maxHeight` prop.)
 *
 * v1.42.0: scroll the body — the header sits flush at rest and lifts off with
 * a soft shadow once content scrolls beneath it (the "command bar" elevation).
 */
export const StickyHeader: StoryObj = {
  render: () => (
    <DataTable stickyHeader maxHeight={300} rows={stickyRows} rowKey={(r) => r.id} ariaLabel="Inventario" columns={stickyCols} />
  ),
};

/**
 * **`stickyHeader` dentro de un Modal** (v1.41.0): sin `maxHeight`, el wrap no
 * crea su propio scroll — el header se pega al scroll del `Modal` body. Un solo
 * scroll, sin barras anidadas ni artefactos de borde. Abre el modal y scrollea.
 */
export const StickyHeaderEnModal: StoryObj = {
  name: 'Sticky header en Modal (un solo scroll)',
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir inventario</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Inventario">
          <DataTable stickyHeader rows={stickyRows} rowKey={(r) => r.id} ariaLabel="Inventario" columns={stickyCols} />
        </Modal>
      </>
    );
  },
};

/** P1 — fila navegable. El kit renderiza un `<a>`/`<button>` real estirado:
 * operable por teclado, con nombre para lector de pantalla y foco visible en
 * la fila. Markup de tabla válido (sin role hack en `<tr>`). */
export const FilaInteractiva: StoryObj = {
  render: () => (
    <DataTable
      rows={rows}
      rowKey={(r) => r.id}
      rowLabel={(r) => r.name}
      ariaLabel="Productos"
      rowHref={(r) => `#/productos/${r.id}`}
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
      ]}
    />
  ),
};

/** P5a — densidad legible POR DEFAULT (arriba) vs `density="comfortable"`
 * (abajo, el layout previo a 1.10.0 que envolvía a 2 líneas). */
export const Densidad: StoryObj = {
  render: () => {
    const cols = [
      { key: 'name', header: 'Producto' },
      { key: 'sku', header: 'SKU' },
      { key: 'stock', header: 'Stock', align: 'right' as const },
      { key: 'price', header: 'Precio', align: 'right' as const, accessor: (r: typeof rows[number]) => `$${r.price.toLocaleString('es-CL')}` },
    ];
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <DataTable rows={rows} rowKey={(r) => r.id} ariaLabel="Compact" columns={cols} />
        <DataTable rows={rows} rowKey={(r) => r.id} ariaLabel="Comfortable" density="comfortable" columns={cols} />
      </div>
    );
  },
};

/** P5h — columna de acción `align:'right'` con un nodo React (flex de
 * botones): ahora se alinea de verdad (antes flotaba a la izquierda). */
export const ColumnaAccionAlineada: StoryObj = {
  render: () => (
    <DataTable
      rows={rows}
      rowKey={(r) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        {
          key: 'acc', header: 'Acciones', align: 'right',
          accessor: () => (
            <span style={{ display: 'inline-flex', gap: 8 }} data-row-interactive>
              <Button size="sm" variant="outline">Editar</Button>
              <Button size="sm" variant="danger">Borrar</Button>
            </span>
          ),
        },
      ]}
    />
  ),
};

/** P2 — DataTable dentro de un Card: el wrap es dueño de su borde/radio y
 * el header sigue la esquina redondeada → sin notch. */
/**
 * **Embebida en Card** — pasa `surface="flush"` para que el DataTable no
 * dibuje su propio borde/radio dentro de la Card (que ya posee la
 * superficie). Sin `flush` se ve el doble borde y el radio anidado.
 */
export const TablaSobreCard: StoryObj = {
  render: () => (
    <Card>
      <CardBody>
        <DataTable
          surface="flush"
          rows={rows}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          columns={[
            { key: 'name', header: 'Producto' },
            { key: 'sku', header: 'SKU' },
            { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
          ]}
        />
      </CardBody>
    </Card>
  ),
};

/**
 * **Elevada sobre canvas tintado** — un DataTable standalone es FLAT por
 * default. Sobre un canvas tintado se funde con el fondo. Subí
 * `--table-elevation` a una sombra real (aquí `var(--shadow-card)`) en un
 * ancestro y el kit la aplica a `.table-wrap` y `.table-surface` sin tocar
 * selectores internos — la misma sombra que usa `<Card>`, elevación
 * consistente entre superficies.
 */
export const ElevadaSobreCanvas: StoryObj = {
  name: 'Elevada sobre canvas tintado (--table-elevation)',
  render: () => (
    <div style={{ background: 'var(--bg-canvas, #eef1f5)', padding: 32, ['--table-elevation' as string]: 'var(--shadow-card)' }}>
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        ariaLabel="Productos"
        columns={[
          { key: 'name', header: 'Producto' },
          { key: 'sku', header: 'SKU' },
          { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
        ]}
      />
    </div>
  ),
};

/** P5i — fila densa de filtros: `.fields--dense` baja los controles a 36px
 * para que ~7 filtros no envuelvan en desktop (el target táctil de 44px
 * sigue siendo el default fuera de este contenedor). */
export const FilaDensaDeFiltros: StoryObj = {
  render: () => (
    <div className="fields--dense" style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
      <Input placeholder="Buscar" />
      <Select defaultValue=""><option value="">Bodega</option><option>Central</option></Select>
      <Select defaultValue=""><option value="">Estado</option><option>Activo</option></Select>
      <Select defaultValue=""><option value="">Categoría</option><option>Herramientas</option></Select>
      <Input type="date" />
      <Input type="date" />
      <Button>Filtrar</Button>
    </div>
  ),
};

/** Card layout en mobile: a partir de <600px cada fila se renderiza como
 * una tarjeta con label + value. Usa el viewport mobile en Storybook para verlo. */
export const CardLayoutMobile: StoryObj = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DataTable
      mobileLayout="cards"
      rows={rows}
      rowKey={(r) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
        { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
      ]}
    />
  ),
};

/** TablePagination con page-size selector y rango de filas. */
export const PaginacionCompleta: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    return (
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={87}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    );
  },
};

/** TablePagination sin page-size selector — para tablas con tamaño fijo. */
export const PaginacionSimple: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return (
      <TablePagination
        page={page}
        pageSize={20}
        total={155}
        onPageChange={setPage}
      />
    );
  },
};

/** DataTable + TablePagination juntos, patrón típico de uso. */
export const DataTableConPaginacion: StoryObj = {
  render: () => {
    const allRows = Array.from({ length: 87 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${String(i + 1).padStart(3, '0')}`,
      stock: Math.floor(Math.random() * 100),
    }));
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const start = (page - 1) * pageSize;
    const visible = allRows.slice(start, start + pageSize);
    return (
      <div>
        <DataTable
          rows={visible}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          columns={[
            { key: 'name', header: 'Producto' },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', align: 'right' },
          ]}
        />
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={allRows.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    );
  },
};

/**
 * Cada `AccordionItem` cablea el trigger con el panel vía ARIA (desde v1.3.0):
 * el botón lleva `aria-controls` + `aria-expanded`; el panel abierto lleva
 * `id`, `role="region"` y `aria-labelledby` (ids estables con `React.useId()`).
 * El panel se desmonta al cerrar; el comportamiento no cambió.
 */
export const AccordionBasico: StoryObj = {
  render: () => (
    <Accordion defaultOpen={['envio']}>
      <AccordionItem id="envio" title="Envío y plazos">Despachamos en 24-48h hábiles.</AccordionItem>
      <AccordionItem id="dev" title="Devoluciones">Tienes 10 días para devolver productos sin uso.</AccordionItem>
      <AccordionItem id="pago" title="Métodos de pago">Tarjetas, transferencia y crédito empresa.</AccordionItem>
    </Accordion>
  ),
};

export const BreadcrumbsBasico: StoryObj = {
  render: () => (
    <Breadcrumbs items={[
      { label: 'Inicio', href: '/' },
      { label: 'Catálogo', href: '/catalogo' },
      { label: 'Herramientas eléctricas', href: '/catalogo/electricas' },
      { label: 'Taladro percutor' },
    ]}/>
  ),
};

interface DataTablePlaygroundArgs {
  stickyHeader: boolean;
  selectable: boolean;
  loading: boolean;
  mobileLayout: 'table' | 'cards';
}

/** Playground interactivo: alterna `stickyHeader`/`selectable`/`loading`/`mobileLayout`. */
export const DataTablePlayground: StoryObj = {
  args: { stickyHeader: false, selectable: false, loading: false, mobileLayout: 'table' },
  argTypes: {
    stickyHeader: { control: 'boolean' },
    selectable: { control: 'boolean' },
    loading: { control: 'boolean' },
    mobileLayout: { control: 'inline-radio', options: ['table', 'cards'] },
  },
  render: (args) => {
    const a = args as unknown as DataTablePlaygroundArgs;
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        ariaLabel="Productos"
        stickyHeader={a.stickyHeader}
        selectable={a.selectable}
        loading={a.loading}
        mobileLayout={a.mobileLayout}
        selectedKeys={sel}
        onSelectionChange={setSel}
        columns={[
          { key: 'name', header: 'Producto' },
          { key: 'sku', header: 'SKU' },
          { key: 'stock', header: 'Stock', align: 'right' },
          { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

/**
 * GOLD STANDARD (acceptance, v1.14.0). A dense "Órdenes de despacho" table
 * with a filter toolbar, secondary eco lines and data-chip badges inside a
 * rounded Card — **rendered entirely by kit defaults, zero consumer
 * override**. Mono = bundled JetBrains Mono (`.cell-mono`), eco line =
 * `.cell-meta` (11px/--fg-meta, recedes), primary cell ~14px, header
 * receded + tracked, one divider, no seam, quiet data-chip badges.
 */
export const GoldStandard: StoryObj = {
  render: () => {
    const data = [
      { id: '1', doc: '0010402', eco: 'Factura electrónica', cliente: 'Comercial Andes', rut: '76.512.340-9', dir: 'Av. Vicuña Mackenna 1240, Ñuñoa', fecha: '14-05-2026', tipo: 'Envío', estado: 'Entregado', clase: 'Clase A4' },
      { id: '2', doc: '0010403', eco: 'Boleta electrónica', cliente: 'Ferretería Sur', rut: '77.108.220-K', dir: 'Los Carrera 880, Concepción', fecha: '14-05-2026', tipo: 'Retiro', estado: 'Pendiente', clase: 'Clase A4' },
      { id: '3', doc: '0010404', eco: 'Factura electrónica', cliente: 'Distribuidora Pacífico', rut: '76.990.110-2', dir: 'Ruta 68 Km 14, Pudahuel', fecha: '13-05-2026', tipo: 'Envío', estado: 'Cancelado', clase: 'Clase B2' },
    ];
    const estadoVariant = (e: string) => (e === 'Entregado' ? 'success' : e === 'Pendiente' ? 'warning' : 'danger') as 'success';
    return (
      <Card>
        <CardBody style={{ padding: 0 }}>
          <DataTable
            rows={data}
            rowKey={(r) => r.id}
            ariaLabel="Órdenes de despacho"
            toolbar={
              <TableToolbar>
                <div className="grow"><Input placeholder="Buscar N° doc, cliente…" /></div>
                <Select aria-label="Estado"><option>Todos</option><option>Entregado</option><option>Pendiente</option></Select>
                <Button variant="outline" size="sm">Filtros</Button>
              </TableToolbar>
            }
            columns={[
              { key: 'doc', header: 'N° documento', accessor: (r) => (
                <><span className="cell-mono">{r.doc}</span><span className="cell-meta">{r.eco}</span></>
              ) },
              { key: 'cliente', header: 'Cliente', accessor: (r) => (
                <><span>{r.cliente}</span><span className="cell-meta cell-mono">{r.rut}</span></>
              ) },
              { key: 'dir', header: 'Dirección', accessor: (r) => <div className="cell-wrap" style={{ maxWidth: 220 }}>{r.dir}</div> },
              { key: 'fecha', header: 'Fecha', accessor: (r) => <span className="cell-mono">{r.fecha}</span> },
              { key: 'tipo', header: 'Tipo', accessor: (r) => <Badge>{r.tipo}</Badge> },
              { key: 'estado', header: 'Estado', accessor: (r) => <Badge variant={estadoVariant(r.estado)} dot>{r.estado}</Badge> },
              { key: 'clase', header: 'Clase', accessor: (r) => <Badge variant="neutral">{r.clase}</Badge> },
            ]}
          />
        </CardBody>
      </Card>
    );
  },
};
