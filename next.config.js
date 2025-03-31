import { fileURLToPath } from "url";
import createJiti from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    minimumCacheTTL: 120,
  },
};

export default config;
