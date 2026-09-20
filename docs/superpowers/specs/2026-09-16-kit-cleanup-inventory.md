# Kit cleanup 2026-09 — inventory (exact targets)

Produced 2026-09-16 on `main` at 4.3.0 by four read-only inventory agents. Line
numbers are valid for that commit; re-grep before editing if HEAD moved.

## I1. Stale name `@misael703/elalba-ui`

| File:line | Context |
|---|---|
| `src/index.ts:1` | header |
| `src/brand.ts:15` | JSDoc snippet |
| `src/styles/index.css:1-2` | header + snippet |
| `src/styles/tokens.css:2` | header |
| `src/styles/fonts.css:2,4,5` | header + 2 snippets |
| `src/fonts/OFL.txt:1` | license notice |
| `src/presets/elalba/styles.css:13,124` | history |
| `src/presets/elalba/defaults.ts:16` | history |
| `README.md:32-44` | "Migrando desde" section |
| `CHANGELOG.md` | 13 mentions — historical, keep |

## I2. Consumer names in comments of shipped code

- `src/styles/_root.css` (20): lines 61, 91, 122, 153, 163, 194, 199, 205, 243, 246, 284, 300, 301, 397, 455, 528, 563, 622, 650, 654 ("El Alba" / "despachos").
- `src/styles/index.css` (8): 79, 522, 656, 2207, 2404, 3101, 4483, 4546.
- `src/components/AdvancedPickers.tsx:311` "(Bsale-style)", `:496` "(like Bsale)".
- `src/components/Display3.tsx:72` "(a despachos".
- `src/utils/smartTime.ts:36` "from Bsale/APIs".

## I3. Spanish comments/JSDoc (files, count)

Logo.tsx 16 · brand.ts 13 · Commerce.tsx 10 · utils/format.ts 9 · Toggle.tsx 9 · styles/index.css 6 · Icons.tsx 6 · cl/index.ts 5 · styles/fonts.css 4 · AdvancedPickers.tsx 3 · _root.css 2 · locale/messages.ts 2 · Marketing.tsx 2 · Editing.tsx 2 · DataTable.tsx 2 · AppShell.tsx 2 · Notifications.tsx 1 · Layout.tsx 1 · Form.tsx 1 · Display3.tsx 1 · Comments.tsx 1.

## I4. Hardcoded UI strings outside the dictionary

| File:line | String |
|---|---|
| `NavigationMenu.tsx:34` | `ariaLabel = 'Navegación principal'` |
| `Menubar.tsx:29` | `ariaLabel = 'Barra de menús'` |
| `ContextMenu.tsx:26` | `ariaLabel = 'Menú contextual'` |
| `Resizable.tsx:129` | `ariaLabel = 'Redimensionar'` |
| `Carousel.tsx:25` | `ariaLabel = 'Carrusel'` |
| `Carousel.tsx:113` / `:122` | `aria-label="Anterior"` / `"Siguiente"` |
| `Marketing.tsx:117` | `aria-label="Categorías"` |
| `DataTable.tsx:927` | `aria-label="Breadcrumb"` |
| `InputsExtra.tsx:348` | `PhoneInput placeholder = '9 1234 5678'` |
| `AdvancedPickers.tsx:276-278` | `DEFAULT_PRESET_LABELS` (8 labels), consumed at `:319` |
| `utils/dateFormat.ts:270` | `?? 'es-CL'` fallback in code |

Locale: `src/locale/` = `es.ts`, `index.ts`, `LocaleProvider.tsx`, `messages.ts`. `UiKitMessages` has 147 typed keys. `LocaleProvider.tsx:19` merges over `esMessages`; `:31` `useLocale` falls back to `esMessages`.

## I5. Stories with company/Chile fixtures (hits)

Foundations.stories 12 · Commerce 8 · Display3 7 · Display 6 · DataTable 5 · Layout 4 · InputsExtra 4 · Metrics 3 · Marketing 3 · Comments 3 · Pickers 2 · Logo 2 · Editing 2 · Overlay, NavigationMenu, FloatingPortal, Crud, Code, Button, AppShell, AdvancedPickers 1 each. `.storybook/preview.tsx`: `:15,17` preset import, `:19` `PRESET_STYLE_ID = 'sb-preset-elalba'`, `:48,54` branch, `:131` description, `:138` toolbar item `'El Alba (preset)'`.

## I6. Blocks (27)

| Block | Class | Real data hits |
|---|---|---|
| AdminDashboard, AuditLogPage, CartDrawer, DataTablePage, EmptyStatePage, ErrorPage, NotFound, NotificationsPage, ProductCatalog, WizardPage | Generic | 0 |
| AuthScreen, AuthSplit, OnboardingChecklist | Generic | 1 each |
| DetailPage, SettingsPage | Generic | 2 each |
| CheckoutSummary | Generic (commerce) | 4 |
| InvoiceDocument | Generic (commerce) | 8 (`:26-46` company, RUT, giro, email, `IVA_RATE`) |
| DispatchBoard, RouteMap, RouteSchedule, DeliveryTimeline | Domain → despachos | 0 |
| RentalBoard, RentalBooking, ReturnInspection, ToolCatalog | Domain → rentools | 0 |
| AvailabilityCalendar | Domain → rentools | 1 |
| RentalDetail | Domain → rentools | 2 |
| RentalAgreement | Domain → rentools | 5 (`:18-45`) |

Docs: `src/blocks/README.md` (English), `docs/BLOCKS.md` (Spanish, voseo, stale "v1.15.0") — same contract twice.

## I7. README / CHANGELOG / commits

README outline (569 lines): `## Instalación` L11 (`### Migrando desde elalba-ui` L32) · `## Uso en Next.js` L46 · `## Interop con Tailwind` L97 · `## Costo del CSS` L126 · `## Blocks` L152 (Genéricos L158, Commerce L175, Dominio Despachos L183, Dominio Rentools L191) · `## Componentes` L210 (AppShell L229, DataTable virtual L259, Charts L303, Iconos L320, Fuentes L352) · `## Tokens` L364 · `## Build local` L428 · `## Storybook` L440 · `## Tests` L444 · `## Releases & CI` L450 · `## Forking / Rebrand` L480.
Mentions: L7 "El Alba / Patio Constructor"; L156 "Mirálas"; L161, L218 `Kpi`; L236 `alt="El Alba"`; L446 "249 tests" (real: 1324).
CHANGELOG: Keep a Changelog 1.1.0; entry headers `## [4.3.0] — 2026-09-11`; summaries Spanish, subsections English.
Last 40 commits: 27 Conventional, 13 not — all release squash-merges `X.Y.Z: … (#PR)`.

## I8. ESLint (134 warnings)

| n | rule |
|---|---|
| 34 | jsx-a11y/label-has-for (deprecated rule, overlaps label-has-associated-control) |
| 14 | jsx-a11y/click-events-have-key-events |
| 12 | jsx-a11y/label-has-associated-control |
| 11 | jsx-a11y/aria-role |
| 10 | jsx-a11y/no-static-element-interactions |
| 10 | @typescript-eslint/no-explicit-any |
| 9 | @typescript-eslint/no-unused-vars |
| 9 | jsx-a11y/control-has-associated-label |
| 7 | jsx-a11y/anchor-is-valid |
| 6 | jsx-a11y/no-noninteractive-element-interactions |
| 4 | no-useless-escape |
| 2 | react-hooks/exhaustive-deps · 2 no-noninteractive-tabindex · 2 interactive-supports-focus |
| 1 | no-autofocus · 1 prefer-const |

jsx-a11y by rule → files:
- label-has-for: InputsExtra.stories 6, Form.tsx 4, Pickers.stories 4, Form.stories 3, blocks/DataTablePage 2, blocks/ProductCatalog 2, blocks/ToolCatalog 2, AdvancedPickers 2, Filters.tsx 2, InputsExtra.tsx 2, blocks/ReturnInspection 1, Comments 1, Commerce 1, Filters.stories 1, Overlay.stories 1.
- label-has-associated-control: Pickers.stories 4, Form.stories 3, InputsExtra.stories 2, blocks/DataTablePage 1, ProductCatalog 1, ToolCatalog 1.
- click-events-have-key-events: Editing 2, Gallery 2, InputsExtra 2, Overlay 2, blocks/NotificationsPage 1, AdvancedPickers 1, AppShell 1, Display3 1, Popover 1, UserMenu 1.
- no-static-element-interactions: Overlay 2, AdvancedPickers, AppShell, ContextMenu, Editing, InputsExtra, NavigationMenu, Popover, UserMenu.
- aria-role: UserMenu.stories 9, AppShell.stories 1, Marketing.stories 1.
- control-has-associated-label: DataTable.tsx 5, Commerce 1, Display.stories 1, InputsExtra 1, Layout.stories 1.
- anchor-is-valid: blocks/AuthSplit 2, Foundations.stories, blocks/AdminDashboard, blocks/AuthScreen, Display.stories, Layout.stories.
- no-noninteractive-element-interactions: Gallery 2, blocks/NotificationsPage, AdvancedPickers, Carousel, Resizable.
- no-noninteractive-tabindex: Carousel, Resizable. interactive-supports-focus: Display2, InputsExtra. no-autofocus: InputOTP.stories.
Other: no-explicit-any 10 (shipped code; stories/tests already off), no-unused-vars 9, no-useless-escape 4 (utils/dateFormat.ts), exhaustive-deps 2, prefer-const 1.

## I9. Typecheck of tests

`tsconfig.json` `include: ["src"]`. With tests + .storybook included: 159 errors — 156 from missing `@types/node` (`node:fs`, `node:path`, `__dirname`), 3 real: `tests/DataTable.test.tsx:586` `WebkitLineClamp` → `webkitLineClamp`; `tests/DataTableExpansion.test.tsx:57` `colSpan` on `HTMLElement` (cast to `HTMLTableCellElement`); `tests/DateRangeReport.test.tsx:74` `.at()` needs `lib: ES2022`.

## I10. CI / scripts / Node

- `smoke.yml`: `on: pull_request` → only `npm run smoke:ci`. `publish.yml`: `on: release` → `npm install -g npm@^11`, lint, test, build, `npm publish --provenance`. Node 20 in both and in Dockerfile; local Node 22.19.0. No `engines`, `.nvmrc`, `typecheck` script, husky, commitlint, lint-staged, `.git-blame-ignore-revs`.
- `build` script: `tsup && node scripts/add-use-client.mjs && npm run build:css && mkdir -p dist/fonts && cp src/fonts/*.woff2 src/fonts/OFL.txt dist/fonts/ && mkdir -p dist/presets/elalba/logos && cp src/presets/elalba/logos/* dist/presets/elalba/logos/`.
- `tsup.config.ts`: entries by glob `'src/components/!(*.stories).tsx'` (flat, not recursive), esm+cjs, dts, external react/react-dom, splitting, treeshake, sourcemap. No `onSuccess`/`publicDir`.
- Prettier: 238 files unformatted (tests 88, src/components 78, blocks 28, smoke 10, tasks 8, styles 5, hooks 4, locale 3, docs 3, .storybook 3, utils 2, root 2, presets 1, Foundations 1, scripts 1).

## I11. Storybook map (74 files, 306 stories)

`component:` only in Button and Logo. `args`/`argTypes` in 13 files: AppShell, Button, Crud, DataTable, Display, Display3, Filters, Form, Inputs, Logo, Pickers, Register, Toggle. Blocks: 28 files, 1 `Default` each.

Current titles → files: Forms/Advanced Pickers (AdvancedPickers) · Layout/AppShell · Layout/AspectRatio · Actions/Button · Data Display/Carousel · Data Display/Charts · Data Display/Code · Layout/Collapsible · Patterns/Comments · Patterns/Commerce · Overlay/ContextMenu · Patterns/CRUD (Crud) · Data Display/DataTable · Data Display/Card & Badge (Display) · Data Display/Avatar & Stat (Display2) · Data Display/People, Timeline, Tree & Calendar (Display3) · Patterns/Editing · Patterns/Filters · Internal/Regression/Floating in overflow (FloatingPortal) · Forms/Controls (Form) · Patterns/Gallery · Overlay/HoverCard · Foundations/Icons · Forms/Input OTP · Forms/Inputs · Forms/Advanced Inputs (InputsExtra) · Layout/Stack, Grid & Tabs (Layout) · Foundations/Logo · Patterns/Marketing · Navigation/Menubar · Data/Metrics · Navigation/Navigation Menu · Feedback/Notifications · Overlay/Modal & Drawer (Overlay) · Patterns/Permissions · Forms/Pickers · Overlay/Popover · Layout/Separator (Primitives) · Foundations/Registro (Register) · Layout/Resizable · Layout/ScrollArea · Time/TimeAgo · Feedback/Toast · Actions/Toggle · Overlay/UserMenu · Foundations (src/Foundations.stories.tsx, 868 lines: Colors L119, Typography L177, WeightScale L254, BodyReview L322, Spacing L423, Radii L446, Shadows L466, Motion L526, Logos L639 (all El Alba, manifest L594-636), InvertedSurfaces L700, Localization L730, CapsOptOut L823, ExtendingVariants L847).

Exports with no story at all: `Label` (Form.tsx), `Table` (Layout.tsx), `Portal`, `Slot`, `Slottable` (Primitives.tsx), `ToolbarActions` (not in barrel). Hooks `usePopoverPosition`, `useDismiss`, `useVirtualRows`: no docs.

Spanish story export names to rename (file → old → new): see plan Fase 2 Task list; the full mapping was produced by the inventory agent and is reproduced in the Fase 2 plan.

`.storybook/preview.tsx` (164 lines): withTheme L21-37; preset import L12-17, `PRESET_STYLE_ID` L19, withPreset L39-60; nested-iframe bridge L62-126 (imports L3-4 only used by it); globalTypes L129-156 (preset items L137-138, theme items L150-151); decorators L157; parameters L158-162. `inline: false` only in `AppShell.stories.tsx:18`. `.storybook/fonts.css` = `src/styles/fonts.css` except `url()` paths and header comment.

Installed: storybook 8.6.18; `@storybook/blocks`, `addon-docs`, `addon-a11y`, `addon-essentials`, `test`, `theming`, `react-vite`. Not installed: `addon-interactions`, `addon-themes`, `test-runner`, `eslint-plugin-storybook`.

Deploy: Dockerfile (node:20-alpine → `build-storybook` → `serve@14` on `$PORT`, Railway). No workflow runs `build-storybook`. No Storybook URL in README or `homepage`.

## I12. 5.0.0 surface

`@layer elalba`: mechanism `src/styles/index.css:27-28` (`@import "./_root.css" layer(elalba)`, `_typography.css`), `:30` `@layer elalba;`, `:32`–`:5413` inline block wrapping components. NOTE: sections Metrics (L5486+) and "Field text size" (L5617) sit AFTER the closing `}` at L5413 — verify whether they are inside another layer or unlayered before splitting. Preset `src/presets/elalba/styles.css` is imported unlayered. Other mentions: `src/utils/types.ts:7`, `src/components/Button.tsx:22`, `src/Foundations.stories.tsx:845,858`, `tests/SurfaceTiers.test.tsx:75`, `tests/ContrastDark.test.tsx:45`, `README.md:99,111`, `DESIGN.md:22,33,596`; consumers only in comments (despachos `web/src/app/globals.css:655`, mocks `con-kit/src/app/globals.css:2`).

`src/brand.ts` (72 lines): `BRAND_DEFAULTS = {name:'El Alba', logoBasePath:'/assets/logos', currency:'CLP', locale:'es-CL'}` L38-43; `configureBrand` L55, `getBrand` L61, `resetBrand` L69. Runtime `getBrand()` users: `utils/dateFormat.ts:40,270`, `utils/format.ts:40,54`, `InputsExtra.tsx:217` (MoneyInput), `Logo.tsx:91`, `Commerce.tsx:74,323,372`. Tests: `tests/brand.test.tsx`, `dateFormat.test.tsx`, `format.test.tsx`.

Consumers: despachos (`web/package.json:16` `^4.3.0`; `web/src/app/layout.tsx:1,3` fonts + preset; no configureBrand, no LocaleProvider) · cobros (`^3.1.0`; same shape) · rentools (`^1.51.0`; same shape) · barritas (`^1.22.0`; `app/providers.tsx:8,10` `configureBrand({...elalbaDefaults, logoBasePath:'/logos'})`, `:14` LocaleProvider; `app/layout.tsx:3,5` fonts/tokens/preset) · mocks con-kit (`^1.24.0`; `providers.tsx:5,9,13`; CSS `@import`s in `globals.css:4,5`).

Module split map (file lines → exports at line): Display (280): Card 37, CardHeader 64, CardBody 70, CardFooter 80, Badge 120, Alert 156, Skeleton 181, Spinner 197, Chip 216, ChipGroup 235, ProductCard 259 · Display2 (275): Avatar 28, AvatarGroup 52, Menu 84, Stat 254 · Display3 (482): UserCell 18, StatusIndicator 40, Timeline 60, TimelineItem 111, Tree 171, Calendar 395 · Inputs (190): NumberInput 29, Pagination 99, EmptyState 141, Kpi 172 · InputsExtra (607): Slider 23, Progress 58, ProgressCircle 77, TagInput 118, MoneyInput 213, PhoneInput 348, TimePicker 462, RadioGroup 546, CheckboxGroup 581 · Layout (543): Tabs 34, TabList 48, Tab 98, TabPanel 116, Table 124, Tooltip 149, Divider 239, Stack 266, HStack 288, VStack 294, Container 307, Grid 348, Cluster 399, Spacer 416, KeyValue 436, KeyValueRow 451, ListGroup 461, ListGroupItem 471, Stepper 490, SectionHeader 530 · Overlay (128): Modal 30, Drawer 84 · Form (293): Input 12, Textarea 44, Select 62, Checkbox 86, Radio 125, Switch 144, Label 169, FormField 193, InputGroup 230, InputGroupAddon 236, PasswordInput 262 · Primitives (158): AspectRatio 10, Separator 32, ScrollArea 53, Slottable 124, Slot 132 · DataTable (1075): Column 219, DataTable 490, Accordion 865, AccordionItem 885, BreadcrumbItem 920, Breadcrumbs 925, TablePagination 960, TableToolbar 1005, ColumnToggle 1038 · Commerce (625): Rating 23, PriceDisplay 70, QuantitySelector 109, VariantSelector 176, WishlistButton 229, PromoCodeInput 255, FreeShippingProgress 318, CartDrawer 367, OrderSummary 456, AddressForm 510, CompareTable 583 · Metrics (454): DeltaBadge 42, StatCard 97, Meter 177, Sparkbar 231, ProportionBar 280, BulletChart 340, CalendarHeatmap 405 · Editing (381): ConfirmDialog 24, DescriptionList 83, DescriptionListItem 87, DiffViewer 115, TransferList 156, EditableCell 286 · Pickers (700): Combobox 78, DatePicker 349, FileUpload 486, YearPicker 622, MonthPicker 667 · AdvancedPickers (817): MultiCombobox 48, dateRangePresets 316, DateRangePicker 324, CommandPalette 674, useCommandPalette 804 · Notifications (123): NotificationCenter 30 · Marketing (162): Hero 22, Testimonial 55, CategoryNav 98 · Permissions (93): PermissionMatrix 20.

CSS section starts in `index.css` (a section ends where the next starts): Base 34 · Button 68 · Form controls 248 (FormField 324, Input icon 392) · Badge & chip 496 · Avatar 615 · Card 640 · Alert 800 · Tooltip 829 · Tabs 880 · Pagination 961 · Breadcrumbs 963 · Tables 976–1654 (scroll-edges 1014, scrollbar 1195, expansion 1261, ColumnToggle 1285, EditableCell 1297, footer 1321, mobile cards 1342, toolbar 1593) · Modal & drawer 1655 · Menu 1803 · Toast 1822 · Empty state 1883 · Skeleton 1911 · Progress/spinner 1922 · Stepper 1952 · Accordion 2012 · File upload 2022 · Divider 2049 · Top nav 2053 · Sidebar nav 2081 · Misc utility 2122 · v2 block 2173: NumberInput 2177 · Pagination 2219 · KPI 2252 · Combobox 2281 · DatePicker 2367 · CalendarView 2432 · TimePicker 2534 · Grid pickers 2578 · FileUpload 2620 · DataTable extras 2637 · Accordion 2672 · Breadcrumbs 2691 · v3 block 2700: Slider 2707 · Progress 2747 · ProgressCircle 2757 · TagInput 2766 · PhoneInput 2802 · Option group 2829 · Avatar 2847 · Menu 2890 · Stat 2938 · MultiCombobox 2957 · DateRangePicker 3038 · CommandPalette 3152 · AppShell 3216–3818 · Mobile overrides 3819 · PageHeader 3846 · SectionHeader 3872 · Charts 3886 · ERP block 3924: UserCell 3928 · StatusIndicator 3934 · Timeline 3949 (+4000) · Tree 4121 · Calendar 4151 · NotificationCenter 4216 · CodeBlock+JsonViewer 4289 · FilterPanel 4344 · BulkActionBar 4489 · SortDropdown 4537 · CommentThread 4542 · AttachmentList 4585 · ConfirmDialog 4611 · DescriptionList 4614 · DiffViewer 4624 · TransferList 4663 · PermissionMatrix 4687 · Gallery+Lightbox 4700 · Rating 4755 · PriceDisplay 4763 · QuantitySelector 4773 · VariantSelector 4802 · WishlistButton 4830 · PromoCodeInput 4843 · FreeShippingProgress 4851 · CartDrawer 4859 · OrderSummary 4879 · AddressForm 4889 · CompareTable 4901 · Hero 4921 · Testimonial 5022 · CategoryNav 5032 · shadcn-parity block 5063: Popover 5069 · HoverCard 5090 · ContextMenu 5107 · Toggle 5134 · InputOTP 5227 · Separator 5247 · Carousel 5252 · Resizable 5293 · Menubar 5308 · NavigationMenu 5344 · Grid 5391 · AspectRatio 5427 · Collapsible 5446 · ScrollArea 5477 · Metrics 5486: DeltaBadge 5488 · StatCard 5501 · Meter 5548 · Sparkbar 5568 · ProportionBar 5573 · BulletChart 5587 · CalendarHeatmap 5609 · Field text size 5617.

Duplicated root selectors (12): `.accordion` 2013/2673 · `.appshell__navlabel-section` 3266/3345 · `.avatar` 616/2848 · `.breadcrumbs` 964/2692 · `.breadcrumbs__sep` 973/2697 · `.card--accent-cat-6` 729/745 · `.combobox__trigger` 2288/2317 · `.data-table__sort` 1098/2670 · `.daterange__field-input` 3128/5631 · `.number-input__field` 2196/2204 · `.pagination__info` 2227/2232 · `.timeline__item` 3951/4013.

Tests reading CSS as text (42): only `index.css` (31): AppShell, AppShellTop, AdvancedPickers, Button, CalendarView, CardRhythm, Charts, ComboboxSearchable, Carousel, Collapsible, DataTable, DataTableFooter, DataTableRowClick, DatePickerDisabled, DateRangeDivider, Filters, Form, FormControlWidth, HiddenInputContainment, Inputs, Layout, Logo, Metrics, Switch, TableSurface, Toast, Toggle, ToolbarOverflow, TonalTiers, UserMenu. `_root.css`+`index.css`: CardElevation, ControlRegister, DrawerMotion, ProductRegister. `_root`+preset: ChartTokens, SurfaceTiers. `_root`+preset+`index`: Contrast, ContrastDark, SkeletonTiers. `_typography`+`index`: QuietDefaults. all four + `fonts.css`: GoldStandard.

Deprecated / removal candidates: `Kpi` + `KpiProps` (`Inputs.tsx:154-190`; tests `Inputs.test.tsx:3,98-100`, `Metrics.test.tsx:107`; `README.md:161,218`; `DESIGN.md:454`; CSS `index.css:2252`; consumers 0) · `Divider` alias of `Separator` (`Layout.tsx:233-239`; CSS 2049) · `Stat.trend` string (`Display2.tsx:245`) · `Tree` no-op prop (`Display3.tsx:379`) · `FilterBar` 3.8.0 props (`Filters.tsx:232,236,238`) · `DateRangePicker` 3.9.0 no-op prop (`AdvancedPickers.tsx:249`) · `Tool` icon alias of `Wrench` (`Icons.tsx:112`) · `elalbaDefaults` + export `./presets/elalba-defaults` (used by barritas and mocks — KEEP, it becomes the way consumers configure the brand) · legacy `.table-toolbar + .table-wrap` seam (`DESIGN.md:474`; CSS 1605).

Consumer import breadth: despachos 50 files / 108 names · cobros 21 / 63 · barritas 5 / 30 · rentools 3 / 2 · mocks 18 / 46.
