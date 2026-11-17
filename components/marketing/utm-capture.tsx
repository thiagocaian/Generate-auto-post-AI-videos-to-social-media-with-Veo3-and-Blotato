'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/marketing/attribution-client'

/** Stores first-touch UTM / referrer so lead forms can send it with the submission. Renders nothing. */
export default function UtmCapture() {
  useEffect(() => { captureAttribution() }, [])
  return null
}
