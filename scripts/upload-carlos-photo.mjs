#!/usr/bin/env node
/**
 * Upload Carlos's team photo to Firebase Storage
 * and update the About page to reference it.
 * 
 * Usage: node scripts/upload-carlos-photo.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Find the image ──
const possiblePaths = [
  join(process.env.HOME, 'Downloads', 'team-carlos-01.jpg'),
  join(process.env.HOME, 'Downloads', '1000057973.jpg'),
  join(ROOT, 'team-carlos-01.jpg'),
]

let imagePath = possiblePaths.find(p => existsSync(p))
if (!imagePath) {
  console.error('❌ Could not find team-carlos-01.jpg in ~/Downloads/')
  console.error('   Put the image in ~/Downloads/team-carlos-01.jpg and try again.')
  process.exit(1)
}
console.log(`📸 Found image: ${imagePath}`)

// ── Optimize image if ImageMagick available ──
const optimizedPath = join(ROOT, 'team-carlos-01-optimized.jpg')
try {
  execSync(`which convert`, { stdio: 'ignore' })
  console.log('🔧 Optimizing image...')
  execSync(`convert "${imagePath}" -gravity North -crop 1320x1320+0+200 -resize 600x600 -quality 85 "${optimizedPath}"`)
  imagePath = optimizedPath
  console.log('✅ Optimized to 600x600')
} catch {
  console.log('⚠️  ImageMagick not found, uploading original')
}

// ── Initialize Firebase Admin ──
const saPath = join(ROOT, 'scripts', 'firebase-service-account.json')
if (!existsSync(saPath)) {
  console.error('❌ Service account not found at scripts/firebase-service-account.json')
  process.exit(1)
}

const sa = JSON.parse(readFileSync(saPath, 'utf-8'))
const app = initializeApp({
  credential: cert(sa),
  storageBucket: 'crhomepros.firebasestorage.app',
})

const bucket = getStorage().bucket()

// ── Upload ──
console.log('☁️  Uploading to Firebase Storage: team/team-carlos-01.jpg ...')
await bucket.upload(imagePath, {
  destination: 'team/team-carlos-01.jpg',
  metadata: {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  },
})

// Make public
await bucket.file('team/team-carlos-01.jpg').makePublic()

const url = `https://firebasestorage.googleapis.com/v0/b/crhomepros.firebasestorage.app/o/team%2Fteam-carlos-01.jpg?alt=media`
console.log(`✅ Uploaded! URL: ${url}`)

// ── Update About page ──
const aboutPath = join(ROOT, 'app', '[locale]', 'about', 'page.tsx')
if (existsSync(aboutPath)) {
  let content = readFileSync(aboutPath, 'utf-8')
  if (content.includes('team-carlos-02.png')) {
    content = content.replace(
      'src="/images/team-carlos-02.png"',
      'src="/images/team-carlos-01.jpg"'
    )
    const { writeFileSync } = await import('fs')
    writeFileSync(aboutPath, content)
    console.log('✅ Updated About page: team-carlos-02.png → team-carlos-01.jpg')
  } else {
    console.log('ℹ️  About page already updated or uses different image path')
  }
}

// ── Clean up ──
if (existsSync(optimizedPath)) {
  const { unlinkSync } = await import('fs')
  unlinkSync(optimizedPath)
}

console.log('')
console.log('🎉 Done! Carlos photo is live.')
console.log(`   ${url}`)
console.log('')
console.log('Next: run "vercel --prod" to deploy the updated About page.')
