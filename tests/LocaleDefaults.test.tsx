import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider, Carousel, NavigationMenu, Menubar, Breadcrumbs, CategoryNav } from '../src/index';

describe('component aria defaults come from the locale dictionary', () => {
  it('Carousel controls and region', () => {
    render(
      <LocaleProvider messages={{ 'carousel.label': 'Slides', 'carousel.prev': 'Back', 'carousel.next': 'Forward' }}>
        <Carousel>
          <div>A</div>
          <div>B</div>
        </Carousel>
      </LocaleProvider>,
    );
    expect(screen.getByRole('region', { name: 'Slides' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
  });
  it('NavigationMenu, Menubar, Breadcrumbs, CategoryNav landmarks', () => {
    render(
      <LocaleProvider messages={{ 'navigationMenu.label': 'Main', 'menubar.label': 'Bar', 'breadcrumbs.label': 'Trail', 'categoryNav.label': 'Cats' }}>
        <NavigationMenu items={[]} />
        <Menubar menus={[]} />
        <Breadcrumbs items={[{ label: 'Home' }]} />
        <CategoryNav categories={[]} />
      </LocaleProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('menubar', { name: 'Bar' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trail' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Cats' })).toBeInTheDocument();
  });
});
