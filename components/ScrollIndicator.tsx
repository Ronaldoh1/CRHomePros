'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollIndicatorProps {
  className?: string
  text?: string
}

export function ScrollIndicator({ className, text = "Scroll for more" }: ScrollIndicatorProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 animate-bounce-slow",
      className
    )}>
      <span className="text-sm text-white/60 font-medium">{text}</span>
      <ChevronDown className="w-6 h-6 text-white/60" />
    </div>
  )
}
