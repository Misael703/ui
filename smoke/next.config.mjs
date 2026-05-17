/** @type {import('next').NextConfig} */
// Minimal on purpose. reactStrictMode surfaces double-invoke / effect bugs;
// SSR is the App Router default (not disabled). No transpilePackages: the kit
// must work as a published artifact, not as transpiled source.
const nextConfig = {
  reactStrictMode: true,
  // smoke/ is its own app nested in the kit repo; pin the workspace root so
  // module resolution uses smoke/node_modules (not the kit's lockfile dir).
  turbopack: { root: import.meta.dirname },
};
export default nextConfig;
