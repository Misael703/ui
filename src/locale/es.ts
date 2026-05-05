import type { UiKitMessages } from './messages';

export const esMessages: UiKitMessages = {
  // Generic actions
  'common.close': 'Cerrar',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.apply': 'Aplicar',
  'common.clear': 'Limpiar',
  'common.edit': 'Editar',
  'common.empty': 'Vacío',
  'common.loading': 'Cargando',
  'common.search': 'Buscar…',
  'common.noResults': 'Sin resultados',

  // Overlay
  'modal.close': 'Cerrar',
  'drawer.close': 'Cerrar',
  'toast.close': 'Cerrar',

  // DataTable
  'table.empty': 'Sin datos',
  'table.selectAll': 'Seleccionar todo',
  'table.selectRow': 'Seleccionar {label}',

  // AppShell
  'appshell.mainNav': 'Navegación principal',
  'appshell.expandMenu': 'Expandir menú',
  'appshell.collapseMenu': 'Colapsar menú',
  'appshell.expand': 'Expandir',
  'appshell.collapse': 'Colapsar',
  'appshell.openMenu': 'Abrir menú',
  'appshell.breadcrumb': 'Breadcrumb',

  // Notifications
  'notifications.button': 'Notificaciones',
  'notifications.unreadSuffix': ' ({n} sin leer)',
  'notifications.empty': 'No tienes notificaciones',
  'notifications.panel': 'Notificaciones',

  // Filters
  'filters.panel': 'Filtros',
  'filters.bulkActions': 'Acciones en lote',
  'filters.deselectAll': 'Deseleccionar todo',
  'filters.sortBy': 'Ordenar por',

  // Editing
  'transfer.available': 'Disponibles',
  'transfer.assigned': 'Asignados',
  'transfer.assignSelected': 'Asignar seleccionados',
  'transfer.removeSelected': 'Quitar seleccionados',
  'transfer.empty': 'Vacío',
  'descList.edit': 'Editar',
  'diff.label': 'Cambios',
  'diff.field': 'Campo',
  'diff.before': 'Antes',
  'diff.after': 'Después',

  // Permissions
  'permissions.markAll': 'Marcar todos',
  'permissions.unmarkAll': 'Quitar todos',

  // Comments
  'attachments.empty': 'Sin archivos adjuntos',
  'attachments.remove': 'Eliminar {name}',

  // Gallery
  'gallery.thumbnails': 'Miniaturas',
  'gallery.viewer': 'Visor de imagen',
  'gallery.prev': 'Imagen anterior',
  'gallery.next': 'Imagen siguiente',
  'gallery.close': 'Cerrar',

  // Display
  'alert.close': 'Cerrar alerta',
  'spinner.loading': 'Cargando',
  'chip.remove': 'Quitar',

  // Display3 — Calendar
  'calendar.prevMonth': 'Mes anterior',
  'calendar.nextMonth': 'Mes siguiente',
  'calendar.expand': 'Expandir',
  'calendar.collapse': 'Colapsar',
  'calendar.weekdays': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  'calendar.months': [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],

  // Pickers
  'picker.openCalendar': 'Abrir calendario',
  'picker.clearSelection': 'Limpiar selección',
  'picker.selectRange': 'Seleccionar rango',
  'picker.searchCommands': 'Buscar comandos…',
  'combobox.remove': 'Quitar {label}',

  // Inputs
  'pagination.label': 'Paginación',
  'pagination.prev': 'Página anterior',
  'pagination.next': 'Página siguiente',
  'numberInput.decrement': 'Disminuir',
  'numberInput.increment': 'Aumentar',

  // Commerce
  'commerce.quantity': 'Cantidad',
  'commerce.decreaseQty': 'Disminuir cantidad',
  'commerce.increaseQty': 'Aumentar cantidad',
  'commerce.removeFromCart': 'Quitar del carro',
  'commerce.removeItem': 'Quitar {name}',
  'commerce.addFavorite': 'Agregar a favoritos',
  'commerce.removeFavorite': 'Quitar de favoritos',
  'commerce.applyCoupon': 'Aplicar',
  'commerce.cartTitle': 'Tu carro',

  // Tags input
  'tagsInput.remove': 'Quitar {tag}',
};
