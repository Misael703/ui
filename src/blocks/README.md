# Blocks

Copy-paste recipes, not shipped in the package (excluded from `dist` by the
tsup entry and `files: ["dist"]`). They compose existing kit components into
realistic page sections, the way shadcn/ui blocks work.

**To use one:** copy the `.tsx` into your app and replace the import line

```ts
import { ... } from '../index';        // in this repo
```

with

```ts
import { ... } from '@misael703/ui';   // in your app
```

then adapt the data, columns and handlers to your domain. They are starting
points, not configurable components: own the code once you copy it.

Browse them rendered under **Blocks/** in Storybook.
