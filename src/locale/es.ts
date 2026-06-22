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
  'table.rowAction': 'Ver {label}',
  'table.expandRow': 'Expandir detalle de {label}',
  'table.expandColumn': 'Detalle',
  'table.columns': 'Columnas',
  'editable.commitError': 'No se pudo guardar. Intenta de nuevo o presiona Esc para descartar.',

  // AppShell
  'appshell.mainNav': 'Navegación principal',
  'appshell.breadcrumb': 'Breadcrumb',
  'appshell.toggleMenu': 'Abrir menú',

  // TimeAgo
  'timeAgo.now': 'ahora',
  'timeAgo.soon': 'pronto',
  'timeAgo.minAgo': 'hace {n} min',
  'timeAgo.minIn': 'en {n} min',
  'timeAgo.today': 'hoy',
  'timeAgo.yesterday': 'ayer',
  'timeAgo.tomorrow': 'mañana',
  'timeAgo.weekdaysShort': ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  'timeAgo.monthsShort': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],

  // Notifications
  'notifications.button': 'Notificaciones',
  'notifications.unreadSuffix': ' ({n} sin leer)',
  'notifications.empty': 'No tienes notificaciones',
  'notifications.panel': 'Notificaciones',
  'notifications.title': 'Notificaciones',
  'notifications.markAllRead': 'Marcar todas como leídas',
  'notifications.clear': 'Limpiar',

  // Filters
  'filters.panel': 'Filtros',
  'filters.clear': 'Limpiar',
  'filters.bulkActions': 'Acciones en lote',
  'filters.deselectAll': 'Deseleccionar todo',
  'filters.sortBy': 'Ordenar por',
  'filters.selectedOne': '{n} seleccionado',
  'filters.selectedMany': '{n} seleccionados',

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
  'permissions.action': 'Acción',
  'permissions.cellLabel': '{action} para {role}',

  // Comments
  'comments.placeholder': 'Escribe un comentario…',
  'comments.send': 'Enviar',
  'comments.internalTag': 'Nota interna',
  'comments.internalOnly': 'Solo nota interna',
  'attachments.empty': 'Sin archivos adjuntos',
  'attachments.remove': 'Eliminar {name}',
  'attachments.download': 'Descargar {name}',

  // Gallery
  'gallery.thumbnails': 'Miniaturas',
  'gallery.viewer': 'Visor de imagen',
  'gallery.prev': 'Imagen anterior',
  'gallery.next': 'Imagen siguiente',
  'gallery.close': 'Cerrar',
  'gallery.imageNumber': 'Imagen {n}',

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
  'daterange.from': 'Desde',
  'daterange.to': 'Hasta',
  'daterange.jumpMonth': 'Saltar a mes y año',
  'picker.searchCommands': 'Buscar comandos…',
  'picker.commandPalette': 'Paleta de comandos',
  'picker.prevYear': 'Año anterior',
  'picker.nextYear': 'Año siguiente',
  'picker.prevDecade': 'Década anterior',
  'picker.nextDecade': 'Década siguiente',
  'picker.selectYear': 'Selecciona el año',
  'picker.selectMonth': 'Selecciona el mes',
  'picker.selectTime': 'Selecciona la hora',
  'picker.hours': 'Horas',
  'picker.minutes': 'Minutos',
  'picker.seconds': 'Segundos',
  'picker.weekdaysShort': ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  'combobox.remove': 'Quitar {label}',
  'fileUpload.title': 'Arrastra archivos o haz clic',

  // Inputs
  'pagination.label': 'Paginación',
  'pagination.prev': 'Página anterior',
  'pagination.next': 'Página siguiente',
  'pagination.range': '{from}–{to} de {total}',
  'pagination.rowsPerPage': 'Filas por página',
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
  'commerce.cartEmpty': 'Tu carro está vacío',
  'commerce.subtotal': 'Subtotal',
  'commerce.checkout': 'Ir a pagar',
  'commerce.promoPlaceholder': 'Código promocional',
  'commerce.promoInvalid': 'Código inválido',
  'commerce.shippingAchieved': '¡Tienes envío gratis!',
  'commerce.shippingPrefix': 'Te falta ',
  'commerce.shippingSuffix': ' para envío gratis',

  // Tags input
  'tagsInput.remove': 'Quitar {tag}',
  'tagsInput.placeholder': 'Escribe y Enter…',
};
