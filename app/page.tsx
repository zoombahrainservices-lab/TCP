import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/guards'
import { LandingPageWrapper } from '@/components/landing/LandingPageWrapper'

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPageWrapper />
}
