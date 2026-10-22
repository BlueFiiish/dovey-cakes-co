// Map every gallery cut-out by its slug (filename without extension).
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.jpg', { eager: true });

export const galleryImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace(/\.jpg$/, '');
    return [slug, mod.default];
  })
);

export function imageForSlug(slug: string): ImageMetadata {
  const img = galleryImages[slug];
  if (!img) throw new Error(`No gallery image found for slug "${slug}"`);
  return img;
}
