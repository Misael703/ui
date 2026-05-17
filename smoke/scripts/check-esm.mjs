// Fails (non-zero) if ESM resolution of the published artifact breaks.
import { Button, useToast, configureBrand } from '@misael703/ui';
for (const [n, v] of Object.entries({ Button, useToast, configureBrand })) {
  if (v === undefined) {
    console.error(`ESM resolution: missing export ${n}`);
    process.exit(1);
  }
}
console.log('ESM resolution OK');
