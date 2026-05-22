import type { Meta, StoryObj } from '@storybook/react';
import { RouteMap } from './RouteMap';

/**
 * Copy-paste recipe (not shipped). Route map view — ordered-stops list on
 * the left + map area on the right with numbered markers, polyline route,
 * pulsing vehicle indicator. The map is a **visual mock** (hand-drawn
 * SVG); in your app, replace `<MapMock>` with Mapbox/Leaflet/Google. The
 * list panel stays as-is. Source: `src/blocks/RouteMap.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Despachos/Route map',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RouteMap /> };
