// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployment target. Two hosts are supported:
//   GitHub Pages (project site, default):  SITE=https://bluefiiish.github.io  BASE=/dovey-cakes-co/
//   Cloudflare Pages (functions, own domain): set SITE_URL=https://<domain> and SITE_BASE=/ in the
//   Pages project's build environment variables. Everything else is base-aware via src/lib/link.ts.
// SITE = origin only (no trailing path). BASE = subpath with leading + trailing slash.
const SITE = process.env.SITE_URL ?? 'https://bluefiiish.github.io';
const BASE = process.env.SITE_BASE ?? '/dovey-cakes-co/';

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
