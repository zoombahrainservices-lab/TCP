/**
 * Vitest setup file
 * 
 * This file runs before all tests to set up the test environment.
 */

// Mock environment variables (NODE_ENV is set by vitest automatically)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// Prevent actual network calls during tests
global.fetch = async () => {
  throw new Error('Unexpected fetch call in tests. Mock this call.')
}

console.log('Vitest setup complete')
