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

## Index

| Block | Composes |
|---|---|
| AdminDashboard | AppShell, StatCard, DataTable |
| AuditLogPage | PageHeader, FilterBar, DataTable |
| AuthScreen / AuthSplit | Card, FormField, Button |
| CartDrawer / CheckoutSummary / ProductCatalog / InvoiceDocument | commerce components |
| DataTablePage / DetailPage | PageHeader, DataTable, DescriptionList |
| EmptyStatePage / ErrorPage / NotFound | EmptyState, Button |
| NotificationsPage / OnboardingChecklist / WizardPage | NotificationCenter, Stepper, Card |
| SettingsPage | Tabs, FormField, Switch |

Blocks are generic by rule: sample company "Northwind Builders", no real data.
Screens of a specific app do not belong here; keep them in that app.
