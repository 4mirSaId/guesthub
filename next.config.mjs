import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const projectNodeModules = join(projectRoot, 'node_modules');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  webpack: (config) => {
    config.context = projectRoot;
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      projectNodeModules,
      ...(config.resolve.modules || []),
    ];
    return config;
  },
};

export default nextConfig;
