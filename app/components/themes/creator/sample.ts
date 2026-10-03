import type { Doc } from '~/lib/doc'

const flat = { mt: '0', mb: '0', z: 0 } as const

/** Preview content for the Creator Pop theme: a creator / studio landing page. */
export const creatorSample: Doc = {
  theme: 'creator',
  meta: { title: 'Nova Ray — Creator & Director', description: 'Short-form video and creative direction for bold brands.' },
  blocks: [
    {
      id: 'creator-hero',
      type: 'hero',
      layout: flat,
      props: { variant: 'split' },
      html: '<h2>Hi, I’m Nova. I make brands impossible to scroll past.</h2><p>Content creator, director &amp; full-time idea machine. Short-form video, campaigns and creative direction for brands that refuse to be boring.</p><img src="/theme-samples/creator-hero.svg" alt="Colourful illustration of a phone playing a video">',
    },
    {
      id: 'creator-stat-followers',
      type: 'card',
      layout: flat,
      html: '<h3>1.2M</h3><p>followers across TikTok, Instagram &amp; YouTube</p>',
    },
    {
      id: 'creator-stat-collabs',
      type: 'card',
      layout: flat,
      html: '<h3>48</h3><p>brand collabs shipped this year</p>',
    },
    {
      id: 'creator-stat-engagement',
      type: 'card',
      layout: flat,
      html: '<h3>3×</h3><p>average engagement vs. the industry benchmark</p>',
    },
    {
      id: 'creator-latest-drop',
      type: 'card',
      layout: flat,
      html: '<img src="/theme-samples/creator-work.svg" alt="Video thumbnail with a play button"><h3>Latest drop: “Night Shift”</h3><p>A 60-second street-food series for Kopi Kita — 4.1M views in the first week.</p>',
    },
    {
      id: 'creator-services',
      type: 'trimmed',
      layout: flat,
      html: '<h3>What I do</h3><p>I turn brand briefs into content people actually want to watch — from the first idea to the final cut.</p><ul><li>Short-form video for TikTok, Reels &amp; Shorts</li><li>Campaign concepts &amp; creative direction</li><li>UGC packages and creator partnerships</li><li>Live shopping &amp; launch events</li></ul><p>Every project starts with a 30-minute call: we talk goals, audience and vibe, then I come back with three concepts within a week.</p><p><strong>Brands I’ve worked with:</strong> Kopi Kita · Lumen Audio · Ride Co. · Saturday Club · Studio Mora · Pixelpark</p><p>Based in Jakarta, shooting anywhere. Small crew, fast turnaround, zero boring.</p>',
    },
    {
      id: 'creator-cta-book',
      type: 'cta',
      layout: flat,
      props: { label: 'Book a collab', href: 'mailto:hello@example.com', newTab: false, variant: 'solid' },
    },
    {
      id: 'creator-cta-reel',
      type: 'cta',
      layout: flat,
      props: { label: 'Watch the showreel', href: '#', newTab: false, variant: 'outline' },
    },
    {
      id: 'creator-cta-kit',
      type: 'cta',
      layout: flat,
      props: { label: 'Get the media kit', href: '#', newTab: false, variant: 'glass' },
    },
  ],
}
