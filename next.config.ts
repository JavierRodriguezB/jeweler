import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Permite el HMR (hot reload) cuando se accede por un túnel de Cloudflare.
  // Las quick tunnels usan un subdominio aleatorio de trycloudflare.com.
  allowedDevOrigins: ["*.trycloudflare.com"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Permite servir imágenes desde Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
