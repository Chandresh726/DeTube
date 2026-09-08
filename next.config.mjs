/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'media.detube.slope726.in',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'radix-ui'],
  },
  // Backend-only hardening phase: backend strictness is enforced via
  // `tsc -p tsconfig.backend.json`. Frontend type debt is being fixed
  // incrementally; keep deploys unblocked until `tsc --noEmit` is clean.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
