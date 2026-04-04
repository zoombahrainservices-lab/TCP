import Link from 'next/link'
import Image from 'next/image'
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm'
import { RecoverySessionMissing } from '@/components/auth/RecoverySessionMissing'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#142A4A] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative h-28">
              <Image
                src="/TCP-logo.png"
                alt="TCP"
                width={400}
                height={112}
                className="object-contain h-28 w-auto dark:hidden"
              />
              <Image
                src="/TCP-logo-white.png"
                alt="TCP"
                width={400}
                height={112}
                className="object-contain h-28 w-auto hidden dark:block"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Choose a new password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Use a strong password you don&apos;t use on other sites.
          </p>
        </div>

        {user ? <UpdatePasswordForm /> : <RecoverySessionMissing />}

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
