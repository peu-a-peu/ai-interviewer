import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint checks during the build process
    ignoreDuringBuilds: true,
  },
  reactStrictMode:false
};
 
export default withNextIntl(nextConfig);