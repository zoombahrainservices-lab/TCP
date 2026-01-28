import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
