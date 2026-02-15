// ============================================
// Image URL Resolver
// ============================================
// Converts local image paths to Firebase Storage CDN URLs.
// Gallery data uses paths like '/images/2025-05/kitchen.png'
// This resolver maps them to the correct Firebase Storage location.

const BUCKET = 'crhomepros.firebasestorage.app'

/**
 * Map local /images/ paths to Firebase Storage paths.
 * 
 * Firebase Storage structure:
 *   blog/           ← blog images
 *   projects/       ← all project images (2024-01, 2024-06, 2025-05, fence, basement)
 *   site/           ← logo, og-image
 *   team/           ← team photos
 */
function toStoragePath(localPath: string): string {
  // Strip leading /images/
  const rel = localPath.replace(/^\/images\//, '')

  // Blog images: /images/blog/x.png → blog/x.png
  if (rel.startsWith('blog/')) return rel

  // Team photos: /images/team-carlos-01.png → team/team-carlos-01.png
  if (rel.startsWith('team-')) return `team/${rel}`

  // Logo: /images/logo.png → site/logo.png
  if (rel === 'logo.png' || rel === 'og-image.jpg') return `site/${rel}`

  // Everything else (project folders): /images/2025-05/x.png → projects/2025-05/x.png
  return `projects/${rel}`
}

/**
 * Resolve an image path to Firebase Storage CDN URL.
 */
export function resolveImageUrl(localPath: string): string {
  // Already a full URL? Return as-is
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath
  }

  const storagePath = toStoragePath(localPath)
  const encoded = encodeURIComponent(storagePath)
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encoded}?alt=media`
}

/**
 * Resolve all images in a gallery project.
 */
export function resolveProjectImages<T extends { images: string[]; beforeImages?: string[] }>(
  project: T
): T {
  return {
    ...project,
    images: project.images.map(resolveImageUrl),
    ...(project.beforeImages && {
      beforeImages: project.beforeImages.map(resolveImageUrl),
    }),
  }
}

/**
 * Get Firebase Storage URL for a specific file.
 */
export function getStorageUrl(storagePath: string): string {
  const encoded = encodeURIComponent(storagePath)
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encoded}?alt=media`
}

export function getProjectImageUrl(folder: string, filename: string): string {
  return getStorageUrl(`projects/${folder}/${filename}`)
}

export function getSiteImageUrl(filename: string): string {
  return getStorageUrl(`site/${filename}`)
}

export const STORAGE_PATHS = {
  projects: 'projects',
  blog: 'blog',
  site: 'site',
  team: 'team',
} as const
