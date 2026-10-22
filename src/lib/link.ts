// Base-aware internal links. import.meta.env.BASE_URL is '/jv-creations/' now and
// '/' once we flip to a root domain - so every link() call is a no-op at root,
// nothing to revert. Use for ALL internal hrefs (root-relative paths).
// Leave external links (mailto:, https://) and in-page anchors handled by callers.
const BASE = import.meta.env.BASE_URL; // '/jv-creations/' now, '/' later

export function link(path: string): string {
  if (path === '/') return BASE;
  return (BASE.endsWith('/') ? BASE.slice(0, -1) : BASE) + path;
}
