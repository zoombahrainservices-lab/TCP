export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
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
