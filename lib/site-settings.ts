// ============================================
// Site Settings — Firebase CMS
// ============================================
// Stores all editable site content in Firestore.
// Carlos can edit banner, contact info, branding,
// payment methods, etc. from the admin panel.
// ============================================

import { getDb } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

const SETTINGS_DOC = 'site_config'
const SETTINGS_COLLECTION = 'site_settings'

export interface BannerSettings {
  enabled: boolean
  text: string
  linkText: string
  linkUrl: string
}

export interface ContactSettings {
  phone: string
  email: string
  whatsappUrl: string
  address: string
  city: string
  state: string
  hours: string
  hoursNote: string
  emergencyAvailable: boolean
}

export interface BrandingSettings {
  companyName: string
  tagline: string
  mhicNumber: string
  yearsExperience: string
  projectsCompleted: string
}

export interface SocialSettings {
  facebook: string
  instagram: string
  tiktok: string
  yelp: string
  google: string
}

export interface SiteSettings {
  banner: BannerSettings
  contact: ContactSettings
  branding: BrandingSettings
  social: SocialSettings
  paymentMethods: string[]
  serviceAreas: string[]
  updatedAt?: any
}

// ── Defaults (current hardcoded values) ──

export const DEFAULT_SETTINGS: SiteSettings = {
  banner: {
    enabled: true,
    text: 'Winter Prep Special: 15% off roof inspections — Beat inflation with locked-in pricing',
    linkText: 'Claim Offer →',
    linkUrl: '/en/contact',
  },
  contact: {
    phone: '(571) 237-7164',
    email: 'crhomepros@gmail.com',
    whatsappUrl: 'https://wa.me/15712377164',
    address: 'Hyattsville, MD',
    city: 'Hyattsville',
    state: 'MD',
    hours: '8:00 AM – 7:00 PM',
    hoursNote: 'Mon – Sat',
    emergencyAvailable: true,
  },
  branding: {
    companyName: 'CR Home Pros',
    tagline: 'Quality Home Improvement Since 2003',
    mhicNumber: '#05-132359',
    yearsExperience: '20+',
    projectsCompleted: '500+',
  },
  social: {
    facebook: 'https://www.facebook.com/crgeneralservices',
    instagram: 'https://www.instagram.com/crhomepros',
    tiktok: 'https://www.tiktok.com/@crhomepros',
    yelp: '',
    google: '',
  },
  paymentMethods: ['Cash', 'Check', 'Zelle', 'Credit Card', 'Financing Available'],
  serviceAreas: [
    'Washington DC', 'Maryland', 'Virginia',
    'Bethesda', 'Silver Spring', 'Rockville',
    'Arlington', 'Alexandria',
  ],
}

// ── Read settings ──

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const db = getDb()
    if (!db) return DEFAULT_SETTINGS

    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const snap = await getDoc(docRef)

    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>
      // Merge with defaults so new fields always have values
      return {
        banner: { ...DEFAULT_SETTINGS.banner, ...data.banner },
        contact: { ...DEFAULT_SETTINGS.contact, ...data.contact },
        branding: { ...DEFAULT_SETTINGS.branding, ...data.branding },
        social: { ...DEFAULT_SETTINGS.social, ...data.social },
        paymentMethods: data.paymentMethods || DEFAULT_SETTINGS.paymentMethods,
        serviceAreas: data.serviceAreas || DEFAULT_SETTINGS.serviceAreas,
      }
    }

    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Failed to load site settings:', error)
    return DEFAULT_SETTINGS
  }
}

// ── Write settings ──

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  try {
    const db = getDb()
    if (!db) return false

    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return true
  } catch (error) {
    console.error('Failed to save site settings:', error)
    return false
  }
}

// ── Save individual section ──

export async function saveBannerSettings(banner: BannerSettings): Promise<boolean> {
  return saveSiteSettings({ banner })
}

export async function saveContactSettings(contact: ContactSettings): Promise<boolean> {
  return saveSiteSettings({ contact })
}

export async function saveBrandingSettings(branding: BrandingSettings): Promise<boolean> {
  return saveSiteSettings({ branding })
}

export async function saveSocialSettings(social: SocialSettings): Promise<boolean> {
  return saveSiteSettings({ social })
}
