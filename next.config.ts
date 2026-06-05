import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
