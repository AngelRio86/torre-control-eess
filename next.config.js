/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aumentar timeout para generación de páginas estáticas
  staticPageGenerationTimeout: 300,
}

module.exports = nextConfig
