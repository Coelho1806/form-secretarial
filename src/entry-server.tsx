/// <reference types="vinxi/types/server" />
import { renderAsset } from '@tanstack/react-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createMemoryHistory } from '@tanstack/react-router'
import { StartServer } from '@tanstack/react-start/server'
import { getRouter } from './router'
import type { AnyRouter } from '@tanstack/react-router'

export async function render(opts: {
  request: Request
  router?: AnyRouter
}) {
  const router = opts.router || getRouter()

  const memoryHistory = createMemoryHistory({
    initialEntries: [opts.request.url],
  })

  router.update({
    history: memoryHistory,
  })

  await router.load()

  const app = <StartServer router={router} />

  return { app, router }
}

export default async function handler(request: Request): Promise<Response> {
  const { app, router } = await render({ request })

  const stream = await renderAsset({
    request,
    router,
    assets: () => {
      return <>{app}</>
    },
    getRouter,
    getRouterManifest,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
