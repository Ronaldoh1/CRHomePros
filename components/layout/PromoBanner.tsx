'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useSiteSettings } from '@/lib/site-settings-provider'

// Context so Navbar can read banner height
const BannerContext = createContext({ bannerHeight: 0 })
export const useBannerHeight = () => useContext(BannerContext)

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const siteSettings = useSiteSettings()
  const bannerEnabled = siteSettings.banner.enabled
  const [visible, setVisible] = useState(true)
  const [bannerHeight, setBannerHeight] = useState(bannerEnabled ? 40 : 0)

  useEffect(() => {
    if (!visible || !bannerEnabled) {
      setBannerHeight(0)
      return
    }
    const updateHeight = () => {
      setBannerHeight(window.innerWidth < 640 ? 64 : 40)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [visible, bannerEnabled])

  return (
    <BannerContext.Provider value={{ bannerHeight }}>
      {bannerEnabled && visible && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-gold-600 to-gold-500 text-dark-900 py-2 sm:py-2.5 px-4 text-center text-sm font-medium"
          style={{ minHeight: bannerHeight }}
        >
          <div className="container-custom flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 pr-6">
            <span className="font-semibold text-xs sm:text-sm">{siteSettings.banner.text}</span>
            {siteSettings.banner.linkText && siteSettings.banner.linkUrl && (
              <Link
                href={siteSettings.banner.linkUrl}
                className="inline-flex items-center gap-1 px-3 py-0.5 sm:py-1 bg-dark-900 text-white rounded-full text-xs font-semibold hover:bg-dark-800 transition-colors"
              >
                {siteSettings.banner.linkText}
              </Link>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {children}
    </BannerContext.Provider>
  )
}

// Backward compat
export function PromoBanner() { return null }
