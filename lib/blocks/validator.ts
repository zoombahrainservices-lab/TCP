import { z } from 'zod'

const HeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string(),
})

const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
})

const StoryBlockSchema = z.object({
  type: z.literal('story'),
  text: z.string(),
})

const QuoteBlockSchema = z.object({
  type: z.literal('quote'),
  text: z.string(),
  author: z.string().optional(),
  role: z.string().optional(),
})

const DividerBlockSchema = z.object({
  type: z.literal('divider'),
})

const ImageBlockSchema = z.object({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  variant: z.enum(['science', 'tip', 'warning', 'example', 'truth', 'research']),
  title: z.string().optional(),
  text: z.string(),
  icon: z.string().optional(),
})

const ListBlockSchema = z.object({
  type: z.literal('list'),
  style: z.enum(['bullets', 'numbers', 'checkmarks']),
  items: z.array(z.string()),
})

const PromptBlockSchema = z.object({
  type: z.literal('prompt'),
  id: z.string().min(1, 'Prompt ID is required'),
  label: z.string(),
  description: z.string().optional(),
  input: z.enum(['text', 'textarea', 'number', 'select', 'multiselect']),
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
})

const ScaleQuestionsBlockSchema = z.object({
  type: z.literal('scale_questions'),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string().min(1),
    text: z.string(),
  })),
  scale: z.object({
    min: z.number(),
    max: z.number(),
    minLabel: z.string(),
    maxLabel: z.string(),
  }),
  scoring: z.object({
    bands: z.array(z.object({
      range: z.tuple([z.number(), z.number()]),
      label: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
    })),
  }).optional(),
})

const YesNoCheckBlockSchema = z.object({
  type: z.literal('yes_no_check'),
  id: z.string().min(1),
  title: z.string().optional(),
  statements: z.array(z.object({
    id: z.string().min(1),
    text: z.string(),
  })),
  scoring: z.object({
    bands: z.array(z.object({
      range: z.tuple([z.number(), z.number()]),
      label: z.string(),
      description: z.string().optional(),
    })),
  }).optional(),
})

const TaskPlanBlockSchema = z.object({
  type: z.literal('task_plan'),
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.string().optional(),
  tasks: z.array(z.object({
    week: z.number().optional(),
    title: z.string(),
    description: z.string().optional(),
    items: z.array(z.string()).optional(),
  })),
})

const ChecklistBlockSchema = z.object({
  type: z.literal('checklist'),
  id: z.string(),
  title: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    checked: z.boolean().optional(),
  })),
})

const ScriptsBlockSchema = z.object({
  type: z.literal('scripts'),
  id: z.string(),
  title: z.string().optional(),
  scripts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    target: z.string(),
    content: z.string(),
    context: z.string().optional(),
  })),
})

const FrameworkIntroBlockSchema = z.object({
  type: z.literal('framework_intro'),
  frameworkCode: z.string(),
  title: z.string(),
  description: z.string(),
  letters: z.array(z.object({
    letter: z.string(),
    meaning: z.string(),
  })),
})

const FrameworkLetterBlockSchema = z.object({
  type: z.literal('framework_letter'),
  letter: z.string(),
  title: z.string(),
  content: z.string(),
  image: z.string().optional(),
})

const CTABlockSchema = z.object({
  type: z.literal('cta'),
  title: z.string(),
  text: z.string(),
  variant: z.enum(['primary', 'secondary', 'emphasis']).optional(),
})

const ButtonBlockSchema = z.object({
  type: z.literal('button'),
  text: z.string(),
  href: z.string().optional(),
  action: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline']).optional(),
})

const ConditionalBlockSchema: z.ZodType<any> = z.lazy(() => z.object({
  type: z.literal('conditional'),
  condition: z.object({
    promptId: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in_range']),
    value: z.any(),
  }),
  blocks: z.array(BlockSchema),
}))

const VariableBlockSchema = z.object({
  type: z.literal('variable'),
  template: z.string(),
  variables: z.record(z.string(), z.unknown()),
})

const BlockSchema: z.ZodType<any> = z.union([
  HeadingBlockSchema,
  ParagraphBlockSchema,
  StoryBlockSchema,
  QuoteBlockSchema,
  DividerBlockSchema,
  ImageBlockSchema,
  CalloutBlockSchema,
  ListBlockSchema,
  PromptBlockSchema,
  ScaleQuestionsBlockSchema,
  YesNoCheckBlockSchema,
  TaskPlanBlockSchema,
  ChecklistBlockSchema,
  ScriptsBlockSchema,
  FrameworkIntroBlockSchema,
  FrameworkLetterBlockSchema,
  CTABlockSchema,
  ButtonBlockSchema,
  ConditionalBlockSchema,
  VariableBlockSchema,
])

export function validateBlocks(content: unknown): { valid: boolean; errors: string[] } {
  if (!Array.isArray(content)) {
    return { valid: false, errors: ['Content must be an array'] }
  }

  const errors: string[] = []
  
  for (let i = 0; i < content.length; i++) {
    const result = BlockSchema.safeParse(content[i])
    if (!result.success) {
      const blockType = (content[i] as any)?.type || 'unknown'
      const zodErrors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      )
      errors.push(`Block ${i} (${blockType}): ${zodErrors.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
