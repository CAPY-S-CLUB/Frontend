/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de produção otimizadas
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações de build
  output: 'standalone',
  generateEtags: false,
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  
  // Configurações de imagem
  images: {
    domains: ['api.dicebear.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'
              : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },
  
  // Configurações de webpack para otimização
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Otimizações para produção
    if (!dev) {
      // Configurações de otimização
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            stellar: {
              test: /[\\/]node_modules[\\/](@stellar|stellar-sdk|@creit\.tech)[\\/]/,
              name: 'stellar',
              chunks: 'all',
              priority: 20
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      }
    }
    
    // Configurações para bibliotecas blockchain
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser')
    }
    
    // Plugins adicionais
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    )
    
    // Otimizações de bundle
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src')
      }
    }
    
    return config
  },
  
  // Configurações experimentais
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@stellar/stellar-sdk'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // Configurações de ambiente
  env: {
    BUILD_TIME: new Date().toISOString()
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      }
    ]
  },
  
  // Configurações de reescrita
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health-check'
      }
    ]
  },
  
  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false
  },
  
  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  
  // Configurações de análise de bundle
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, options) => {
      if (!options.isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html'
          })
        )
      }
      return config
    }
  })
}

module.exports = nextConfig


