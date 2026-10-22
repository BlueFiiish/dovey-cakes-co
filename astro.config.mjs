// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployment target. Currently a GitHub Pages PROJECT site, so the build lives
// under a subpath. When she gets her own domain, flip these two lines:
//   SITE -> 'https://herdomain.com'  and  BASE -> '/'  (everything else is base-aware).
// SITE = origin only (no trailing path). BASE = subpath with leading + trailing slash.
const SITE = 'https://bluefiiish.github.io';
const BASE = '/dovey-cakes-co/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  integrations: [sitemap()],
  image: {
    responsiveStyles: true,
  },
});
