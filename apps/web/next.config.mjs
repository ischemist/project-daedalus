import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { config as loadEnv } from "dotenv"

const configDir = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(configDir, "../../.env") })

const allowedDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  transpilePackages: ["@ischemist/routes", "@ischemist/route-viewer"],
}

export default nextConfig
