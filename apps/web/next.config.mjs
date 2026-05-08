import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile our internal workspace packages so Next compiles their TS source.
  transpilePackages: ['@e60/ui', '@e60/domain', '@e60/api-client'],
  // Typed routes (stable in Next 15)
  typedRoutes: true,
  // Pin the workspace root so Next ignores any stray lockfile higher up the tree.
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
