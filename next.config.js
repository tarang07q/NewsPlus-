/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure image domains to allow external images
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'images.pexels.com',
      'cdn.videocardz.com',
      'ichef.bbci.co.uk',
      'media.cnn.com',
      'static.foxnews.com',
      'media.npr.org',
      'cdn.cnn.com',
      'nypost.com',
      'static01.nyt.com',
      'i.kinja-img.com',
      's.yimg.com',
      'assets.bwbx.io',
      'www.reuters.com',
      'www.washingtonpost.com',
      'assets3.thrillist.com',
      'cdn.vox-cdn.com',
      'media.wired.com',
      'techcrunch.com',
      'venturebeat.com',
      'zdnet.com',
      'cnet.com',
      'engadget.com'
    ],
    unoptimized: true,
  },
  // Optimize performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEWS_API_KEY: 'a9f7a5af0e7b4e37843a9c9a70d2b5e3',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'your-super-secret-key-for-next-auth',
  },
}

module.exports = nextConfig
