import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, TablePagination, type Column } from './DataTable';
import { FilterBar, FilterField, BulkActionBar } from './Filters';
import { PageHeader } from './AppShell';
import { Button } from './Button';
import { FormField, Input, Select } from './Form';
import { NumberInput, EmptyState } from './Inputs';
import { Modal, Drawer } from './Overlay';
import { Badge, Skeleton } from './Display';
import { AlertTriangle } from './Icons';
import { ToastProvider, useToast } from './Toast';

export default { title: 'Patterns/CRUD', tags: ['autodocs'] } as Meta;

/* ---------- Dominio de muestra genérico del kit ---------------------------- */
const CATEGORIES = ['Herramientas', 'Eléctrico', 'Construcción'] as const;
type Category = (typeof CATEGORIES)[number];
interface Product { id: string; name: string; sku: string; category: Category; stock: number; price: number }

const NAMES = ['Taladro percutor', 'Sierra circular', 'Lijadora orbital', 'Cemento 25 kg', 'Fierro 12 mm', 'Malla acma', 'Cable 2,5 mm', 'Interruptor doble', 'Enchufe triple', 'Martillo carpintero', 'Nivel 60 cm', 'Yeso 20 kg'];
const seed = (n: number): Product[] => Array.from({ length: n }, (_, i) => ({
  id: String(i + 1),
  name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''}`,
  sku: `SKU-${String(1000 + i)}`,
  category: CATEGORIES[i % CATEGORIES.length],
  stock: (i * 7) % 40,
  price: 4990 + (i % 9) * 5000,
}));

const PAGE_SIZE = 8;
const money = (n: number) => `$${n.toLocaleString('es-CL')}`;

interface CrudArgs {
  rows: 0 | 12 | 200;
  editIn: 'drawer' | 'modal';
  state: 'idle' | 'loading' | 'error';
  selectable: boolean;
}

interface FormState { name: string; sku: string; category: Category; stock: number | null; price: number | null }
const EMPTY_FORM: FormState = { name: '', sku: '', category: 'Herramientas', stock: 0, price: null };

function validate(f: FormState, items: Product[], editingId: string | null): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!f.name.trim()) e.name = 'Ingresa un nombre';
  if (!f.sku.trim()) e.sku = 'Ingresa un SKU';
  else if (items.some((p) => p.sku === f.sku.trim() && p.id !== editingId)) e.sku = 'Ese SKU ya existe';
  if (f.stock == null || f.stock < 0) e.stock = 'El stock no puede ser negativo';
  if (f.price == null || f.price <= 0) e.price = 'Ingresa un precio mayor a 0';
  return e;
}

/**
 * **Playground · CRUD.** El ciclo completo de un recurso, con estado local real
 * (crea, edita y borra de verdad dentro del Storybook), para ver cómo se
 * comportan las piezas al juntarse: la receta de listado (`PageHeader` →
 * `DataTable` con `FilterBar` en `toolbar`: N campos, aquí tres), acciones por fila, selección con
 * `BulkActionBar`, crear/editar en `Drawer` o `Modal` con `FormField` y
 * validación, confirmación de borrado en `Modal`, `Toast` de resultado,
 * paginación, y los tres vacíos: sin datos, sin resultados por filtro, cargando
 * y error. Controls: `rows` (0 = vacío inicial, 200 = paginación real),
 * `editIn`, `state`, `selectable`.
 */
export const CrudPlayground: StoryObj<CrudArgs> = {
  name: 'Playground · CRUD',
  parameters: { layout: 'fullscreen' },
  args: { rows: 12, editIn: 'drawer', state: 'idle', selectable: true },
  argTypes: {
    rows: { control: 'inline-radio', options: [0, 12, 200] },
    editIn: { control: 'inline-radio', options: ['drawer', 'modal'] },
    state: { control: 'inline-radio', options: ['idle', 'loading', 'error'] },
    selectable: { control: 'boolean' },
  },
  render: (a) => <ToastProvider><CrudPage {...a} /></ToastProvider>,
};

function CrudPage(a: CrudArgs) {
  const { push } = useToast();
  const [items, setItems] = React.useState<Product[]>(() => seed(a.rows));
  React.useEffect(() => { setItems(seed(a.rows)); setPage(1); setSelected(new Set()); }, [a.rows]);

  // Filtros (la receta): búsqueda libre + un selector estático.
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState<'all' | Category>('all');
  const [availability, setAvailability] = React.useState<'all' | 'in' | 'out'>('all');
  const hasFilters = q !== '' || category !== 'all' || availability !== 'all';
  const clearFilters = () => { setQ(''); setCategory('all'); setAvailability('all'); setPage(1); };
  const filtered = React.useMemo(() => items.filter((p) =>
    (category === 'all' || p.category === category) &&
    (availability === 'all' || (availability === 'in' ? p.stock > 0 : p.stock === 0)) &&
    (q === '' || `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))
  ), [items, q, category, availability]);

  const [page, setPage] = React.useState(1);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Editor (crear / editar).
  const [editing, setEditing] = React.useState<{ id: string | null; form: FormState } | null>(null);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const openCreate = () => { setErrors({}); setEditing({ id: null, form: EMPTY_FORM }); };
  const openEdit = (p: Product) => { setErrors({}); setEditing({ id: p.id, form: { name: p.name, sku: p.sku, category: p.category, stock: p.stock, price: p.price } }); };
  const setForm = (patch: Partial<FormState>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e));
  const save = () => {
    if (!editing) return;
    const e = validate(editing.form, items, editing.id);
    setErrors(e);
    if (Object.keys(e).length) return;
    const f = editing.form;
    const product: Product = { id: editing.id ?? String(Date.now()), name: f.name.trim(), sku: f.sku.trim(), category: f.category, stock: f.stock ?? 0, price: f.price ?? 0 };
    setItems((list) => (editing.id ? list.map((p) => (p.id === editing.id ? product : p)) : [product, ...list]));
    push({ variant: 'success', title: editing.id ? 'Producto actualizado' : 'Producto creado', description: product.name });
    setEditing(null);
  };

  // Borrado con confirmación (uno o la selección).
  const [confirm, setConfirm] = React.useState<{ ids: string[]; label: string } | null>(null);
  const doDelete = () => {
    if (!confirm) return;
    const ids = new Set(confirm.ids);
    setItems((list) => list.filter((p) => !ids.has(p.id)));
    setSelected((s) => new Set([...s].filter((id) => !ids.has(id))));
    push({ variant: 'info', title: ids.size === 1 ? 'Producto eliminado' : `${ids.size} productos eliminados` });
    setConfirm(null);
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Producto', accessor: (p) => <><span>{p.name}</span><span className="cell-meta">{p.sku}</span></> },
    { key: 'category', header: 'Categoría', hideOnMobile: true, accessor: (p) => <Badge variant="neutral">{p.category}</Badge> },
    { key: 'stock', header: 'Stock', numeric: true, accessor: (p) => (p.stock === 0 ? <Badge variant="danger">Sin stock</Badge> : p.stock) },
    { key: 'price', header: 'Precio', numeric: true, hideOnMobile: true, accessor: (p) => money(p.price) },
    // Row actions are desktop chrome; on a phone the column goes and the row
    // itself opens the editor (onRowClick), where Eliminar also lives.
    // `data-row-interactive` keeps these buttons from activating the row.
    { key: 'actions', header: '', align: 'right', width: 150, hideOnMobile: true, accessor: (p) => (
      <span style={{ display: 'inline-flex', gap: 4 }}>
        <Button variant="ghost" size="sm" data-row-interactive onClick={() => openEdit(p)}>Editar</Button>
        <Button variant="ghost" size="sm" data-row-interactive onClick={() => setConfirm({ ids: [p.id], label: p.name })}>Eliminar</Button>
      </span>
    ) },
  ];

  const emptyNode = items.length === 0
    ? <EmptyState title="Sin productos" description="Crea el primero para empezar el catálogo." action={<Button onClick={openCreate}>Nuevo producto</Button>} />
    : <EmptyState title="Sin resultados" description="Ningún producto coincide con los filtros." action={<Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>} />;

  const editorFields = editing && (
    // minmax(0, 1fr): a bare `1fr` (or an implicit auto track) has an `auto`
    // minimum and grows to the widest field's max-content, overflowing the
    // drawer. Grid's most common trap; declare the floor explicitly.
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
      <FormField label="Nombre" htmlFor="crud-name" required error={errors.name}>
        <Input id="crud-name" value={editing.form.name} invalid={!!errors.name} onChange={(e) => setForm({ name: e.target.value })} />
      </FormField>
      <FormField label="SKU" htmlFor="crud-sku" required error={errors.sku} hint="Único por producto">
        <Input id="crud-sku" value={editing.form.sku} invalid={!!errors.sku} onChange={(e) => setForm({ sku: e.target.value })} />
      </FormField>
      <FormField label="Categoría" htmlFor="crud-cat">
        <Select id="crud-cat" value={editing.form.category} onChange={(e) => setForm({ category: e.target.value as Category })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <FormField label="Stock" htmlFor="crud-stock" error={errors.stock}>
          <NumberInput id="crud-stock" value={editing.form.stock} min={0} onChange={(v) => setForm({ stock: v })} suffix="u" fullWidth />
        </FormField>
        <FormField label="Precio" htmlFor="crud-price" required error={errors.price}>
          <NumberInput id="crud-price" value={editing.form.price} min={0} step={100} onChange={(v) => setForm({ price: v })} prefix="$" fullWidth />
        </FormField>
      </div>
    </div>
  );
  const editorFooter = (
    <>
      {editing?.id && (
        <Button variant="ghost" onClick={() => { const p = items.find((x) => x.id === editing.id); setEditing(null); if (p) setConfirm({ ids: [p.id], label: p.name }); }} style={{ marginRight: 'auto', color: 'var(--color-danger)' }}>Eliminar</Button>
      )}
      <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
      <Button onClick={save}>{editing?.id ? 'Guardar cambios' : 'Crear producto'}</Button>
    </>
  );
  const editorTitle = editing?.id ? 'Editar producto' : 'Nuevo producto';

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, alignContent: 'start' }}>
      <PageHeader title="Productos" description="Catálogo de la sucursal." actions={<Button onClick={openCreate}>Nuevo producto</Button>} />

      {a.selectable && selected.size > 0 && (
        <BulkActionBar selectedCount={selected.size} onClear={() => setSelected(new Set())}>
          <Button variant="danger" size="sm" onClick={() => setConfirm({ ids: [...selected], label: `${selected.size} productos` })}>Eliminar</Button>
        </BulkActionBar>
      )}

      <DataTable
        ariaLabel="Productos"
        toolbar={
          <FilterBar
            summary={a.state === 'loading' ? <Skeleton width={72} height={14} /> : a.state === 'error' ? '—' : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}
            actions={hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar</Button> : undefined}
          >
            <FilterField label="Buscar"><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Nombre o SKU" /></FilterField>
            <FilterField label="Categoría">
              <Select value={category} onChange={(e) => { setCategory(e.target.value as 'all' | Category); setPage(1); }}>
                <option value="all">Todas</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FilterField>
            <FilterField label="Disponibilidad">
              <Select value={availability} onChange={(e) => { setAvailability(e.target.value as 'all' | 'in' | 'out'); setPage(1); }}>
                <option value="all">Todos</option>
                <option value="in">Con stock</option>
                <option value="out">Sin stock</option>
              </Select>
            </FilterField>
          </FilterBar>
        }
        columns={columns}
        rows={a.state === 'idle' ? pageRows : []}
        rowKey={(p) => p.id}
        onRowClick={openEdit}
        loading={a.state === 'loading'}
        // The overlay is already role="alert" (red, centred): give it a STATE,
        // not a second Alert. EmptyState with a danger icon + retry action.
        error={a.state === 'error' ? (
          <div style={{ color: 'var(--fg-default)' }}>
            <EmptyState icon={<AlertTriangle size={28} />} title="No se pudo cargar el catálogo" description="Revisa la conexión e intenta de nuevo." action={<Button variant="outline" size="sm">Reintentar</Button>} />
          </div>
        ) : undefined}
        empty={emptyNode}
        selectable={a.selectable}
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      {a.state === 'idle' && filtered.length > PAGE_SIZE && (
        <TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      )}

      {a.editIn === 'drawer'
        ? <Drawer open={editing != null} onClose={() => setEditing(null)} title={editorTitle} footer={editorFooter}>{editorFields}</Drawer>
        : <Modal open={editing != null} onClose={() => setEditing(null)} title={editorTitle} footer={editorFooter}>{editorFields}</Modal>}

      <Modal
        open={confirm != null}
        onClose={() => setConfirm(null)}
        title="Eliminar"
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button><Button variant="danger" onClick={doDelete}>Eliminar</Button></>}
      >
        ¿Eliminar {confirm?.label}? Esta acción no se puede deshacer.
      </Modal>
    </div>
  );
}
