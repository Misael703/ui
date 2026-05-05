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
  'filters.clear': string;
  'filters.bulkActions': string;
  'filters.deselectAll': string;
  'filters.sortBy': string;
  /** Template: "{n} seleccionado" (used when n === 1) */
  'filters.selectedOne': string;
  /** Template: "{n} seleccionados" (used when n !== 1) */
  'filters.selectedMany': string;

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
  'permissions.action': string;
  /** Template: "{action} para {role}" */
  'permissions.cellLabel': string;

  // Comments
  'comments.placeholder': string;
  'comments.send': string;
  'comments.internalTag': string;
  'comments.internalOnly': string;
  'attachments.empty': string;
  /** Template: "Eliminar {name}" */
  'attachments.remove': string;
  /** Template: "Descargar {name}" */
  'attachments.download': string;

  // Gallery
  'gallery.thumbnails': string;
  'gallery.viewer': string;
  'gallery.prev': string;
  'gallery.next': string;
  'gallery.close': string;
  /** Template: "Imagen {n}" */
  'gallery.imageNumber': string;

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
  'picker.commandPalette': string;
  /**
   * Single-letter weekday initials used by compact calendar grids (DatePicker,
   * DateRangePicker). Mon-first to match the kit's calendars.
   */
  'picker.weekdaysShort': readonly [string, string, string, string, string, string, string];
  /** Template: "Quitar {label}" */
  'combobox.remove': string;
  'fileUpload.title': string;

  // Inputs
  'pagination.label': string;
  'pagination.prev': string;
  'pagination.next': string;
  /** Template: "{from}–{to} de {total}" */
  'pagination.range': string;
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
  'commerce.cartEmpty': string;
  'commerce.subtotal': string;
  'commerce.checkout': string;
  'commerce.promoPlaceholder': string;
  'commerce.promoInvalid': string;
  'commerce.shippingAchieved': string;
  /** Template before {amount} placeholder: "Te falta " (suffix " para envío gratis"). Split into two so consumers can swap word order. */
  'commerce.shippingPrefix': string;
  'commerce.shippingSuffix': string;

  // Tags input
  /** Template: "Quitar {tag}" */
  'tagsInput.remove': string;
  'tagsInput.placeholder': string;
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
