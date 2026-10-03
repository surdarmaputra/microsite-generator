import { createFileRoute } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { listSitesFn } from '~/server/fns/sites'
import { SitesList } from '~/components/admin/SitesList'

export const Route = createFileRoute('/admin/')({
  loader: () => listSitesFn(),
  staleTime: 10_000,
  pendingComponent: AdminIndexPending,
  component: AdminIndexPage,
})

function AdminIndexPending() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="bg-surface-hover rounded-control animate-pulse h-7 w-24" />
          <div className="bg-surface-hover rounded-control animate-pulse h-4 w-16" />
        </div>
        <div className="bg-surface-hover rounded-control animate-pulse h-9 w-24" />
      </div>
      <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
        <div className="border-hairline border-b px-4 py-3 flex gap-4">
          <div className="bg-surface-hover rounded-control animate-pulse h-4 w-24" />
          <div className="bg-surface-hover rounded-control animate-pulse h-4 w-16 hidden sm:block" />
          <div className="bg-surface-hover rounded-control animate-pulse h-4 w-16" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-hairline border-b last:border-0 px-4 py-3 flex items-center gap-4">
            <div className="bg-surface-hover rounded-control animate-pulse h-4 flex-1" />
            <div className="bg-surface-hover rounded-control animate-pulse h-4 w-20 hidden sm:block" />
            <div className="bg-surface-hover rounded-control animate-pulse h-5 w-16" />
            <div className="bg-surface-hover rounded-control animate-pulse h-4 w-20 hidden md:block" />
            <div className="bg-surface-hover rounded-control animate-pulse h-8 w-20 hidden md:flex" />
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminIndexPage() {
  const sites = Route.useLoaderData()
  const router = useRouter()

  return <SitesList sites={sites} onRefresh={() => router.invalidate()} />
}
