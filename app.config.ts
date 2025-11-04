import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default {
  routers: [
    {
      name: 'public',
      type: 'static',
      dir: './public',
    },
    {
      name: 'ssr',
      type: 'http',
      handler: './src/entry-server.tsx',
      target: 'server',
      plugins: () => [
        TanStackRouterVite(),
        viteTsConfigPaths({
          projects: ['./tsconfig.json'],
        }),
        react(),
      ],
    },
    {
      name: 'client',
      type: 'client',
      handler: './src/entry-client.tsx',
      target: 'browser',
      plugins: () => [
        TanStackRouterVite(),
        viteTsConfigPaths({
          projects: ['./tsconfig.json'],
        }),
        react(),
      ],
      base: '/_build',
    },
  ],
}
