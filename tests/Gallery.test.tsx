import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageGallery, Lightbox } from '../src/components/Gallery';

const images = [
  { src: '/a.jpg', alt: 'A' },
  { src: '/b.jpg', alt: 'B' },
  { src: '/c.jpg', alt: 'C' },
];

describe('ImageGallery', () => {
  it('renders main image and thumbnails', () => {
    const { container } = render(<ImageGallery images={images} enableLightbox={false} />);
    expect(container.querySelectorAll('.gallery__thumb')).toHaveLength(3);
    // Imagen "A" aparece en el main + en el thumbnail
    expect(screen.getAllByAltText('A')).toHaveLength(2);
  });

  it('changes main image on thumbnail click', () => {
    const { container } = render(<ImageGallery images={images} enableLightbox={false} />);
    const thumbs = container.querySelectorAll('.gallery__thumb');
    fireEvent.click(thumbs[1]);
    expect(container.querySelector('.gallery__image')?.getAttribute('src')).toBe('/b.jpg');
  });

  it('navigates with arrow buttons', () => {
    const { container } = render(<ImageGallery images={images} enableLightbox={false} />);
    fireEvent.click(screen.getByLabelText('Imagen siguiente'));
    expect(container.querySelector('.gallery__image')?.getAttribute('src')).toBe('/b.jpg');
    fireEvent.click(screen.getByLabelText('Imagen anterior'));
    expect(container.querySelector('.gallery__image')?.getAttribute('src')).toBe('/a.jpg');
  });
});

describe('Lightbox', () => {
  it('does not render when closed', () => {
    render(<Lightbox open={false} onClose={() => {}} images={images} index={0} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders image and counter', () => {
    render(<Lightbox open onClose={() => {}} images={images} index={1} onChange={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Lightbox open onClose={onClose} images={images} index={0} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with arrow keys', () => {
    const onChange = vi.fn();
    render(<Lightbox open onClose={() => {}} images={images} index={0} onChange={onChange} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
