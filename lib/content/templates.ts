/**
 * Pre-built content templates for quick page creation
 */

export interface ContentTemplate {
  key: string
  name: string
  description: string
  category: 'your-turn' | 'reading' | 'framework' | 'assessment'
  blocks: any[]
}

export const contentTemplates: ContentTemplate[] = [
  // Your Turn Templates
  {
    key: 'simple_reflection',
    name: 'Simple Reflection',
    description: 'Single prompt with text response',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn' },
      { 
        type: 'paragraph', 
        text: 'Take a moment to reflect on what you just learned. Write down your thoughts and how you might apply this in your own life.' 
      },
      { 
        type: 'prompt', 
        id: 'reflection', 
        label: 'Your reflection', 
        input: 'textarea',
        placeholder: 'Write your thoughts here...'
      }
    ]
  },
  
  {
    key: 'scale_assessment',
    name: 'Scale Assessment',
    description: 'Multiple rating questions for self-assessment',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Self-Assessment' },
      { 
        type: 'paragraph', 
        text: 'Rate yourself on the following statements. Be honest - this helps you track your progress.' 
      },
      { 
        type: 'scale_questions',
        questions: [
          {
            text: 'I understand the key concepts from this section',
            min: 1,
            max: 5,
            minLabel: 'Not at all',
            maxLabel: 'Completely'
          },
          {
            text: 'I can apply this in real situations',
            min: 1,
            max: 5,
            minLabel: 'Not confident',
            maxLabel: 'Very confident'
          }
        ]
      }
    ]
  },
  
  {
    key: 'action_plan',
    name: 'Action Plan',
    description: 'Checklist with task planning',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Action Plan' },
      { 
        type: 'paragraph', 
        text: 'Create a concrete plan to practice what you learned. Check off each item as you complete it.' 
      },
      { 
        type: 'checklist',
        items: [
          { text: 'Identify one situation to practice this skill', checked: false },
          { text: 'Plan when and where to practice', checked: false },
          { text: 'Practice the skill', checked: false },
          { text: 'Reflect on how it went', checked: false }
        ]
      },
      { 
        type: 'prompt', 
        id: 'action_notes', 
        label: 'Notes on your action plan', 
        input: 'textarea',
        placeholder: 'What specific actions will you take?'
      }
    ]
  },
  
  {
    key: 'yes_no_baseline',
    name: 'Yes/No Baseline',
    description: 'Yes/no statements for baseline assessment',
    category: 'assessment',
    blocks: [
      { type: 'heading', level: 2, text: 'Baseline Assessment' },
      { 
        type: 'callout',
        variant: 'tip',
        text: 'Answer honestly. This helps you see your progress later. There are no wrong answers!'
      },
      { 
        type: 'yes_no_check',
        statements: [
          { text: 'I feel confident in my communication skills', value: false },
          { text: 'I can handle difficult conversations effectively', value: false },
          { text: 'I understand how to read social cues', value: false }
        ]
      }
    ]
  },
  
  {
    key: 'story_with_reflection',
    name: 'Story with Reflection',
    description: 'Narrative example followed by reflection prompts',
    category: 'reading',
    blocks: [
      { type: 'heading', level: 2, text: 'Real-World Example' },
      { 
        type: 'story',
        text: 'Sarah was nervous about the presentation. She took a deep breath and remembered what she learned...',
        character: 'Sarah'
      },
      { type: 'divider' },
      { type: 'heading', level: 3, text: 'Think About It' },
      { 
        type: 'prompt', 
        id: 'story_reflection', 
        label: 'How would you handle this situation?', 
        input: 'textarea'
      }
    ]
  },
  
  {
    key: 'framework_intro',
    name: 'Framework Introduction',
    description: 'Structured framework explanation',
    category: 'framework',
    blocks: [
      { type: 'heading', level: 2, text: 'The Framework' },
      { 
        type: 'paragraph', 
        text: 'This framework will help you navigate complex communication situations with confidence.' 
      },
      { 
        type: 'callout',
        variant: 'science',
        text: 'Research shows that having a structured approach improves outcomes by 40%.'
      },
      { type: 'heading', level: 3, text: 'Key Components' },
      { 
        type: 'list',
        style: 'numbers',
        items: [
          'Observe the situation',
          'Identify the core issue',
          'Choose your approach',
          'Execute with confidence',
          'Reflect and adjust'
        ]
      }
    ]
  },
  
  {
    key: 'quick_tips',
    name: 'Quick Tips',
    description: 'Bullet list of actionable tips',
    category: 'reading',
    blocks: [
      { type: 'heading', level: 2, text: 'Quick Tips' },
      { 
        type: 'list',
        style: 'checkmarks',
        items: [
          'Start with active listening',
          'Ask clarifying questions',
          'Validate their perspective',
          'Share your own view clearly',
          'Work together on solutions'
        ]
      }
    ]
  },
  
  {
    key: 'task_planner',
    name: 'Weekly Task Planner',
    description: 'Structured weekly practice plan',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Weekly Practice Plan' },
      { 
        type: 'paragraph', 
        text: 'Break down your practice into daily tasks. Small, consistent actions lead to big results.' 
      },
      { 
        type: 'task_plan',
        duration: 7,
        tasks: []
      }
    ]
  },

  // Additional Your Turn Templates
  {
    key: 'your_turn_reflection',
    name: 'Your Turn: Reflection',
    description: 'Deep reflection exercise with multiple prompts',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn: Reflection' },
      { 
        type: 'callout',
        variant: 'tip',
        text: 'Take 5-10 minutes to thoughtfully answer these questions. Your honest reflections will help you grow.'
      },
      { 
        type: 'prompt', 
        id: 'what_resonates', 
        label: 'What resonates with you most from this section?', 
        input: 'textarea',
        placeholder: 'Think about which concepts or ideas really stood out to you...'
      },
      { 
        type: 'prompt', 
        id: 'personal_connection', 
        label: 'How does this connect to your personal experience?', 
        input: 'textarea',
        placeholder: 'Share a time when you experienced something similar...'
      },
      { 
        type: 'prompt', 
        id: 'application', 
        label: 'How will you apply this in your life?', 
        input: 'textarea',
        placeholder: 'Be specific about when and where you\'ll practice this...'
      }
    ]
  },

  {
    key: 'your_turn_practice',
    name: 'Your Turn: Practice Exercise',
    description: 'Hands-on practice with guided steps',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn: Practice Exercise' },
      { 
        type: 'paragraph', 
        text: 'Now it\'s time to practice! Follow these steps and complete each task.' 
      },
      { 
        type: 'callout',
        variant: 'warning',
        text: 'Don\'t skip this! Active practice is the key to mastery.'
      },
      { 
        type: 'checklist',
        items: [
          { text: 'Read through the example scenario', checked: false },
          { text: 'Identify the key challenge', checked: false },
          { text: 'Apply the technique you learned', checked: false },
          { text: 'Write down what worked and what didn\'t', checked: false },
          { text: 'Plan how to improve next time', checked: false }
        ]
      },
      { 
        type: 'prompt', 
        id: 'practice_notes', 
        label: 'Practice Notes', 
        input: 'textarea',
        placeholder: 'What did you learn from this practice?'
      }
    ]
  },

  {
    key: 'your_turn_framework_application',
    name: 'Your Turn: Framework Application',
    description: 'Apply the framework to your own situation',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn: Apply the Framework' },
      { 
        type: 'paragraph', 
        text: 'Think of a real situation in your life where you can apply this framework. Work through each step below.' 
      },
      { 
        type: 'prompt', 
        id: 'situation', 
        label: 'Describe your situation', 
        input: 'textarea',
        placeholder: 'What challenge or opportunity are you facing?'
      },
      { 
        type: 'prompt', 
        id: 'step1', 
        label: 'Step 1: Observe', 
        input: 'textarea',
        placeholder: 'What do you notice about this situation?'
      },
      { 
        type: 'prompt', 
        id: 'step2', 
        label: 'Step 2: Analyze', 
        input: 'textarea',
        placeholder: 'What\'s really going on here?'
      },
      { 
        type: 'prompt', 
        id: 'step3', 
        label: 'Step 3: Act', 
        input: 'textarea',
        placeholder: 'What specific action will you take?'
      },
      { 
        type: 'prompt', 
        id: 'step4', 
        label: 'Step 4: Reflect', 
        input: 'textarea',
        placeholder: 'How will you know if it worked?'
      }
    ]
  },

  {
    key: 'your_turn_technique_practice',
    name: 'Your Turn: Technique Practice',
    description: 'Step-by-step technique practice guide',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn: Practice This Technique' },
      { 
        type: 'callout',
        variant: 'science',
        text: 'Research shows that deliberate practice with immediate feedback is the fastest way to improve.'
      },
      { 
        type: 'paragraph', 
        text: 'Follow this practice sequence to master the technique:' 
      },
      { 
        type: 'list',
        style: 'numbers',
        items: [
          'Find a quiet space where you can focus',
          'Review the technique steps',
          'Visualize yourself using it successfully',
          'Practice out loud or in writing',
          'Get feedback if possible',
          'Adjust and try again'
        ]
      },
      { 
        type: 'prompt', 
        id: 'practice_session', 
        label: 'Practice Session Log', 
        input: 'textarea',
        placeholder: 'What happened when you practiced? What will you do differently next time?'
      },
      { 
        type: 'scale_questions',
        questions: [
          {
            text: 'How confident do you feel using this technique?',
            min: 1,
            max: 5,
            minLabel: 'Not confident',
            maxLabel: 'Very confident'
          }
        ]
      }
    ]
  },

  {
    key: 'your_turn_action_plan',
    name: 'Your Turn: Action Plan',
    description: 'Create a concrete action plan with accountability',
    category: 'your-turn',
    blocks: [
      { type: 'heading', level: 2, text: 'Your Turn: Create Your Action Plan' },
      { 
        type: 'paragraph', 
        text: 'Turn your learning into action! A specific plan makes you 3x more likely to follow through.' 
      },
      { 
        type: 'prompt', 
        id: 'goal', 
        label: 'What specific goal do you want to achieve?', 
        input: 'text',
        placeholder: 'Be specific and measurable'
      },
      { 
        type: 'prompt', 
        id: 'when', 
        label: 'When will you do this?', 
        input: 'text',
        placeholder: 'Choose a specific day and time'
      },
      { 
        type: 'prompt', 
        id: 'where', 
        label: 'Where will you do this?', 
        input: 'text',
        placeholder: 'Choose a specific location'
      },
      { 
        type: 'prompt', 
        id: 'obstacles', 
        label: 'What obstacles might get in your way?', 
        input: 'textarea',
        placeholder: 'Think ahead about what could stop you'
      },
      { 
        type: 'prompt', 
        id: 'solutions', 
        label: 'How will you overcome these obstacles?', 
        input: 'textarea',
        placeholder: 'Have a backup plan ready'
      },
      { 
        type: 'prompt', 
        id: 'accountability', 
        label: 'Who will you tell about this commitment?', 
        input: 'text',
        placeholder: 'Accountability increases success rates'
      },
      { 
        type: 'callout',
        variant: 'tip',
        text: 'Pro tip: Set a reminder on your phone right now for when you plan to do this!'
      }
    ]
  }
]

export function getTemplateByKey(key: string): ContentTemplate | undefined {
  return contentTemplates.find(t => t.key === key)
}

export function getTemplatesByCategory(category: ContentTemplate['category']): ContentTemplate[] {
  return contentTemplates.filter(t => t.category === category)
}

export function applyTemplate(templateKey: string, customizations?: Record<string, any>): any[] {
  const template = getTemplateByKey(templateKey)
  if (!template) return []
  
  // Deep clone the blocks
  const blocks = JSON.parse(JSON.stringify(template.blocks))
  
  // Apply customizations if provided
  if (customizations) {
    blocks.forEach((block: any, index: number) => {
      if (customizations[index]) {
        Object.assign(block, customizations[index])
      }
    })
  }
  
  return blocks
}
