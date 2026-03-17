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
  color?: string;
  bgColor?: string;
  borderColor?: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: string;
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

export interface InlineImageBlock {
  type: 'inline_image';
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'science' | 'tip' | 'warning' | 'example' | 'truth' | 'research' | 'success' | 'danger' | 'info' | 'custom';
  title?: string;
  text: string;
  icon?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  iconColor?: string;
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
  /** How to display question numbers: auto (1,2,3), none (no prefix), custom (use question.number e.g. 11, 22) */
  questionNumbering?: 'auto' | 'none' | 'custom';
  questions: Array<{
    id: string;
    text: string;
    /** Optional display number when questionNumbering is 'custom' (e.g. 11, 22) */
    number?: number;
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

export interface MCQBlock {
  type: 'mcq';
  id: string; // e.g., "ch1_quiz_q1"
  title?: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctOptionId?: string; // Optional - if provided, this is a graded MCQ; if omitted, it's a survey/reflection MCQ
  }>;
  scoring?: {
    showResults?: boolean; // Whether to show correct/incorrect feedback
    bands?: Array<{
      range: [number, number]; // [min score, max score]
      label: string;
      description?: string;
      color?: string;
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
  appearance?: {
    containerBgColor?: string;
    containerBorderColor?: string;
    itemBgColor?: string;
    itemBorderColor?: string;
    checkboxColor?: string;
    titleColor?: string;
    textColor?: string;
  };
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

export interface FrameworkCoverBlock {
  type: 'framework_cover';
  frameworkCode: string; // "SPARK" or "VOICE"
  frameworkTitle: string; // "The SPARK Framework"
  frameworkLabel?: string; // "FRAMEWORK: SPARK" (optional top label)
  letters: Array<{
    letter: string;
    meaning: string;
    color?: string; // Optional custom color per letter
  }>;
  accentColor?: string; // Default: #f7b418
  backgroundColor?: string; // Default: #FFF8E7
}

export interface FrameworkIntroBlock {
  type: 'framework_intro';
  frameworkCode: string;
  title: string;
  description: string;
  letters: Array<{
    letter: string;
    meaning: string;
    color?: string; // Optional custom color per letter
  }>;
  accentColor?: string; // Default: #f7b418 (orange)
}

export interface FrameworkLetterBlock {
  type: 'framework_letter';
  letter: string;
  title: string;
  content: string;
  image?: string;
}

// Legacy title slide block used in older chapter content.
// These are now handled by dedicated cover page components in the reading UI,
// but we keep the type so existing JSON content stays type-safe.
export interface TitleSlideBlock {
  type: 'title_slide';
  title?: string;
  subtitle?: string;
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
  variant?: 'primary' | 'secondary' | 'outline' | 'resolution_cta';
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

export interface PageMetaBlock {
  type: 'page_meta';
  title_style?: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
  };
}

// ============================================
// Resolution Step Blocks (identity + proof)
// ============================================

export interface IdentityResolutionGuidanceBlock {
  type: 'identity_resolution_guidance';
  title: string;
  subtitle: string;
  exampleText: string;
}

export interface ResolutionProofBlock {
  type: 'resolution_proof';
  id: string;
  title: string;
  subtitle: string;
  label: string;
  placeholder?: string;
}

// ============================================
// Self-Check Config Blocks (intro + results copy)
// ============================================

export interface SelfCheckIntroBlock {
  type: 'self_check_intro';
  /** Main heading on the intro screen */
  title?: string;
  /** Subtitle/one-line explanation under the heading */
  subtitle?: string;
  /** First body paragraph */
  body1?: string;
  /** Second body paragraph */
  body2?: string;
  /** Highlight title inside the callout box */
  highlightTitle?: string;
  /** Highlight body text inside the callout box */
  highlightBody?: string;
  /** Custom styles for this intro (overrides global defaults) */
  styles?: {
    titleColor?: string;
    titleSize?: string;
    subtitleColor?: string;
    bodyBgColor?: string;
    bodyTextColor?: string;
    highlightBgColor?: string;
    highlightBorderColor?: string;
    highlightTextColor?: string;
    buttonBgColor?: string;
    buttonHoverColor?: string;
    buttonTextColor?: string;
  };
}

export interface SelfCheckResultBlock {
  type: 'self_check_result';
  /** Main heading on the results screen */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Custom styles for this result (overrides global defaults) */
  styles?: {
    titleColor?: string;
    subtitleColor?: string;
    scoreBgColor?: string;
    scoreTextColor?: string;
    explanationBgColor?: string;
    explanationTextColor?: string;
    buttonBgColor?: string;
    buttonHoverColor?: string;
    buttonTextColor?: string;
  };
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
  | InlineImageBlock
  | CalloutBlock
  | ListBlock
  | PromptBlock
  | ScaleQuestionsBlock
  | YesNoCheckBlock
  | MCQBlock
  | TaskPlanBlock
  | ChecklistBlock
  | ScriptsBlock
  | CTABlock
  | ButtonBlock
  | ConditionalBlock
  | VariableBlock
  | PageMetaBlock
  | IdentityResolutionGuidanceBlock
  | ResolutionProofBlock
  | SelfCheckIntroBlock
  | SelfCheckResultBlock
  | FrameworkCoverBlock
  | FrameworkIntroBlock
  | FrameworkLetterBlock
  | TitleSlideBlock;

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
  hero_image_url?: string | null; // Main hero image for the page (left side)
  title_style?: { color?: string; fontSize?: string; fontWeight?: string } | null;
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
