// Content System Types
// Re-exports and extends block types for content management

export * from '../blocks/types';

// Additional types for content queries and management
export interface ChapterWithSteps {
  id: string;
  part_id: string;
  chapter_number: number;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  order_index: number;
  level_min: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  steps: StepWithPages[];
}

export interface StepWithPages {
  id: string;
  chapter_id: string;
  step_type: 'read' | 'self_check' | 'framework' | 'techniques' | 'resolution' | 'follow_through';
  title: string;
  slug: string;
  order_index: number;
  is_required: boolean;
  unlock_rule: any | null;
  created_at: string;
  pages: PageWithContent[];
}

export interface PageWithContent {
  id: string;
  step_id: string;
  slug: string;
  title: string | null;
  order_index: number;
  estimated_minutes: number | null;
  xp_award: number;
  content: any[]; // Block[]
  created_at: string;
  updated_at: string;
}

// User progress types
export interface UserPageProgress {
  userId: string;
  pageId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface UserStepProgress {
  userId: string;
  stepId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export interface UserChapterProgress {
  userId: string;
  chapterId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  startedAt: string | null;
  completedAt: string | null;
}

// User response types
export interface UserResponse {
  userId: string;
  chapterId: string;
  pageId: string | null;
  promptId: string;
  response: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponseCollection {
  [promptId: string]: any;
}
