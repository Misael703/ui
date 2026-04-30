import '@testing-library/jest-dom/vitest';

// jsdom no implementa scrollIntoView; las stories y componentes que lo usan
// (CommandPalette, etc.) lo invocan vía effects al cambiar el item activo.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}
