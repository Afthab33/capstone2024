/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/**',
        },
      ],
      domains: [
        'encrypted-tbn0.gstatic.com',
        'firebasestorage.googleapis.com',
        'lh3.googleusercontent.com',
        'www.bing.com',
      ],
    },
  }

export default nextConfig;
