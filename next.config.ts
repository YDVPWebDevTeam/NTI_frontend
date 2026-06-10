import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

/**
 * Allow the Next.js image optimizer to fetch from the configured CMS host (and
 * the local dev CMS). Individual <Image> tags currently pass `unoptimized`, but
 * registering the patterns here lets that be flipped on later without a config
 * change. Invalid/empty env values are skipped so the build never throws.
 */
function buildCmsRemotePatterns(): RemotePattern[] {
  const candidates = [process.env.NEXT_PUBLIC_CMS_URL, 'http://localhost:3002'];
  const patterns: RemotePattern[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      const url = new URL(candidate);
      const key = `${url.protocol}//${url.host}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      patterns.push({
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: '/**',
      });
    } catch {
      // Ignore malformed URLs.
    }
  }

  return patterns;
}

const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? 'http://localhost:3001').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
  },
  images: {
    remotePatterns: buildCmsRemotePatterns(),
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
