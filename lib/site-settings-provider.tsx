'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSiteSettings, DEFAULT_SETTINGS, type SiteSettings } from '@/lib/site-settings'

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS)

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    let cancelled = false
    getSiteSettings().then(s => {
      if (!cancelled) setSettings(s)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}
