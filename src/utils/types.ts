/**
 * Opens a closed string union for consumer extension while keeping
 * autocomplete for the known values.
 *
 * The kit emits BEM-style classes from these props (e.g. `variant="x"` →
 * `btn--x`). A consumer can therefore add a custom variant by defining
 * `.btn--x { ... }` in their own CSS *outside* `@layer elalba` (so it wins
 * by the layer order the kit already sets up) and passing `variant="x"` with
 * no type error and no fork. See DESIGN.md "Extending variants".
 *
 * `string & {}` is the canonical trick: it widens to `string` for
 * assignability but preserves the literal members in editor completion.
 */
export type Extensible<T extends string> = T | (string & {});
