'use client'

import { useState, useEffect } from 'react'
import { EmergencyModal } from '@/components/EmergencyModal'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown, Globe, AlertTriangle } from 'lucide-react'
import { cn, formatPhoneLink, formatWhatsAppLink } from '@/lib/utils'
import { COMPANY, NAV_LINKS } from '@/lib/constants'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { LanguageSwitcher } from '@/lib/i18n/link'
import { resolveImageUrl } from '@/lib/resolve-images'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 150, 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isScrolled = scrollProgress > 0.1

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const logoHeight = 80 - (scrollProgress * 40)
  const logoOpacity = 1 - (scrollProgress * 0.3)
  const logoScale = 1 - (scrollProgress * 0.2)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-dark-900/95 backdrop-blur-lg shadow-lg shadow-black/20 py-2'
            : 'bg-dark-900/80 backdrop-blur-sm py-4'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo — blended with gold glow */}
            <Link href="/" className="flex items-center group">
              <div
                className="relative transition-all duration-150 ease-out px-4 py-3 -ml-2"
                style={{
                  height: `${logoHeight}px`,
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                  transformOrigin: 'left center',
                }}
              >
                <Image
                  src={resolveImageUrl("/images/logo.png")}
                  alt="CR Home Pros - Complete Home Services"
                  width={300}
                  height={80}
                  className="h-full w-auto object-contain drop-shadow-[0_0_8px_rgba(196,164,95,0.3)]"
                  style={{
                    maxWidth: 'none',
                    filter: 'brightness(1.15) contrast(0.9)',
                    mixBlendMode: 'screen',
                  }}
                  priority
                  quality={100}
                  unoptimized
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    isActive(link.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                  {'badge' in link && link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gold-500 text-dark-900 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-2 ml-2">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 bg-red-600/90 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 animate-pulse hover:animate-none whitespace-nowrap"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Emergency?
              </button>

              <LanguageSwitcher
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 whitespace-nowrap hover:bg-gold-500/30 transition-all"
              />

              <a
                href={formatWhatsAppLink(COMPANY.phone, "Hi! I'm interested in your services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-lg"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>

              <a
                href={formatPhoneLink(COMPANY.phone)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 bg-white text-primary-800 hover:bg-white/90 hover:shadow-lg whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                {COMPANY.phoneFormatted}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl transition-colors text-white hover:bg-white/10"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        <div
          className={cn(
            'absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <div className="relative h-14 w-auto">
                <Image
                  src={resolveImageUrl("/images/logo.png")}
                  alt="CR Home Pros"
                  width={180}
                  height={56}
                  className="h-full w-auto object-contain"
                  quality={100}
                  unoptimized
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-dark-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-5 relative">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-lg font-medium transition-all',
                        isActive(link.href)
                          ? 'bg-primary-100 text-primary-800'
                          : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                      )}
                    >
                      {link.label}
                      {'badge' in link && link.badge && (
                        <span className="text-xs font-bold px-2 py-1 bg-gold-500 text-dark-900 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile CTAs */}
              <div className="mt-6 pt-6 border-t border-dark-100 space-y-3">
                <button
                  onClick={() => { setShowEmergencyModal(true); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 text-white font-bold text-lg"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Got an Emergency?
                </button>

                <Link
                  href="/get-started"
                  className="btn-gold w-full text-center text-lg block"
                >
                  Get Free Estimate
                </Link>
              </div>

              {/* Scroll fade hint — tells user there's more below */}
              <div className="sticky bottom-0 left-0 right-0 pointer-events-none mt-4">
                <div className="h-10 bg-gradient-to-t from-white to-transparent" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-5 border-t border-dark-100 bg-dark-50 space-y-3">
              <a
                href={formatPhoneLink(COMPANY.phone)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-800 text-white font-medium"
              >
                <Phone className="w-5 h-5" />
                Call {COMPANY.phoneFormatted}
              </a>
              <a
                href={formatWhatsAppLink(COMPANY.phone, "Hi! I'm interested in your services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-medium"
              >
                <WhatsAppIcon className="w-5 h-5" />
                WhatsApp Us
              </a>
              <LanguageSwitcher
                className="block text-center text-sm font-medium text-primary-700 bg-primary-50 py-2.5 rounded-xl hover:bg-primary-100 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
    </>
  )
}
