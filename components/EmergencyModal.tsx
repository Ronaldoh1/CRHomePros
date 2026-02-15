'use client'

import { useState } from 'react'
import { X, AlertTriangle, Phone } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { COMPANY } from '@/lib/constants'

interface EmergencyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-dark-100 hover:bg-dark-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Emergency Service</h2>
          </div>
          <p className="text-red-100">24/7 Available - Fast Response</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-3 text-dark-900">Emergency Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-dark-50 rounded-lg">
                <span className="font-medium">Standard Emergency Call</span>
                <span className="text-xl font-bold text-gold-600">$150</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-50 rounded-lg">
                <span className="font-medium">After Hours (6pm-8am)</span>
                <span className="text-xl font-bold text-gold-600">$200</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-50 rounded-lg">
                <span className="font-medium">Weekends & Holidays</span>
                <span className="text-xl font-bold text-gold-600">$250</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-dark-700">
              <strong>Note:</strong> Emergency fee covers diagnosis and first hour. Additional work billed separately. We'll provide a full estimate before starting major repairs.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex items-center justify-center gap-3 w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now: {COMPANY.phoneFormatted}
            </a>
            <Link
              href="/contact"
              onClick={onClose}
              className="block text-center w-full bg-dark-100 hover:bg-dark-200 text-dark-900 py-3 rounded-xl font-semibold transition-colors"
            >
              Or Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
