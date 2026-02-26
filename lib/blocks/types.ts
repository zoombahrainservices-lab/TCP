// Block Types for Content System
// Defines all possible block types that can be used in step_pages.content JSONB

// ============================================
// Base Block Types
// ============================================

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface StoryBlock {
  type: 'story';
  text: string;
}

export interface QuoteBlock {
  type: 'quote';
  text: string;
  author?: string;
  role?: string;
}

export interface DividerBlock {
  type: 'divider';
}

// ============================================
// Visual Blocks
// ============================================

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'science' | 'tip' | 'warning' | 'example' | 'truth' | 'research';
  title?: string;
  text: string;
  icon?: string;
}

export interface ListBlock {
  type: 'list';
  style: 'bullets' | 'numbers' | 'checkmarks';
  items: string[];
}

// ============================================
// Interactive Blocks
// ============================================

export interface PromptBlock {
  type: 'prompt';
  id: string; // e.g., "ch1_screentime_daily"
  label: string;
  description?: string;
  input: 'text' | 'textarea' | 'number' | 'select' | 'multiselect';
  unit?: string; // e.g., "hours", "minutes"
  options?: string[]; // For select/multiselect
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ScaleQuestionsBlock {
  type: 'scale_questions';
  id: string; // e.g., "ch1_self_check"
  title?: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
  scale: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  scoring?: {
    bands: Array<{
      range: [number, number];
      label: string;
      description?: string;
      color?: string;
    }>;
  };
}

export interface YesNoCheckBlock {
  type: 'yes_no_check';
  id: string; // e.g., "ch22_persuasion_check"
  title?: string;
  statements: Array<{
    id: string;
    text: string;
  }>;
  scoring?: {
    bands: Array<{
      range: [number, number];
      label: string;
      description?: string;
    }>;
  };
}

// ============================================
// Planning & Action Blocks
// ============================================

export interface TaskPlanBlock {
  type: 'task_plan';
  id: string;
  title: string;
  description?: string;
  duration?: string; // e.g., "90 days", "6 weeks"
  tasks: Array<{
    week?: number;
    title: string;
    description?: string;
    items?: string[];
  }>;
}

export interface ChecklistBlock {
  type: 'checklist';
  id: string;
  title?: string;
  items: Array<{
    id: string;
    text: string;
    checked?: boolean;
  }>;
}

export interface ScriptsBlock {
  type: 'scripts';
  id: string;
  title?: string;
  scripts: Array<{
    id: string;
    title: string;
    target: string; // e.g., "to a friend", "to yourself", "to a parent"
    content: string;
    context?: string;
  }>;
}

// ============================================
// Framework Blocks
// ============================================

export interface FrameworkIntroBlock {
  type: 'framework_intro';
  frameworkCode: string;
  title: string;
  description: string;
  letters: Array<{
    letter: string;
    meaning: string;
  }>;
}

export interface FrameworkLetterBlock {
  type: 'framework_letter';
  letter: string;
  title: string;
  content: string;
  image?: string;
}

// ============================================
// Call-to-Action Blocks
// ============================================

export interface CTABlock {
  type: 'cta';
  title: string;
  text: string;
  variant?: 'primary' | 'secondary' | 'emphasis';
}

export interface ButtonBlock {
  type: 'button';
  text: string;
  href?: string;
  action?: string; // For client-side actions
  variant?: 'primary' | 'secondary' | 'outline';
}

// ============================================
// Conditional & Dynamic Blocks
// ============================================

export interface ConditionalBlock {
  type: 'conditional';
  condition: {
    promptId: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
    value: any;
  };
  blocks: Block[]; // Nested blocks to render if condition is true
}

export interface VariableBlock {
  type: 'variable';
  template: string; // e.g., "Your score is {{ch1_self_check_score}}"
  variables: Record<string, string>; // Map of variable names to prompt IDs
}

// ============================================
// Union Type
// ============================================

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | StoryBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock
  | CalloutBlock
  | ListBlock
  | PromptBlock
  | ScaleQuestionsBlock
  | YesNoCheckBlock
  | TaskPlanBlock
  | ChecklistBlock
  | ScriptsBlock
  | CTABlock
  | ButtonBlock
  | ConditionalBlock
  | VariableBlock
  | FrameworkIntroBlock
  | FrameworkLetterBlock;

// ============================================
// Helper Types
// ============================================

export interface Page {
  id: string;
  step_id: string;
  slug: string;
  title: string | null;
  order_index: number;
  estimated_minutes: number | null;
  xp_award: number;
  chunk_id: number | null;
  content: Block[];
  created_at: string;
  updated_at: string;
}

export interface Step {
  id: string;
  chapter_id: string;
  step_type: 'read' | 'self_check' | 'framework' | 'techniques' | 'resolution' | 'follow_through';
  title: string;
  slug: string;
  order_index: number;
  is_required: boolean;
  unlock_rule: any | null;
  hero_image_url?: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  part_id: string;
  chapter_number: number;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  hero_image_url: string | null;
  framework_letter_images?: string[] | null;
  order_index: number;
  level_min: number;
  is_published: boolean;
  framework_code: string | null;
  framework_letters: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  created_at: string;
}

// ============================================
// Type Guards
// ============================================

export function isPromptBlock(block: Block): block is PromptBlock {
  return block.type === 'prompt';
}

export function isScaleQuestionsBlock(block: Block): block is ScaleQuestionsBlock {
  return block.type === 'scale_questions';
}

export function isYesNoCheckBlock(block: Block): block is YesNoCheckBlock {
  return block.type === 'yes_no_check';
}

export function isConditionalBlock(block: Block): block is ConditionalBlock {
  return block.type === 'conditional';
}

export function isInteractiveBlock(block: Block): block is PromptBlock | ScaleQuestionsBlock | YesNoCheckBlock | ChecklistBlock {
  return ['prompt', 'scale_questions', 'yes_no_check', 'checklist'].includes(block.type);
}
