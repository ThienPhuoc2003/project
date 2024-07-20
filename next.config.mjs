/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            hostname: "aware-egret-880.convex.cloud",
          },
        ],
      },
    };
    
    export default nextConfig;
