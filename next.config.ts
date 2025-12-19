import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

// Validate env vars at build time
const jiti = createJiti(fileURLToPath(import.meta.url))
jiti('./src/env')

const nextConfig: NextConfig = {}

export default nextConfig
