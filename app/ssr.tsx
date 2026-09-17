import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server'
import { getFullRouterManifest } from '@tanstack/start/router-manifest'
import { getManifest } from 'vinxi/manifest'
import { createRouter } from './router'

async function getRouterManifest() {
  const routerManifest = getFullRouterManifest()
  const clientManifest = getManifest('client')
  const clientAssets: Array<any> = (await clientManifest.inputs[clientManifest.handler]?.assets()) ?? []
  const cssLinks = clientAssets.filter((a: any) => a.attrs?.href?.endsWith('.css'))
  const rootRoute = (routerManifest.routes.__root__ = routerManifest.routes.__root__ || {})
  rootRoute.assets = [...cssLinks, ...(rootRoute.assets || [])]
  return {
    ...routerManifest,
    routes: Object.fromEntries(
      Object.entries(routerManifest.routes).map(([k, v]: [string, any]) => {
        const { preloads, assets } = v
        return [k, { preloads, assets }]
      }),
    ),
  }
}

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
