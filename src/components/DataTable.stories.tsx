import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs, TableToolbar, TablePagination, ColumnToggle, type Column } from './DataTable';
import type { ToolbarAction } from './ToolbarActions';
import { Badge, Card, CardBody } from './Display';
import { Input, Select } from './Form';
import { Button } from './Button';
import { Modal } from './Overlay';
import { Filter, Download, Edit, Trash } from './Icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
 * **Truncado por columna** (`Column.truncate`). En `table-layout:auto` un valor
 * largo —peor si es un string SIN espacios— estira la columna y revienta el ancho
 * de la tabla. `truncate: true` recorta a una línea con "…"; `truncate: n` hace
 * clamp a `n` líneas. El cap es DURO (max-width en un wrapper interno, tomado del
 * `width` de la columna o 240px por defecto) y rompe tokens sin espacios. En celdas
 * string el valor completo va en el `title` (hover). En `mobileLayout="cards"` no
 * aplica (las cards ya envuelven).
 */
export const TruncadoPorColumna: StoryObj = {
  render: () => {
    const wide = [
      { id: '1', name: 'Taladro percutor inalámbrico 20V con maletín', address: 'Av. Libertador Bernardo O’Higgins 1234, Depto 567, Santiago Centro, Región Metropolitana', notes: 'Cliente pidió despacho en la mañana; dejar en conserjería si no hay nadie; timbre no funciona.' },
      { id: '2', name: 'Sierra circular', address: 'askjdalksdjalksdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdj', notes: 'Sin observaciones.' },
      { id: '3', name: 'Lijadora orbital 300W', address: 'Calle Uno 42', notes: 'Retiro en tienda.' },
    ];
    return (
      <div style={{ maxWidth: 640 }}>
        <DataTable
          rows={wide}
          rowKey={(r) => r.id}
          columns={[
            { key: 'name', header: 'Producto', width: 160, truncate: true },
            { key: 'address', header: 'Dirección', width: 220, truncate: true },
            { key: 'notes', header: 'Notas', width: 200, truncate: 2 },
          ]}
        />
      </div>
    );
  },
};

/**
 * **Virtualización** (v1.51.0): `virtualizeRows` ventanea 5.000 filas a
 * ~30 nodos DOM con spacers pixel-exactos. Requiere `maxHeight` y alturas
 * uniformes — se auto-desactiva con `renderExpanded`. En móvil sigue siendo
 * tabla (las cards no se ventanean; 5.000 tarjetas no es una opción): SKU se
 * esconde con `mobile: 'hidden'`. La selección opera sobre el dataset
 * completo (solo el DOM se ventanea). El sticky header + footer de totales
 * conviven con el windowing.
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
          { key: 'sku', header: 'SKU', mobile: 'hidden' },
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
 * Toolbar / filter zone + DataTable en UNA superficie redondeada. Se pasa
 * por el prop `toolbar`: el DataTable **posee** la superficie
 * (borde+radio+overflow), la toolbar queda clipeada al radio, hay UNA sola
 * divisoria con el header y la esquina queda limpia — sin apilar
 * card-border + filtro + header-top, sin costura. Esta ES la forma de
 * combinar una toolbar con un DataTable; no los envuelvas a mano en tu
 * propio contenedor bordeado (eso reintroduce la costura).
 */
// Hoisted: an element created inside render carries a fiber `_owner`, and
// Storybook's JSX source decorator recurses into nested arrays/objects — a
// fiber there is circular (stack overflow). Module scope has no owner.
const EXPORT_ACTIONS: ToolbarAction[] = [{ label: 'Exportar', icon: <Download size={16} />, onSelect: () => {} }];

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
          <TableToolbar overflow={EXPORT_ACTIONS}>
            <div className="grow"><Input placeholder="Buscar producto…" /></div>
            <Button variant="ghost" size="sm" iconLeft={<Filter size={16} />} hideLabel="mobile">Filtros</Button>
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
          key: 'acc', header: 'Acciones', align: 'right', mobile: 'actions',
          accessor: () => (
            <span style={{ display: 'inline-flex', gap: 8 }} data-row-interactive>
              <Button size="xs" variant="ghost" iconLeft={<Edit size={14} />} hideLabel="desktop">Editar</Button>
              <Button size="xs" variant="ghost-danger" iconLeft={<Trash size={14} />} hideLabel="desktop">Borrar</Button>
            </span>
          ),
        },
      ]}
    />
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

/** Card layout en mobile (default): bajo 600px cada fila es una tarjeta con
 * tres zonas según `Column.mobile` — cabecera (título con caption + estado +
 * checkbox), cuerpo (label · valor) y pie (acciones a lo ancho). Mismo DOM que
 * la tabla. Usa el viewport mobile en Storybook para verlo. */
export const CardLayoutMobile: StoryObj = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => {
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    return (
      <div style={{ background: 'var(--bg-canvas)', padding: 16 }}>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          selectable
          selectedKeys={sel}
          onSelectionChange={setSel}
          onRowClick={() => {}}
          columns={[
            { key: 'name', header: 'Producto', mobile: 'title' },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', align: 'right', mobile: 'status', accessor: (r) => (r.stock === 0 ? <Badge variant="danger">Sin stock</Badge> : <Badge variant="success">{r.stock} en stock</Badge>) },
            { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
            { key: 'actions', header: '', align: 'right', mobile: 'actions', accessor: () => <Button variant="outline" size="sm" data-row-interactive>Ver detalle</Button> },
          ]}
        />
      </div>
    );
  },
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
  state: 'rows' | 'empty' | 'emptyCustom' | 'loading' | 'error';
  density: 'compact' | 'comfortable';
  surface: 'standalone' | 'card' | 'elevated';
  selectable: boolean;
  interactive: boolean;
  expandable: boolean;
  totals: boolean;
  stickyHeader: boolean;
  bounded: boolean;
  mobileLayout: 'cards' | 'table';
}

/**
 * **Playground · DataTable.** Las props de la tabla combinadas en un solo
 * lugar (antes, una story por valor).
 *
 * - **`state`**: `rows={[]}` muestra el vacío por defecto o el slot `empty`
 *   (overlay hermano de la tabla, anclado y centrado en el área visible, con
 *   el header aún scrolleable para comunicar la forma); `loading` pinta un
 *   skeleton de 5 filas; `error` toma precedencia sobre todo y va en
 *   `role="alert"`.
 * - **`density`**: `compact` es el default legible (v1.10.0); `comfortable`
 *   es el registro previo, más alto por fila.
 * - **`surface`**: una tabla standalone es FLAT por default y dueña de su
 *   borde/radio; sobre un canvas tintado sube `--table-elevation` en un
 *   ancestro (aquí `var(--shadow-card)`) y el kit la aplica al wrap y al
 *   surface — la misma sombra que `<Card>`. Dentro de una Card pasa
 *   `surface="flush"`: sin él se ve doble borde y radio anidado.
 * - **`selectable`**: "seleccionar todo" opera sobre las filas presentes (una
 *   página del server = la página, no el dataset).
 * - **`interactive`**: fila navegable con `rowHref` — un `<a>` real estirado,
 *   operable por teclado, con nombre de lector de pantalla (`rowLabel`) y foco
 *   visible en la fila; markup de tabla válido, sin role hack en `<tr>`.
 * - **`expandable`**: `renderExpanded` agrega la columna del chevron; el
 *   panel es un `<tr>` extra a todo lo ancho, controlado igual que la
 *   selección (`expandedKeys` / `onExpandedChange`).
 * - **`totals`**: `Column.footer` renderiza un `<tfoot>` con la banda del
 *   header pero registro de dato; con `bounded` queda fijo al fondo del
 *   scroll box, espejo del sticky header. El kit NO suma por ti (el total de
 *   página ≠ total del dataset).
 * - **`stickyHeader` / `bounded`**: el header se pega al scroller más cercano
 *   — el interno con `maxHeight`, o uno externo (Modal, página) sin él.
 * - **`mobileLayout`**: cards (default) o tabla bajo 600px; angosta el canvas.
 */
export const DataTablePlayground: StoryObj<DataTablePlaygroundArgs> = {
  name: 'Playground · DataTable',
  args: { state: 'rows', density: 'compact', surface: 'standalone', selectable: false, interactive: false, expandable: false, totals: false, stickyHeader: false, bounded: false, mobileLayout: 'cards' },
  argTypes: {
    state: { control: 'inline-radio', options: ['rows', 'empty', 'emptyCustom', 'loading', 'error'] },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    surface: { control: 'inline-radio', options: ['standalone', 'card', 'elevated'], description: 'standalone = flat con borde propio · card = dentro de <Card> con surface="flush" · elevated = --table-elevation sobre canvas tintado' },
    selectable: { control: 'boolean' },
    interactive: { control: 'boolean', description: 'rowHref: la fila es un link real' },
    expandable: { control: 'boolean' },
    totals: { control: 'boolean', description: 'Column.footer (sticky bottom con bounded)' },
    stickyHeader: { control: 'boolean' },
    bounded: { control: 'boolean', description: 'maxHeight 320: scroll interno' },
    mobileLayout: { control: 'inline-radio', options: ['cards', 'table'] },
  },
  render: (a) => {
    type Row = { id: string; name: string; sku: string; stock: number; price: number };
    const many = React.useMemo<Row[]>(() => Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${100 + i}`,
      stock: (i * 7) % 30,
      price: 9990 + i * 5000,
    })), []);
    const data = a.state === 'rows' ? many : [];
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['1']));
    const money = (n: number) => `$${n.toLocaleString('es-CL')}`;
    const totalStock = many.reduce((s, r) => s + r.stock, 0);
    const totalPrice = many.reduce((s, r) => s + r.price, 0);
    const columns: Column<Row>[] = [
      { key: 'name', header: 'Producto', mobile: 'title', footer: a.totals ? 'Total (20 productos)' : undefined },
      { key: 'sku', header: 'SKU' },
      { key: 'stock', header: 'Stock', numeric: true, footer: a.totals ? totalStock : undefined },
      { key: 'price', header: 'Precio', numeric: true, accessor: (r) => money(r.price), footer: a.totals ? money(totalPrice) : undefined },
    ];
    const table = (
      <DataTable
        rows={data}
        rowKey={(r) => r.id}
        rowLabel={(r) => r.name}
        ariaLabel="Productos"
        columns={columns}
        density={a.density}
        surface={a.surface === 'card' ? 'flush' : 'card'}
        selectable={a.selectable}
        selectedKeys={sel}
        onSelectionChange={setSel}
        rowHref={a.interactive ? (r) => `#/productos/${r.id}` : undefined}
        renderExpanded={a.expandable ? (r) => (
          <div style={{ display: 'grid', gap: 4, fontSize: 'var(--text-sm)' }}>
            <strong>{r.name}</strong>
            <span>SKU {r.sku} · {r.stock} unidades en bodega central</span>
            <span>Último movimiento: hace 3 días</span>
          </div>
        ) : undefined}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        stickyHeader={a.stickyHeader}
        maxHeight={a.bounded ? 320 : undefined}
        mobileLayout={a.mobileLayout}
        loading={a.state === 'loading'}
        error={a.state === 'error' ? 'No pudimos cargar los productos. Reintenta en unos segundos.' : undefined}
        empty={a.state === 'emptyCustom' ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Sin productos en este filtro</strong>
            <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
              Ajusta los filtros o limpia la búsqueda para ver más resultados.
            </span>
          </div>
        ) : undefined}
      />
    );
    if (a.surface === 'card') return <Card><CardBody>{table}</CardBody></Card>;
    if (a.surface === 'elevated') {
      return (
        <div style={{ background: 'var(--bg-canvas, #eef1f5)', padding: 32, ['--table-elevation' as string]: 'var(--shadow-card)' }}>
          {table}
        </div>
      );
    }
    return table;
  },
};

/* Dataset ancho genérico (16 columnas de ancho fijo): la suma supera cualquier
   contenedor, para ejercitar scroll horizontal + pistas de borde. */
const WIDE_HEADERS = [
  'Producto', 'SKU', 'Categoría', 'Bodega', 'Lote', 'Proveedor', 'Unidad', 'Stock',
  'Reservado', 'Disponible', 'Costo', 'Precio', 'Margen', 'Actualizado', 'Responsable', 'Observación',
];
const makeWideCols = (n: number) => WIDE_HEADERS.slice(0, n).map((header, i) => ({ key: `c${i}`, header, width: i === 0 ? 220 : 120 }));
const makeWideRows = (n: number, cols: number) => Array.from({ length: n }, (_, r) => Object.fromEntries([
  ['id', String(r)],
  ...WIDE_HEADERS.slice(0, cols).map((h, i) => [`c${i}`, i === 0 ? `Producto ${r + 1}` : `${h} ${r + 1}`]),
])) as Array<Record<string, string>>;

interface ScrollRegionArgs {
  mode: 'fillHeight' | 'maxHeight';
  columns: number;
  rows: number;
  containerHeight: number;
  toolbar: boolean;
  pagination: boolean;
  virtualize: boolean;
}

/**
 * **Playground · región de scroll.** Cómo se comportan `fillHeight` / `maxHeight`
 * al combinarse con toolbar, paginación, virtualización y una tabla más ancha
 * que su contenedor. `fillHeight` (v3.2.0) llena el alto del contenedor (columna
 * flex de alto definido) sin número; `maxHeight` fija un tope. En ambos, el
 * sticky header se pega al scroller interno y las **pistas de borde**
 * (`has-more-{left,right,down}`) marcan hacia dónde queda contenido — antes de
 * 3.2.0 no se veían en modo acotado. Sube `columns` a 16 para el scroll
 * horizontal; `rows` a 400 + `virtualize` para el windowing; `rows` a 0 para el
 * vacío de una tabla más ancha que el viewport: el mensaje queda anclado y
 * centrado en el área visible (overlay hermano de la tabla, fuera del track
 * de scroll horizontal) mientras el header sigue scrolleable para comunicar la
 * forma de la tabla.
 */
export const RegionDeScrollPlayground: StoryObj<ScrollRegionArgs> = {
  name: 'Playground · región de scroll (fillHeight / maxHeight)',
  args: { mode: 'fillHeight', columns: 16, rows: 60, containerHeight: 520, toolbar: false, pagination: true, virtualize: false },
  argTypes: {
    mode: { control: 'inline-radio', options: ['fillHeight', 'maxHeight'] },
    columns: { control: { type: 'range', min: 3, max: 16, step: 1 } },
    rows: { control: 'inline-radio', options: [0, 12, 60, 400] },
    containerHeight: { control: 'inline-radio', options: [360, 520, 720] },
    toolbar: { control: 'boolean' },
    pagination: { control: 'boolean' },
    virtualize: { control: 'boolean' },
  },
  render: (a) => {
    const cols = React.useMemo(() => makeWideCols(a.columns), [a.columns]);
    const data = React.useMemo(() => makeWideRows(a.rows, a.columns), [a.rows, a.columns]);
    const [page, setPage] = React.useState(1);
    const isMobile = useMediaQuery('(max-width: 600px)');
    return (
      // The fixed-height container stands in for a page's `100dvh` column; on a
      // phone the table is cards and flows with the page, so the box goes.
      <div style={{ height: isMobile ? 'auto' : a.containerHeight, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong>Inventario</strong>
          <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>Contenedor de {a.containerHeight}px · {a.mode}</span>
        </div>
        <DataTable
          rows={data}
          rowKey={(r) => r.id}
          columns={cols}
          fillHeight={a.mode === 'fillHeight'}
          maxHeight={a.mode === 'maxHeight' ? 360 : undefined}
          stickyHeader
          density="compact"
          virtualizeRows={a.virtualize ? { rowHeight: 31 } : undefined}
          toolbar={a.toolbar ? <TableToolbar><Input placeholder="Buscar producto" /></TableToolbar> : undefined}
          ariaLabel="Inventario"
          empty={
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Sin movimientos en el período</strong>
              <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
                No hay registros entre las fechas elegidas. Prueba con otro rango.
              </span>
            </div>
          }
        />
        {a.pagination && a.rows > 0 && <TablePagination page={page} pageSize={a.rows} total={a.rows * 3} onPageChange={setPage} />}
      </div>
    );
  },
};
