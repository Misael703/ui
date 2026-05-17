import type { ReactNode, CSSProperties } from 'react';
import localFont from 'next/font/local';
// Consume the published artifact's CSS export (not src). Resolving this under
// Next is itself part of the test (the `./styles.css` exports entry).
import '@misael703/ui/styles.css';

// next/font/local pointing at the kit's packaged variable woff2 (the
// `@misael703/ui/fonts/*` exports entry). Exercises the Next font pipeline +
// SSR; a bad export path or missing file fails the build here.
const display = localFont({
  src: '../node_modules/@misael703/ui/dist/fonts/Outfit-VariableFont_wght.woff2',
  weight: '100 900',
  display: 'swap',
});
const body = localFont({
  src: '../node_modules/@misael703/ui/dist/fonts/DMSans-VariableFont_wght.woff2',
  weight: '100 1000',
  display: 'swap',
});

export const metadata = { title: 'kit smoke' };

export default function RootLayout({ children }: { children: ReactNode }) {
  // Override the kit's font tokens with the next/font families so a real
  // SSR→hydrate font path is exercised (mismatches surface here).
  const fontVars = {
    '--font-display': display.style.fontFamily,
    '--font-body': body.style.fontFamily,
  } as CSSProperties;
  return (
    <html lang="es">
      <body style={fontVars}>{children}</body>
    </html>
  );
}
