import { createFileRoute } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { listSitesFn } from '~/server/fns/sites'
import { SitesList } from '~/components/admin/SitesList'

export const Route = createFileRoute('/admin/')({
  loader: () => listSitesFn(),
  component: AdminIndexPage,
})

function AdminIndexPage() {
  const sites = Route.useLoaderData()
  const router = useRouter()

  return <SitesList sites={sites} onRefresh={() => router.invalidate()} />
}
