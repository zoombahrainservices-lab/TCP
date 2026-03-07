'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCelebrationStore } from '@/lib/celebration/store'
import FullscreenCelebration from './FullscreenCelebration'

export default function CelebrationHost() {
  const { current, open, closeCurrent } = useCelebrationStore()
  const [mounted, setMounted] = useState(false)
  
  // Ensure we only render on client side
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Lock scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // Prevent layout shift
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [open])
  
  if (!mounted || !open || !current) return null
  
  return createPortal(
    <FullscreenCelebration 
      payload={current} 
      onClose={closeCurrent} 
    />,
    document.body
  )
}
