import { requireAuth } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'

export default async function FoundationPage() {
  await requireAuth('student')
  
  // Foundation is now part of Day 1, redirect there
  redirect('/student/day/1')
}
