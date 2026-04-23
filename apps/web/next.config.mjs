import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { config as loadEnv } from "dotenv"

const configDir = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(configDir, "../../.env") })

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
