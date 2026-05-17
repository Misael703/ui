// Fails (non-zero) if CJS resolution of the published artifact breaks
// (exercises the exports `require` condition → dist/index.js).
const k = require('@misael703/ui');
for (const n of ['Button', 'useToast', 'configureBrand']) {
  if (k[n] === undefined) {
    console.error(`CJS resolution: missing export ${n}`);
    process.exit(1);
  }
}
console.log('CJS resolution OK');
