import sanitizeHtml from 'sanitize-html'

function makeOptions(storageUrl: string): sanitizeHtml.IOptions {
  return {
    allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'iframe', 'br'],
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs['href'] ?? ''
        const isAllowed = /^(https?|mailto|tel):/.test(href)
        return {
          tagName,
          attribs: {
            ...attribs,
            href: isAllowed ? href : '#',
            rel: 'noopener noreferrer',
            ...(attribs['target'] === '_blank' ? { target: '_blank' } : {}),
          },
        }
      },
      img: (tagName, attribs) => {
        const src = attribs['src'] ?? ''
        if (!storageUrl || !src.startsWith(storageUrl)) {
          return { tagName: 'span', attribs: {} }
        }
        return { tagName, attribs }
      },
      iframe: (tagName, attribs) => {
        const src = attribs['src'] ?? ''
        if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\//.test(src)) {
          return { tagName: 'span', attribs: {} }
        }
        return {
          tagName,
          attribs: {
            src,
            width: attribs['width'] ?? '560',
            height: attribs['height'] ?? '315',
            allowfullscreen: '',
            frameborder: '0',
          },
        }
      },
    },
  }
}

export function sanitizeBlockHtml(html: string): string {
  const storageUrl = process.env['PUBLIC_STORAGE_URL'] ?? ''
  return sanitizeHtml(html, makeOptions(storageUrl))
}

const CTA_HREF_RE = /^(https?|mailto|tel):\/\//

export function sanitizeCtaHref(href: string): string {
  if (CTA_HREF_RE.test(href)) return href
  if (href.startsWith('https://wa.me/')) return href
  return '#'
}
