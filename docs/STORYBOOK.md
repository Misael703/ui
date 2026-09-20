# Storybook conventions

Storybook is the kit's documentation. Every export of `src/index.ts` has a story file.

## One file per component
- `src/components/<Name>.stories.tsx`, title `Components/<Name>` (English, PascalCase name as in the export).
- Transversal groups: `Foundations/*` (tokens), `Patterns/*` (compositions such as the list page), `Blocks/*` (copy-paste pages), `Internal/*` (regressions and experiments), `Docs/*` (MDX guides).
- Sub-components (`CardHeader`, `TabList`, `AccordionItem`…) are documented in the parent's file via `subcomponents`.

## Meta
- `component:` is mandatory; `tags: ['autodocs']` is mandatory (only `Internal/*`, `Blocks/*` and `Components/AppShell` opt out).
- `args` for the `Default` story; `argTypes` with `control: 'select'` / `'inline-radio'` for every enum prop.
- `satisfies Meta<typeof X>`; `type Story = StoryObj<typeof meta>`.
- Generic components (`DataTable<T>`, `Combobox<T>`, `RadioGroup<T>`…): TypeScript collapses `ComponentProps` on generic function components, so use `const meta: Meta = { … }` with `type Story = StoryObj<XxxProps<string>>` and a per-story `render`; non-generic components keep `satisfies Meta<typeof X>`.
- `Default` should be `{}` driven by meta `args` so Controls work; a custom `render` that ignores `args` is only for compositions.

## Story names (English)
`Default`, `Sizes`, `Variants`, `Disabled`, `Loading`, `Invalid`, `Empty`, `Controlled`, `WithIcons`, `Playground`. A `Playground` is the one composition story with args; never one story per consumer case.

## Fixtures
Company "Northwind Builders", branch "Sucursal Centro", products "Taladro" / "Sierra circular", orders "Pedido #1042", persona "Satoru Gojo" (`satoru@example.com`). Money through `formatCurrency(n)`. Never a real company, RUT, phone, address, tax rate, or copy lifted from an app.

## Gotchas
- Objects/arrays holding React elements (`icon: <X />`) are hoisted to module scope (the jsx decorator recurses into `_owner` otherwise).
- A story file never imports another story file; shared compositions live in `src/components/__fixtures__/`.
- `play` functions use `@storybook/test` (`within`, `userEvent`, `expect`).
