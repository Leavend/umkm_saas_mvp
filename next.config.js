/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // CORS configuration untuk better-auth + Cross-Origin-Opener-Policy untuk popup auth
  async headers() {
    return [
      {
        // Terapkan Cross-Origin-Opener-Policy ke semua rute untuk mengizinkan popup communication
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none", // Allow popup communication (less restrictive for development)
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", // Allow embedding (required for popup flow)
          },
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default config;
