#!/usr/bin/env node
/**
 * 🔄 Update Image URLs in Data Files ONLY
 * =========================================
 * SAFE: Only rewrites image paths in data/config files.
 * Does NOT touch component files (Hero, Navbar, IntakeForm, etc.)
 * Components use resolveImageUrl() from the resolver — no changes needed.
 *
 * Usage:
 *   node scripts/update-image-urls.mjs
 *   node scripts/update-image-urls.mjs --dry-run
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

// ===== ONLY DATA FILES — DO NOT TOUCH COMPONENTS =====
const TARGET_FILES = [
  'lib/gallery-data.ts',
  'lib/blog-posts.ts',
]
// Components use resolveImageUrl() — they don't need direct URL changes.
// DO NOT add Hero.tsx, Navbar.tsx, IntakeForm.tsx, FeaturedProjects.tsx, etc.

console.log('')
console.log('🔄 Checking image paths in DATA files only')
console.log('=========================================')
console.log('📌 SAFE MODE: Only touching data files (gallery-data.ts, blog-posts.ts)')
console.log('   Components are NOT modified — they use resolveImageUrl().')
console.log('')

let totalChanges = 0

for (const relPath of TARGET_FILES) {
  const fullPath = join(ROOT, relPath)
  if (!existsSync(fullPath)) {
    console.log(`⏭️  Skipped ${relPath} (not found)`)
    continue
  }

  const original = readFileSync(fullPath, 'utf-8')

  // Check for any hardcoded Firebase URLs that should be local paths
  const firebaseUrlPattern = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"'\s]+/g
  const matches = original.match(firebaseUrlPattern)

  if (matches && matches.length > 0) {
    console.log(`⚠️  ${relPath}: Found ${matches.length} hardcoded Firebase URLs`)
    console.log('   These should be local paths like /images/... — resolveImageUrl() handles the rest.')
  } else {
    console.log(`✅ ${relPath}: Clean — using local paths (resolveImageUrl() will resolve them)`)
  }
}

console.log('')
console.log('Done! Components use resolveImageUrl() automatically.')
console.log('No manual URL changes needed in component files.')
console.log('')
