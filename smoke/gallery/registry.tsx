'use client';
/* Smoke gallery: every real kit component rendered with minimal valid props.
   Ugly on purpose. Sub-components are rendered inside their parent and
   allowlisted in the coverage test. Stateful components use tiny local
   wrappers so they hydrate like a real app. */
import * as React from 'react';
import * as K from '@misael703/ui';
import type { TransferItem } from '@misael703/ui';
import { ICON_NAMES } from './icon-names';

const box: React.CSSProperties = { padding: 12, border: '1px solid #ccc', borderRadius: 8 };

function Ctrl<T>({ init, render }: { init: T; render: (v: T, set: (n: T) => void) => React.ReactNode }) {
  const [v, setV] = React.useState<T>(init);
  return <>{render(v, setV)}</>;
}

// Renders children only after client mount. `Portal` returns null during SSR
// (typeof-document guard) and portals on the client, so an *unconditional*
// SSR <Portal> hydration-mismatches by design — real consumers only open
// portals on interaction (client). This mirrors that realistic usage.
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return <>{mounted ? children : null}</>;
}

const cols = [
  { key: 'name', header: 'Producto', sortable: true },
  { key: 'sku', header: 'SKU' },
];
const rows = [{ id: '1', name: 'Cemento', sku: 'CEM-1' }, { id: '2', name: 'Fierro', sku: 'FRR-2' }];

export const ENTRIES: Array<{ name: string; node: React.ReactNode }> = [
  { name: 'Button', node: <K.Button>Guardar</K.Button> },
  { name: 'ButtonGroup', node: <K.ButtonGroup><K.Button>A</K.Button><K.Button>B</K.Button></K.ButtonGroup> },
  { name: 'IconButton', node: <K.IconButton icon={<K.ChevronDown size={16} />} aria-label="Opciones" /> },
  { name: 'Badge', node: <K.Badge variant="success" dot>Activo</K.Badge> },
  { name: 'Alert', node: <K.Alert variant="info" title="Aviso">texto</K.Alert> },
  { name: 'Spinner', node: <K.Spinner /> },
  { name: 'Skeleton', node: <K.Skeleton width={120} height={16} /> },
  { name: 'Divider', node: <K.Divider /> },
  { name: 'Separator', node: <K.Separator /> },
  { name: 'AspectRatio', node: <div style={{ width: 80 }}><K.AspectRatio ratio={1}><div /></K.AspectRatio></div> },
  { name: 'ScrollArea', node: <K.ScrollArea maxHeight={40}><div>scroll</div></K.ScrollArea> },
  { name: 'Card', node: <K.Card><K.CardHeader>H</K.CardHeader><K.CardBody>B</K.CardBody><K.CardFooter>F</K.CardFooter></K.Card> },
  { name: 'Chip', node: <K.ChipGroup><K.Chip active>x</K.Chip></K.ChipGroup> },
  { name: 'Avatar', node: <K.AvatarGroup><K.Avatar name="Misael Ocas" /></K.AvatarGroup> },
  { name: 'ProductCard', node: <K.ProductCard sku="S1" name="Cemento" price="$5.490" /> },
  { name: 'Input', node: <K.Input placeholder="sku" /> },
  { name: 'PasswordInput', node: <K.PasswordInput placeholder="contraseña" autoComplete="current-password" /> },
  { name: 'Textarea', node: <K.Textarea placeholder="notas" /> },
  { name: 'Select', node: <K.Select defaultValue="a"><option value="a">A</option></K.Select> },
  { name: 'Checkbox', node: <K.Checkbox defaultChecked /> },
  { name: 'Radio', node: <K.Radio name="r" defaultChecked /> },
  { name: 'Switch', node: <K.Switch defaultChecked /> },
  { name: 'Label', node: <K.Label required>Campo</K.Label> },
  { name: 'FormField', node: <K.FormField label="SKU" htmlFor="f1" hint="ej"><K.Input id="f1" /></K.FormField> },
  { name: 'InputGroup', node: <K.InputGroup><K.InputGroupAddon>$</K.InputGroupAddon><K.Input /></K.InputGroup> },
  { name: 'Toggle', node: <Ctrl init={false} render={(v, s) => <K.Toggle pressed={v} onPressedChange={s} aria-label="t">T</K.Toggle>} /> },
  { name: 'ToggleGroup', node: <Ctrl<string | null> init="a" render={(v, s) => <K.ToggleGroup type="single" value={v} onChange={s} ariaLabel="g"><K.ToggleGroupItem value="a">A</K.ToggleGroupItem><K.ToggleGroupItem value="b">B</K.ToggleGroupItem></K.ToggleGroup>} /> },
  { name: 'NumberInput', node: <Ctrl<number | null> init={1} render={(v, s) => <K.NumberInput value={v} onChange={s} min={0} max={9} />} /> },
  { name: 'Slider', node: <Ctrl init={5} render={(v, s) => <K.Slider value={v} onChange={s} min={0} max={10} />} /> },
  { name: 'InputOTP', node: <Ctrl init="" render={(v, s) => <K.InputOTP value={v} onChange={s} length={4} />} /> },
  { name: 'TagInput', node: <Ctrl<string[]> init={['a']} render={(v, s) => <K.TagInput value={v} onChange={s} />} /> },
  { name: 'MoneyInput', node: <Ctrl<number | null> init={1000} render={(v, s) => <K.MoneyInput value={v} onChange={s} />} /> },
  { name: 'PhoneInput', node: <Ctrl init="" render={(v, s) => <K.PhoneInput value={v} onChange={s} />} /> },
  { name: 'TimePicker', node: <Ctrl init="08:00" render={(v, s) => <K.TimePicker value={v} onChange={s} />} /> },
  { name: 'RadioGroup', node: <Ctrl<string | null> init="a" render={(v, s) => <K.RadioGroup name="rg" value={v} onChange={s} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />} /> },
  { name: 'CheckboxGroup', node: <Ctrl<string[]> init={['a']} render={(v, s) => <K.CheckboxGroup value={v} onChange={s} options={[{ value: 'a', label: 'A' }]} />} /> },
  { name: 'Combobox', node: <Ctrl<string | null> init="b" render={(v, s) => <K.Combobox value={v} onChange={s} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }]} />} /> },
  { name: 'MultiCombobox', node: <Ctrl<string[]> init={['a', 'zzz']} render={(v, s) => <K.MultiCombobox value={v} onChange={s} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} resolveLabel={(val) => val === 'zzz' ? 'Inactivo (fuera de opciones)' : undefined} />} /> },
  { name: 'DatePicker', node: <Ctrl<Date | null> init={null} render={(v, s) => <K.DatePicker value={v} onChange={s} isDateDisabled={(d) => d.getDay() === 0} />} /> },
  { name: 'DateRangePicker', node: <Ctrl<{ from: Date | null; to: Date | null }> init={{ from: null, to: null }} render={(v, s) => <K.DateRangePicker value={v} onChange={s} />} /> },
  { name: 'YearPicker', node: <Ctrl<number | null> init={2025} render={(v, s) => <K.YearPicker value={v} onChange={s} />} /> },
  { name: 'MonthPicker', node: <Ctrl<Date | null> init={null} render={(v, s) => <K.MonthPicker value={v} onChange={s} />} /> },
  { name: 'FileUpload', node: <K.FileUpload onFiles={() => {}} /> },
  { name: 'SortDropdown', node: <Ctrl init="a" render={(v, s) => <K.SortDropdown value={v} onChange={s} options={[{ value: 'a', label: 'A' }]} />} /> },
  { name: 'Tabs', node: <K.Tabs defaultValue="a"><K.TabList><K.Tab value="a">A</K.Tab></K.TabList><K.TabPanel value="a">x</K.TabPanel></K.Tabs> },
  { name: 'Stepper', node: <K.Stepper current={1} steps={[{ label: 'Uno' }, { label: 'Dos' }]} /> },
  { name: 'SectionHeader', node: <K.SectionHeader title="Pedidos recientes" actions={<a href="#" className="caption">Ver todos</a>} /> },
  { name: 'Container', node: <K.Container size="md"><div>c</div></K.Container> },
  { name: 'Grid', node: <K.Grid minColWidth={80}><div>1</div><div>2</div></K.Grid> },
  { name: 'Stack', node: <K.Stack gap={2}><div>1</div></K.Stack> },
  { name: 'HStack', node: <K.HStack gap={2}><div>1</div></K.HStack> },
  { name: 'VStack', node: <K.VStack gap={2}><div>1</div></K.VStack> },
  { name: 'KeyValue', node: <K.KeyValue><K.KeyValueRow label="A">b</K.KeyValueRow></K.KeyValue> },
  { name: 'ListGroup', node: <K.ListGroup><K.ListGroupItem>row</K.ListGroupItem></K.ListGroup> },
  { name: 'Table', node: <K.Table><tbody><tr><td>x</td></tr></tbody></K.Table> },
  { name: 'DataTable', node: <K.DataTable rows={rows} rowKey={(r) => r.id} columns={cols} ariaLabel="t" /> },
  { name: 'TablePagination', node: <Ctrl init={1} render={(v, s) => <K.TablePagination page={v} pageSize={10} total={50} onPageChange={s} />} /> },
  { name: 'TableToolbar', node: <K.TableToolbar><span>t</span></K.TableToolbar> },
  { name: 'ColumnToggle', node: <Ctrl init={new Set<string>()} render={(v, s) => <K.ColumnToggle columns={cols} hiddenKeys={v} onChange={s} />} /> },
  { name: 'EditableCell', node: <Ctrl init="45000" render={(v, s) => <K.EditableCell value={v} onCommit={s} ariaLabel="Editar valor" />} /> },
  { name: 'Pagination', node: <Ctrl init={1} render={(v, s) => <K.Pagination page={v} pageSize={10} total={50} onPageChange={s} />} /> },
  { name: 'Accordion', node: <K.Accordion defaultOpen={['a']}><K.AccordionItem id="a" title="A">x</K.AccordionItem></K.Accordion> },
  { name: 'Collapsible', node: <K.Collapsible><K.CollapsibleTrigger>Ver detalles</K.CollapsibleTrigger><K.CollapsibleContent>c</K.CollapsibleContent></K.Collapsible> },
  { name: 'Breadcrumbs', node: <K.Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Aquí' }]} /> },
  { name: 'EmptyState', node: <K.EmptyState title="Vacío" description="nada" /> },
  { name: 'Kpi', node: <K.Kpi label="Ventas" value="$1M" /> },
  { name: 'Stat', node: <K.Stat label="X" value="1" /> },
  { name: 'DeltaBadge', node: <K.DeltaBadge value={12.4} /> },
  { name: 'StatCard', node: <K.StatCard label="Ventas" value="$1.2M" delta={8.2} caption="vs. ayer" /> },
  { name: 'Meter', node: <K.Meter label="Stock" value={72} low={20} high={80} /> },
  { name: 'Sparkbar', node: <K.Sparkbar data={[3, 5, 2, 8, 6, 9]} highlightLast /> },
  { name: 'ProportionBar', node: <K.ProportionBar segments={[{ label: 'Pagado', value: 60 }, { label: 'Pendiente', value: 40 }]} /> },
  { name: 'BulletChart', node: <K.BulletChart label="Meta" value={70} target={80} ranges={[50, 75, 100]} /> },
  { name: 'CalendarHeatmap', node: <K.CalendarHeatmap data={Array.from({ length: 14 }, (_, i) => ({ value: i % 5 }))} rows={7} /> },
  { name: 'StatusIndicator', node: <K.StatusIndicator tone="success" label="ok" /> },
  { name: 'Progress', node: <K.Progress value={40} /> },
  { name: 'ProgressCircle', node: <K.ProgressCircle value={40} /> },
  { name: 'Tree', node: <K.Tree nodes={[{ id: 'a', label: 'A' }]} /> },
  { name: 'Timeline', node: <K.Timeline><K.TimelineItem title="Paso" /></K.Timeline> },
  { name: 'UserCell', node: <K.UserCell name="Misael" meta="admin" /> },
  { name: 'Calendar', node: <K.Calendar /> },
  { name: 'CodeBlock', node: <K.CodeBlock>{'const x = 1;'}</K.CodeBlock> },
  { name: 'JsonViewer', node: <K.JsonViewer data={{ a: 1 }} /> },
  { name: 'DescriptionList', node: <K.DescriptionList><K.DescriptionListItem label="A" value="b" /></K.DescriptionList> },
  { name: 'DiffViewer', node: <K.DiffViewer entries={[{ field: 'F', before: 'a', after: 'b' }]} /> },
  { name: 'TransferList', node: <Ctrl<TransferItem[]> init={[]} render={(v, s) => <K.TransferList source={[{ id: 'a', label: 'A' }]} selected={v} onChange={s} />} /> },
  { name: 'PermissionMatrix', node: <Ctrl<Record<string, string[]>> init={{}} render={(v, s) => <K.PermissionMatrix roles={[{ id: 'r', label: 'R' }]} actions={[{ id: 'a', label: 'A' }]} value={v} onChange={s} />} /> },
  { name: 'CommentThread', node: <K.CommentThread comments={[{ id: '1', author: { name: 'M' }, body: 'hola', timestamp: 'hoy' }]} onAdd={() => {}} /> },
  { name: 'TimeAgo', node: <K.TimeAgo iso="2026-06-02T14:25:00" /> },
  { name: 'TimeAgoDate', node: <K.TimeAgoDate iso="2026-06-02" /> },
  { name: 'AttachmentList', node: <K.AttachmentList attachments={[{ id: '1', name: 'a.pdf', size: '1KB' }]} /> },
  { name: 'ConfirmDialog', node: <K.ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="¿Seguro?" /> },
  { name: 'Modal', node: <K.Modal open={false} onClose={() => {}} title="M">x</K.Modal> },
  { name: 'Drawer', node: <K.Drawer open={false} onClose={() => {}} title="D">x</K.Drawer> },
  { name: 'Tooltip', node: <K.Tooltip label="tip"><span>hover</span></K.Tooltip> },
  { name: 'Popover', node: <K.Popover trigger={<button>p</button>}>contenido</K.Popover> },
  { name: 'UserMenu', node: <K.UserMenu name="Misael Ocas" role="Admin" items={[{ label: 'Perfil' }, 'separator', { label: 'Salir', danger: true }]} /> },
  { name: 'HoverCard', node: <K.HoverCard trigger={<span>h</span>}>card</K.HoverCard> },
  { name: 'ContextMenu', node: <K.ContextMenu items={[{ id: 'a', label: 'A', onSelect: () => {} }]}><span>right-click</span></K.ContextMenu> },
  { name: 'Menu', node: <K.Menu trigger={<button>menu</button>} items={[{ label: 'A', onSelect: () => {} }]} /> },
  { name: 'Menubar', node: <K.Menubar menus={[{ id: 'f', label: 'Archivo', items: [{ id: 'n', label: 'Nuevo', onSelect: () => {} }] }]} /> },
  { name: 'NavigationMenu', node: <K.NavigationMenu items={[{ id: 'a', label: 'A', links: [{ id: 'l', label: 'L', href: '#' }] }]} /> },
  { name: 'NotificationCenter', node: <K.NotificationCenter notifications={[{ id: '1', title: 'N', timestamp: 'hoy', read: false }]} /> },
  { name: 'Carousel', node: <K.Carousel><div>1</div><div>2</div></K.Carousel> },
  { name: 'ResizableGroup', node: <K.ResizableGroup direction="horizontal"><K.ResizablePanel id="p1">a</K.ResizablePanel><K.ResizableHandle panelId="p1" /><K.ResizablePanel id="p2">b</K.ResizablePanel></K.ResizableGroup> },
  { name: 'ImageGallery', node: <K.ImageGallery images={[{ src: 'data:,', alt: 'a' }]} /> },
  { name: 'Logo', node: <K.Logo variant="mark" bg="light" height={24} /> },
  { name: 'AppShell', node: <div style={{ height: 200 }}><K.AppShell sections={[{ items: [{ id: 'h', label: 'Inicio', href: '#' }] }]}><K.PageHeader title="P" /></K.AppShell></div> },
  { name: 'Hero', node: <K.Hero title="Hero" /> },
  { name: 'Testimonial', node: <K.Testimonial quote="bueno" author="M" /> },
  { name: 'CategoryNav', node: <K.CategoryNav categories={[{ id: 'a', label: 'A', groups: [] }]} /> },
  { name: 'FilterPanel', node: <K.FilterPanel activeCount={1} onClearAll={() => {}}><K.FilterSection title="S"><span>f</span></K.FilterSection></K.FilterPanel> },
  { name: 'FilterBar', node: <K.FilterBar actions={<K.Button size="sm">x</K.Button>}><K.FilterField label="Estado"><K.Select><option>Todos</option></K.Select></K.FilterField></K.FilterBar> },
  { name: 'BulkActionBar', node: <K.BulkActionBar selectedCount={2} onClear={() => {}}><K.Button size="sm">x</K.Button></K.BulkActionBar> },
  { name: 'Rating', node: <K.Rating value={4} /> },
  { name: 'PriceDisplay', node: <K.PriceDisplay amount={5490} /> },
  { name: 'QuantitySelector', node: <Ctrl init={1} render={(v, s) => <K.QuantitySelector value={v} onChange={s} />} /> },
  { name: 'VariantSelector', node: <Ctrl<string | null> init="a" render={(v, s) => <K.VariantSelector label="C" value={v} onChange={s} options={[{ value: 'a', label: 'A' }]} />} /> },
  { name: 'WishlistButton', node: <Ctrl init={false} render={(v, s) => <K.WishlistButton active={v} onToggle={s} />} /> },
  { name: 'PromoCodeInput', node: <K.PromoCodeInput onApply={async () => 'ok'} /> },
  { name: 'FreeShippingProgress', node: <K.FreeShippingProgress current={1} threshold={2} /> },
  { name: 'CartDrawer', node: <K.CartDrawer open={false} onClose={() => {}} items={[]} onQuantityChange={() => {}} onRemove={() => {}} onCheckout={() => {}} /> },
  { name: 'OrderSummary', node: <K.OrderSummary rows={[{ label: 'Total', value: '$1', emphasis: true }]} /> },
  { name: 'AddressForm', node: <Ctrl<Record<string, string>> init={{}} render={(v, s) => <K.AddressForm fields={[{ key: 'n', label: 'Nombre' }]} value={v} onChange={s} />} /> },
  { name: 'CompareTable', node: <K.CompareTable items={[{ id: '1', name: 'A', price: '$1' }]} attributes={[{ key: 'k', label: 'K', values: { '1': 'v' } }]} onRemove={() => {}} /> },
  // Charts take a consumer-provided `recharts` prop; the detector doesn't pull
  // recharts in. They are covered by the ESM/CJS resolution scripts (import
  // resolves) + type checks, not visually. Present here so coverage passes.
  { name: 'LineChart', node: <em>import-only (consumer recharts)</em> },
  { name: 'AreaChart', node: <em>import-only (consumer recharts)</em> },
  { name: 'BarChart', node: <em>import-only (consumer recharts)</em> },
  { name: 'DonutChart', node: <em>import-only (consumer recharts)</em> },
  { name: 'Sparkline', node: <em>import-only (consumer recharts)</em> },
  { name: 'CommandPalette', node: <K.CommandPalette open={false} onClose={() => {}} items={[{ id: 'a', label: 'A', onRun: () => {} }]} /> },
  { name: 'Portal', node: <ClientOnly><K.Portal><span>portal</span></K.Portal></ClientOnly> },
  { name: 'Slot', node: <K.Slot><span>slot</span></K.Slot> },
  { name: 'Cluster', node: <K.Cluster gap={2}><K.Badge>a</K.Badge><K.Badge>b</K.Badge></K.Cluster> },
  { name: 'Spacer', node: <div style={{ display: 'flex', width: 120 }}><span>a</span><K.Spacer /><span>b</span></div> },
  { name: 'SegmentedControl', node: <Ctrl<string | null> init="a" render={(v, s) => <K.SegmentedControl value={v} onChange={s} ariaLabel="seg"><K.SegmentedControlItem value="a">A</K.SegmentedControlItem><K.SegmentedControlItem value="b">B</K.SegmentedControlItem></K.SegmentedControl>} /> },
];

export function IconGrid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {ICON_NAMES.map((n) => {
        const Icon = (K as unknown as Record<string, React.ComponentType<{ size?: number }>>)[n];
        return Icon ? <Icon key={n} size={18} /> : <span key={n} data-missing-icon={n} />;
      })}
    </div>
  );
}

export function Gallery() {
  return (
    <K.LocaleProvider>
      <K.ToastProvider>
        <main style={{ display: 'grid', gap: 12, padding: 16 }}>
          <h1>kit smoke gallery</h1>
          <section style={box}>
            <h2>Icons</h2>
            <IconGrid />
          </section>
          {ENTRIES.map((e) => (
            <section key={e.name} style={box} data-comp={e.name}>
              <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>{e.name}</h2>
              {e.node}
            </section>
          ))}
        </main>
      </K.ToastProvider>
    </K.LocaleProvider>
  );
}
