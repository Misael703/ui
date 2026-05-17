// Server route that renders the client Gallery: SSR renders every kit
// component, then the browser hydrates it — exactly where hydration
// mismatches (locale/ICU, Date, SSR) surface.
import { Gallery } from '../../gallery/registry';

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  return <Gallery />;
}
