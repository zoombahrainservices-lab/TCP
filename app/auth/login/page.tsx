import Link from 'next/link'
import Image from 'next/image'
import LoginForm from '@/components/auth/LoginForm'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#142A4A] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Theme Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative h-28">
              {/* Light mode logo */}
              <Image 
                src="/TCP-logo.png" 
                alt="TCP" 
                width={400}
                height={112}
                className="object-contain h-28 w-auto dark:hidden"
              />
              {/* Dark mode logo */}
              <Image 
                src="/TCP-logo-white.png" 
                alt="TCP" 
                width={400}
                height={112}
                className="object-contain h-28 w-auto hidden dark:block"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Sign in to access your account
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link href="/auth/register" className="text-[#0770C4] dark:text-[#51BFE3] hover:underline font-medium">
            Sign up
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
