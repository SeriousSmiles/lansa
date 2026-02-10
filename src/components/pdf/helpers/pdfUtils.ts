/**
 * Get the absolute URL for a public asset, required by react-pdf Image.
 */
export function getPublicAssetUrl(path: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export const BADGE_PATH = '/powered-by-lansa-badge.png';
