import type { Doc } from '~/lib/doc'

export const sampleDoc: Doc = {
  theme: 'basic',
  meta: { title: 'Brew & Bloom', description: 'A sample café microsite.' },
  blocks: [
    {
      id: 'sample-hero-banner',
      type: 'hero',
      layout: { mt: '0', mb: '0', z: 0 },
      props: { variant: 'banner' },
      html: '<img src="/theme-samples/hero.jpg" alt="A cosy café interior"><h2>Welcome to Brew &amp; Bloom</h2><p>A neighbourhood café where great coffee meets fresh food.</p>',
    },
    {
      id: 'sample-card',
      type: 'card',
      layout: { mt: '0', mb: '0', z: 0 },
      html: '<img src="/theme-samples/card.jpg" alt="Seasonal menu spread"><h3>Our Seasonal Menu</h3><p>Crafted with local ingredients and lots of love.</p>',
    },
    {
      id: 'sample-hero-split',
      type: 'hero',
      layout: { mt: '0', mb: '0', z: 0 },
      props: { variant: 'split' },
      html: '<img src="/theme-samples/split.jpg" alt="Café outdoor seating"><h2>Find Us</h2><p>Open seven days a week at the corner of Oak Lane and Maple Street.</p>',
    },
    {
      id: 'sample-trimmed',
      type: 'trimmed',
      layout: { mt: '0', mb: '0', z: 0 },
      html: '<h3>Our Story</h3><p>Brew &amp; Bloom started as a tiny pop-up at the weekend market in 2018.</p><p>We quickly outgrew the market stall and found our forever home on Oak Lane in 2020.</p><p>Every cup is made with beans sourced from small, sustainable farms around the world.</p><p>Our kitchen team changes the menu with the seasons, so there is always something new to discover.</p><p>We believe a great cup of coffee and a warm smile can make anyone\'s day better — that is the Brew &amp; Bloom promise.</p>',
    },
    {
      id: 'sample-cta-solid',
      type: 'cta',
      layout: { mt: '0', mb: '0', z: 0 },
      props: { label: 'Book a table', href: '#', newTab: false, variant: 'solid' },
    },
    {
      id: 'sample-cta-outline',
      type: 'cta',
      layout: { mt: '0', mb: '0', z: 0 },
      props: { label: 'See the menu', href: '#', newTab: false, variant: 'outline' },
    },
    {
      id: 'sample-cta-glass',
      type: 'cta',
      layout: { mt: '0', mb: '0', z: 0 },
      props: { label: 'Get directions', href: '#', newTab: false, variant: 'glass' },
    },
  ],
}
