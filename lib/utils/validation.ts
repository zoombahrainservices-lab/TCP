export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

interface PasswordValidationOptions {
  username?: string
  email?: string
}

function isCommonPassword(password: string): boolean {
  const common = new Set([
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'letmein',
    'welcome123',
    'abc12345',
  ])

  return common.has(password.toLowerCase())
}

export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): { valid: boolean; message?: string } {
  if (password === undefined || password === null) {
    return { valid: false, message: 'Password is required.' }
  }

  if (password.length === 0) {
    return { valid: false, message: 'Password cannot be empty.' }
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' }
  }

  if (password.length > 64) {
    return { valid: false, message: 'Password must not exceed 64 characters.' }
  }

  if (/\s/.test(password)) {
    return { valid: false, message: 'Password cannot contain spaces.' }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const lettersOnly = /^[A-Za-z]+$/.test(password)
  const numbersOnly = /^[0-9]+$/.test(password)

  if (numbersOnly) {
    return {
      valid: false,
      message: 'Password cannot contain only numbers. Please include uppercase letters and symbols.',
    }
  }

  if (lettersOnly && hasLowercase && !hasUppercase) {
    return {
      valid: false,
      message:
        'Password cannot contain only lowercase letters. Please include uppercase letters, numbers, and symbols.',
    }
  }

  if (lettersOnly && hasUppercase && !hasLowercase) {
    return {
      valid: false,
      message:
        'Password cannot contain only uppercase letters. Please include lowercase letters, numbers, and symbols.',
    }
  }

  if (!hasUppercase) {
    return { valid: false, message: 'Please add at least one uppercase letter.' }
  }

  if (!hasLowercase) {
    return { valid: false, message: 'Please add at least one lowercase letter.' }
  }

  if (!hasNumber) {
    return { valid: false, message: 'Please add at least one number.' }
  }

  if (!hasSpecial) {
    return {
      valid: false,
      message: 'Please add at least one special character (e.g., @, #, $, %).',
    }
  }

  const usernameCandidate =
    options.username?.trim() ||
    (options.email && options.email.includes('@') ? options.email.split('@')[0] : '')

  if (usernameCandidate && password.toLowerCase() === usernameCandidate.toLowerCase()) {
    return { valid: false, message: 'Password cannot be the same as your username.' }
  }

  if (isCommonPassword(password)) {
    return { valid: false, message: 'Password is too common. Please choose a stronger password.' }
  }

  return { valid: true }
}

export function validateDayNumber(dayNumber: number): boolean {
  return dayNumber >= 1 && dayNumber <= 30 && Number.isInteger(dayNumber)
}

export function validateScale(value: number): boolean {
  return value >= 1 && value <= 5 && Number.isInteger(value)
}

export function validateRole(role: string): boolean {
  return ['student', 'parent', 'mentor', 'admin'].includes(role)
}
