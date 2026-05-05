/**
 * Flat dictionary of UI strings used by the kit. Keys are dot-separated
 * namespaces (component or area). Values may include `{var}` placeholders
 * that get substituted via `format()`.
 */
export interface UiKitMessages {
  // Generic actions
  'common.close': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.apply': string;
  'common.clear': string;
  'common.edit': string;
  'common.empty': string;
  'common.loading': string;
  'common.search': string;
  'common.noResults': string;

  // Overlay
  'modal.close': string;
  'drawer.close': string;
  'toast.close': string;

  // DataTable
  'table.empty': string;
  'table.selectAll': string;
  /** Template: "Seleccionar {label}" */
  'table.selectRow': string;

  // AppShell
  'appshell.mainNav': string;
  'appshell.expandMenu': string;
  'appshell.collapseMenu': string;
  'appshell.expand': string;
  'appshell.collapse': string;
  'appshell.openMenu': string;
  'appshell.breadcrumb': string;

  // Notifications
  'notifications.button': string;
  /** Template: " ({n} sin leer)" */
  'notifications.unreadSuffix': string;
  'notifications.empty': string;
  'notifications.panel': string;
  'notifications.title': string;
  'notifications.markAllRead': string;
  'notifications.clear': string;

  // Filters
  'filters.panel': string;
  'filters.bulkActions': string;
  'filters.deselectAll': string;
  'filters.sortBy': string;

  // Editing
  'transfer.available': string;
  'transfer.assigned': string;
  'transfer.assignSelected': string;
  'transfer.removeSelected': string;
  'transfer.empty': string;
  'descList.edit': string;
  'diff.label': string;
  'diff.field': string;
  'diff.before': string;
  'diff.after': string;

  // Permissions
  'permissions.markAll': string;
  'permissions.unmarkAll': string;

  // Comments
  'attachments.empty': string;
  /** Template: "Eliminar {name}" */
  'attachments.remove': string;

  // Gallery
  'gallery.thumbnails': string;
  'gallery.viewer': string;
  'gallery.prev': string;
  'gallery.next': string;
  'gallery.close': string;

  // Display
  'alert.close': string;
  'spinner.loading': string;
  'chip.remove': string;

  // Display3 — Calendar
  'calendar.prevMonth': string;
  'calendar.nextMonth': string;
  'calendar.expand': string;
  'calendar.collapse': string;
  /** Mon, Tue, Wed, Thu, Fri, Sat, Sun (in array order, kit assumes Mon-first) */
  'calendar.weekdays': readonly [string, string, string, string, string, string, string];
  'calendar.months': readonly [
    string, string, string, string, string, string,
    string, string, string, string, string, string,
  ];

  // Pickers
  'picker.openCalendar': string;
  'picker.clearSelection': string;
  'picker.selectRange': string;
  'picker.searchCommands': string;
  /** Template: "Quitar {label}" */
  'combobox.remove': string;

  // Inputs
  'pagination.label': string;
  'pagination.prev': string;
  'pagination.next': string;
  'numberInput.decrement': string;
  'numberInput.increment': string;

  // Commerce
  'commerce.quantity': string;
  'commerce.decreaseQty': string;
  'commerce.increaseQty': string;
  'commerce.removeFromCart': string;
  /** Template: "Quitar {name}" */
  'commerce.removeItem': string;
  'commerce.addFavorite': string;
  'commerce.removeFavorite': string;
  'commerce.applyCoupon': string;
  'commerce.cartTitle': string;

  // Tags input
  /** Template: "Quitar {tag}" */
  'tagsInput.remove': string;
}

/**
 * Replace `{var}` placeholders in a template string with values from `vars`.
 * Missing vars are left as-is, so a typo surfaces during dev instead of being
 * silently dropped.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}
