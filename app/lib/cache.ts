export function publicCacheHeaders(slug: string): Record<string, string> {
  return {
    'Netlify-CDN-Cache-Control': 'public, s-maxage=31536000, durable',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-Vary': 'query=',
    'Cache-Tag': `site-${slug}`,
  }
}

export function notFoundCacheHeaders(slug: string): Record<string, string> {
  return {
    'Netlify-CDN-Cache-Control': 'public, s-maxage=60',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-Vary': 'query=',
    'Cache-Tag': `site-${slug}`,
  }
}

export function apiCacheHeaders(slug: string): Record<string, string> {
  return {
    'Netlify-CDN-Cache-Control': 'public, s-maxage=31536000, durable',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-Vary': 'query=',
    'Netlify-Cache-ID': `site-${slug}`,
  }
}
