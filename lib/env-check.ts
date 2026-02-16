/**
 * Environment variable validation utilities
 */

export interface EnvCheckResult {
  isValid: boolean
  missing: string[]
  masked: Record<string, string>
}

export function checkAdminEnv(): EnvCheckResult {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  // Mask sensitive values for logging
  const masked: Record<string, string> = {}
  Object.entries(required).forEach(([key, value]) => {
    if (value) {
      masked[key] = key.includes('KEY') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value
    } else {
      masked[key] = 'MISSING'
    }
  })
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    return { isValid: false, missing, masked }
  }
  
  console.log('✅ All required environment variables present')
  return { isValid: true, missing: [], masked }
}

export function checkClientEnv(): EnvCheckResult {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
  
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  const masked: Record<string, string> = {}
  Object.entries(required).forEach(([key, value]) => {
    if (value) {
      masked[key] = key.includes('KEY')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value
    } else {
      masked[key] = 'MISSING'
    }
  })
  
  return { isValid: missing.length === 0, missing, masked }
}
