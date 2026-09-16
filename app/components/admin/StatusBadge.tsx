'use client'
import { Badge } from '~/components/ui/Badge'
import type { SiteStatus } from '~/lib/doc'

const LABELS: Record<SiteStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  'unpublished-changes': 'Unpublished changes',
}

export function StatusBadge({ status }: { status: SiteStatus }) {
  return <Badge variant={status}>{LABELS[status]}</Badge>
}
