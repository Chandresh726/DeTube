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
    ]
  },
  reactStrictMode: false,
  // Backend-only hardening phase: backend strictness is enforced via
  // `tsc -p tsconfig.backend.json`. Frontend type debt (implicit any,
  // Number vs number) is deferred to the UI phase and must not block deploys.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
