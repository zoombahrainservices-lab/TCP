import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars when running this script directly (tsx / node)
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local before running this script.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateSparkFramework() {
  console.log('🚀 Starting SPARK framework migration...');
  
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id')
    .eq('chapter_number', 1)
    .single();
  
  if (chapterError || !chapter) {
    console.error('❌ Chapter 1 not found:', chapterError);
    return;
  }
  
  console.log('✅ Found Chapter 1:', chapter.id);
  
  const { data: step, error: stepError } = await supabase
    .from('chapter_steps')
    .select('id')
    .eq('chapter_id', chapter.id)
    .eq('step_type', 'framework')
    .single();
  
  if (stepError || !step) {
    console.error('❌ Framework step not found:', stepError);
    return;
  }
  
  console.log('✅ Found framework step:', step.id);
  
  const { error: deleteError } = await supabase
    .from('step_pages')
    .delete()
    .eq('step_id', step.id);
  
  if (deleteError) {
    console.error('❌ Error deleting existing pages:', deleteError);
  } else {
    console.log('✅ Deleted existing framework pages');
  }
  
  const pages = [
    {
      slug: 'spark-intro',
      title: 'The SPARK Framework',
      order_index: 0,
      estimated_minutes: 5,
      xp_award: 30,
      content: [{
        type: 'framework_intro',
        frameworkCode: 'SPARK',
        title: 'The SPARK Framework',
        description: 'Five steps to reclaim your attention and rebuild your focus.',
        letters: [
          { letter: 'S', meaning: 'Surface the Pattern' },
          { letter: 'P', meaning: 'Pinpoint the Why' },
          { letter: 'A', meaning: 'Anchor to Identity' },
          { letter: 'R', meaning: 'Rebuild with Micro-Commitments' },
          { letter: 'K', meaning: 'Kindle Community' },
        ],
      }],
    },
    {
      slug: 'spark-s',
      title: 'S — Surface the Pattern',
      order_index: 1,
      estimated_minutes: 5,
      xp_award: 30,
      content: [
        {
          type: 'framework_letter',
          letter: 'S',
          title: 'S — Surface the Pattern',
          content: 'Tom\'s first step was admitting the truth: his phone wasn\'t just a tool anymore—it had become his default escape.\n\nEvery time he felt bored, anxious, or uncertain, his thumb moved to the screen. It was automatic. Invisible. And it was costing him his focus, his sleep, and his sense of control.\n\nThis is the first step of SPARK: Surface the Pattern. You can\'t change what you can\'t see.',
        },
      ],
    },
    {
      slug: 'spark-s-turn',
      title: 'Your Turn',
      order_index: 2,
      estimated_minutes: 3,
      xp_award: 30,
      content: [
        {
          type: 'heading',
          level: 2,
          text: 'Your Turn',
        },
        {
          type: 'prompt',
          id: 'ch1_spark_s_pattern',
          label: 'What pattern do you notice in your own phone use?',
          input: 'textarea',
          placeholder: 'Describe when and why you reach for your phone...',
          required: true,
        },
      ],
    },
    {
      slug: 'spark-p',
      title: 'P — Pinpoint the Why',
      order_index: 3,
      estimated_minutes: 5,
      xp_award: 30,
      content: [
        {
          type: 'framework_letter',
          letter: 'P',
          title: 'P — Pinpoint the Why',
          content: 'Tom realized his phone wasn\'t the problem—it was the solution his brain had chosen for a deeper need.\n\nHe was lonely. Anxious about college. Avoiding hard conversations. The phone was just the escape route.\n\nThis is Pinpoint the Why: Understanding what drives the behavior gives you leverage to change it.',
        },
      ],
    },
    {
      slug: 'spark-p-turn',
      title: 'Your Turn',
      order_index: 4,
      estimated_minutes: 3,
      xp_award: 30,
      content: [
        {
          type: 'heading',
          level: 2,
          text: 'Your Turn',
        },
        {
          type: 'prompt',
          id: 'ch1_spark_p_why',
          label: 'What deeper need might your phone use be meeting?',
          input: 'textarea',
          placeholder: 'Think about what you might be avoiding or seeking...',
          required: true,
        },
      ],
    },
    {
      slug: 'spark-a',
      title: 'A — Anchor to Identity',
      order_index: 5,
      estimated_minutes: 5,
      xp_award: 30,
      content: [
        {
          type: 'framework_letter',
          letter: 'A',
          title: 'A — Anchor to Identity',
          content: 'Tom started asking himself: "What would the person I want to be do right now?"\n\nNot "the version of me who scrolls for hours," but the Tom who was present, focused, and connected to real people.\n\nThis is Anchor to Identity: Behavior change sticks when it\'s tied to who you want to become.',
        },
      ],
    },
    {
      slug: 'spark-a-turn',
      title: 'Your Turn',
      order_index: 6,
      estimated_minutes: 3,
      xp_award: 30,
      content: [
        {
          type: 'heading',
          level: 2,
          text: 'Your Turn',
        },
        {
          type: 'prompt',
          id: 'ch1_spark_a_identity',
          label: 'Who do you want to be when it comes to technology use?',
          input: 'textarea',
          placeholder: 'Describe the version of yourself you want to become...',
          required: true,
        },
      ],
    },
    {
      slug: 'spark-r',
      title: 'R — Rebuild with Micro-Commitments',
      order_index: 7,
      estimated_minutes: 5,
      xp_award: 30,
      content: [
        {
          type: 'framework_letter',
          letter: 'R',
          title: 'R — Rebuild with Micro-Commitments',
          content: 'Tom didn\'t try to quit cold turkey. Instead, he started small:\n\n• Phone off during dinner\n• No scrolling before breakfast\n• One real conversation per day\n\nThis is Rebuild with Micro-Commitments: Tiny, consistent actions compound into lasting change.',
        },
      ],
    },
    {
      slug: 'spark-r-turn',
      title: 'Your Turn',
      order_index: 8,
      estimated_minutes: 3,
      xp_award: 30,
      content: [
        {
          type: 'heading',
          level: 2,
          text: 'Your Turn',
        },
        {
          type: 'prompt',
          id: 'ch1_spark_r_commitment',
          label: 'What\'s one small change you could start with today?',
          input: 'textarea',
          placeholder: 'Pick something small and specific...',
          required: true,
        },
      ],
    },
    {
      slug: 'spark-k',
      title: 'K — Kindle Community',
      order_index: 9,
      estimated_minutes: 5,
      xp_award: 30,
      content: [
        {
          type: 'framework_letter',
          letter: 'K',
          title: 'K — Kindle Community',
          content: 'Tom\'s biggest breakthrough came when he joined a group of friends trying to do the same thing.\n\nThey checked in weekly. Celebrated small wins. Called each other out when they slipped. The accountability made all the difference.\n\nThis is Kindle Community: You don\'t have to do this alone. In fact, you shouldn\'t.',
        },
      ],
    },
    {
      slug: 'spark-k-turn',
      title: 'Your Turn',
      order_index: 10,
      estimated_minutes: 3,
      xp_award: 30,
      content: [
        {
          type: 'heading',
          level: 2,
          text: 'Your Turn',
        },
        {
          type: 'prompt',
          id: 'ch1_spark_k_community',
          label: 'Who could you share this journey with?',
          input: 'textarea',
          placeholder: 'Think of someone who might join you or hold you accountable...',
          required: true,
        },
      ],
    },
  ];
  
  console.log(`📝 Creating ${pages.length} SPARK framework pages...`);
  
  for (const page of pages) {
    const { error: insertError } = await supabase
      .from('step_pages')
      .insert({
        step_id: step.id,
        slug: page.slug,
        title: page.title,
        order_index: page.order_index,
        estimated_minutes: page.estimated_minutes,
        xp_award: page.xp_award,
        content: page.content,
      });
    
    if (insertError) {
      console.error(`❌ Error creating page ${page.slug}:`, insertError);
    } else {
      console.log(`✅ Created page: ${page.slug}`);
    }
  }
  
  console.log('🎉 SPARK framework migration complete!');
}

migrateSparkFramework()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
