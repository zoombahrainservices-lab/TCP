export type SectionKey = 
  | 'reading' 
  | 'assessment' 
  | 'framework' 
  | 'techniques' 
  | 'proof' 
  | 'follow_through'

export type CelebrationType = 
  | 'section' 
  | 'streak' 
  | 'levelup' 
  | 'chapter'

export interface CelebrationPayload {
  type: CelebrationType
  sectionKey?: SectionKey
  title: string
  subtitle?: string
  xp?: number
  streakDays?: number
  bonusXp?: number
  newLevel?: number
  autoCloseMs?: number
  intensity?: 'micro' | 'big' | 'mega'
}
