import { createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { getLiveDocFn } from '~/server/fns/sites'
import { toPublicDoc } from '~/lib/doc'
import { publicCacheHeaders } from '~/lib/cache'
import { BlockRenderer } from '~/components/blocks/BlockRenderer'

export const Route = createFileRoute('/$slug')({
  loader: async ({ params }) => {
    const site = await getLiveDocFn({ data: { slug: params.slug } })

    if (!site || !site.liveDoc) {
      throw notFound()
    }

    const storageUrl = process.env['PUBLIC_STORAGE_URL'] ?? ''
    const publicDoc = toPublicDoc(site.liveDoc, storageUrl)
    return { doc: publicDoc, slug: params.slug }
  },
  headers: ({ loaderData }) => {
    if (!loaderData) return {}
    return publicCacheHeaders(loaderData.slug)
  },
  notFoundComponent: () => <NotFoundPage />,
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { meta } = loaderData.doc
    return {
      meta: [
        { title: meta.title },
        { name: 'description', content: meta.description },
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.description },
        ...(meta.ogImage
          ? [
              { property: 'og:image', content: meta.ogImage },
              { name: 'twitter:image', content: meta.ogImage },
            ]
          : []),
        { name: 'twitter:card', content: meta.ogImage ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description },
      ],
    }
  },
  component: SlugPage,
})

function SlugPage() {
  const { doc } = Route.useLoaderData()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const items = containerRef.current?.querySelectorAll('[data-block-type]')
    if (!items?.length) return

    const style = document.createElement('style')
    style.textContent = `
      .block-enter { opacity: 0; transform: translateY(8px); }
      .block-visible { opacity: 1; transform: translateY(0); transition: opacity 0.4s ease, transform 0.4s ease; }
    `
    document.head.appendChild(style)

    items.forEach(el => el.classList.add('block-enter'))

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('block-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 },
    )

    items.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      style.remove()
    }
  }, [])

  return (
    <main className="public-page" ref={containerRef}>
      {doc.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="public-page flex items-center justify-center">
      <p className="text-gray-400 text-sm">Page not found</p>
    </main>
  )
}
