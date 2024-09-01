/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { fileURLToPath } from "url";
import createJiti from "jiti";
import createNextIntlPlugin from "next-intl/plugin";

const jiti = createJiti(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin();

// Import env here to validate during build. Using jiti we can import .ts files :)
jiti("./src/env");

/** @type {import("next").NextConfig} */
const config = {};

export default withNextIntl(config);
