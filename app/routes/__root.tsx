import { createRootRoute, Outlet, HeadContent, Scripts, ScrollRestoration, useRouter } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Microsite' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  }),
  component: RootComponent,
})

function CssLinks() {
  const router = useRouter()
  const assets = (router.ssr as any)?.manifest?.routes.__root__?.assets ?? []
  return assets
    .filter((a: any) => a.tag === 'link' && a.attrs?.rel === 'stylesheet')
    .map((a: any) => <link key={a.attrs.href} {...a.attrs} />)
}

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <CssLinks />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
