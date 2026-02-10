// Complete Chapter 1 Content Migration
// This script reverse-engineers ALL original Chapter 1 content and migrates it to DB

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================
// FRAMEWORK - SPARK (7 screens)
// ============================================

const ch1FrameworkIntroBlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/spark.webp',
    alt: 'SPARK framework',
  },
  {
    type: 'heading',
    level: 1,
    text: 'THE SPARK FRAMEWORK',
  },
  {
    type: 'paragraph',
    text: 'Tom used a system called SPARK—five steps that actually work:',
  },
]

// S — SURFACE the Pattern
const ch1FrameworkSBlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/s.webp',
    alt: 'Surface the Pattern',
  },
  {
    type: 'heading',
    level: 2,
    text: 'S — SURFACE the Pattern',
  },
  {
    type: 'story',
    text: `Tom tracked phone usage for one week: 6.5 hours daily. That's 195 hours monthly on his phone vs. 2 hours practicing.

"Almost 200 hours scrolling. Two hours on what I care about. That's not who I want to be."`,
  },
];

const ch1FrameworkSYourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_framework_s_surface',
    label: 'YOUR TURN',
    description: 'Settings → Screen Time (iPhone) or Digital Wellbeing (Android). Look at your daily average. Don\'t judge. Just look.',
    input: 'textarea',
    placeholder: 'What patterns do you notice?',
    required: false,
  },
];

// P — PINPOINT the Why
const ch1FrameworkPBlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/p.webp',
    alt: 'Pinpoint the Why',
  },
  {
    type: 'heading',
    level: 2,
    text: 'P — PINPOINT the Why',
  },
  {
    type: 'story',
    text: `Tom's dad asked: "Why'd you stop caring about speaking?"

After silence: "What if I'm not actually that good? What if I disappoint everyone? At least on my phone, I don't have to find out."

The phone was escape from performance anxiety.`,
  },
];

const ch1FrameworkPYourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_framework_p_pinpoint',
    label: 'YOUR TURN',
    description: '"When I reach for my phone, I\'m usually avoiding feeling..."',
    input: 'textarea',
    placeholder: 'Complete this sentence honestly',
    required: false,
  },
];

// A — ANCHOR to Identity
const ch1FrameworkABlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/a.webp',
    alt: 'Anchor to Identity',
  },
  {
    type: 'heading',
    level: 2,
    text: 'A — ANCHOR to Identity',
  },
  {
    type: 'story',
    text: `Stanford research: Identity-based motivation is 3x more effective than goals.

Tom wrote: "I am a storyteller who makes people feel less alone."

Not "I want to be." "I AM."

Stuck it on his mirror. Read it every morning. Sounds corny. Worked.`,
  },
];

const ch1FrameworkAYourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_framework_a_anchor',
    label: 'YOUR TURN',
    description: '"I am a [identity] who [impact]." Write it somewhere visible.',
    input: 'text',
    placeholder: 'Example: I am an artist who makes people see beauty in everyday things',
    required: false,
  },
];

// R — REBUILD with Micro-Commitments
const ch1FrameworkRBlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/r.webp',
    alt: 'Rebuild with Micro-Commitments',
  },
  {
    type: 'heading',
    level: 2,
    text: 'R — REBUILD with Micro-Commitments',
  },
  {
    type: 'story',
    text: `Tom started with five minutes, three times that week. That's it.

Week 1: 5 minutes, 3 days
Week 2: 10 minutes, 4 days
Week 3: Watch open mic (don't perform)
Week 4: One story at family dinner

Stanford found "tiny habits" are 400% more likely to stick than big goals.`,
  },
];

const ch1FrameworkRYourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_framework_r_rebuild',
    label: 'YOUR TURN',
    description: 'Pick ONE thing. 5–10 minutes max. Three times this week.',
    input: 'textarea',
    placeholder: 'What small thing will you commit to?',
    required: false,
  },
];

// Day 23 story
const ch1FrameworkDay23Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/day23.webp',
    alt: 'Day 23 – He Almost Quit',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Day 23—He Almost Quit',
  },
  {
    type: 'story',
    text: `Terrible day. Failed math test. Fight with his best friend. Came home exhausted.

Phone right there. Just one video.

Unlocked it. YouTube loaded. Finger hovering.

Then—his lock screen. Photo of himself at eleven, mid-speech, lit up.

He closed YouTube. Voice-recorded a story about his day. Added link #24 to his paper chain.

Almost relapsing ≠ relapsing.`,
  },
]

const ch1FrameworkKBlocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/frameworks/k.webp',
    alt: 'Kindle Community',
  },
  {
    type: 'heading',
    level: 2,
    text: 'K — KINDLE Community',
  },
  {
    type: 'story',
    text: `Tom reconnected with debate team. Asked his cousin Alex to be his accountability partner. Started attending open mics.

Being around people who cared reminded his brain why this mattered.`,
  },
  {
    type: 'prompt',
    id: 'ch1_framework_k_kindle',
    label: 'YOUR TURN',
    description: 'Text ONE person right now. Tell them what you\'re working on. Ask for weekly check-ins.',
    input: 'text',
    placeholder: 'Who will you text?',
    required: false,
  },
]

const ch1FrameworkPages: Array<{
  slug: string
  title: string
  order_index: number
  content: any[]
}> = [
  {
    slug: 'spark-intro',
    title: 'The SPARK Framework',
    order_index: 1,
    content: ch1FrameworkIntroBlocks,
  },
  {
    slug: 'spark-s',
    title: 'S — Surface the Pattern',
    order_index: 2,
    content: ch1FrameworkSBlocks,
  },
  {
    slug: 'spark-s-turn',
    title: 'Your Turn',
    order_index: 3,
    content: ch1FrameworkSYourTurnBlocks,
  },
  {
    slug: 'spark-p',
    title: 'P — Pinpoint the Why',
    order_index: 4,
    content: ch1FrameworkPBlocks,
  },
  {
    slug: 'spark-p-turn',
    title: 'Your Turn',
    order_index: 5,
    content: ch1FrameworkPYourTurnBlocks,
  },
  {
    slug: 'spark-a',
    title: 'A — Anchor to Identity',
    order_index: 6,
    content: ch1FrameworkABlocks,
  },
  {
    slug: 'spark-a-turn',
    title: 'Your Turn',
    order_index: 7,
    content: ch1FrameworkAYourTurnBlocks,
  },
  {
    slug: 'spark-r',
    title: 'R — Rebuild with Micro-Commitments',
    order_index: 8,
    content: ch1FrameworkRBlocks,
  },
  {
    slug: 'spark-r-turn',
    title: 'Your Turn',
    order_index: 9,
    content: ch1FrameworkRYourTurnBlocks,
  },
  {
    slug: 'spark-day23',
    title: 'Day 23—He Almost Quit',
    order_index: 10,
    content: ch1FrameworkDay23Blocks,
  },
  {
    slug: 'spark-k',
    title: 'K — Kindle Community',
    order_index: 11,
    content: ch1FrameworkKBlocks,
  },
]

// ============================================
// TECHNIQUES (4 techniques)
// ============================================

const ch1TechniquesIntroBlocks = [
  {
    type: 'heading',
    level: 1,
    text: 'PRACTICAL TECHNIQUES',
  },
  {
    type: 'paragraph',
    text: 'Four proven techniques Tom used to break the phone habit and rebuild his attention.',
  },
]

const ch1Technique1Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/technique/Substitution%20Game.webp',
    alt: 'Substitution Game technique',
  },
  {
    type: 'heading',
    level: 2,
    text: '#1: Substitution Game',
  },
  {
    type: 'story',
    text: `Tom's three moves when reaching for his phone:

1. Read one page from a great speech (pocket copy)
2. Do 20 push-ups (disrupts mental loops)
3. Voice-memo a story idea

Key: Easier than unlocking his phone.`,
  },
]

const ch1Technique1YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_technique_1_substitution',
    label: 'Pick three easy alternatives.',
    description: 'Write them in your notes app now.',
    input: 'textarea',
    placeholder: 'List your three alternatives',
    required: false,
  },
]

const ch1Technique2Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/technique/The%20Later%20Technique.webp',
    alt: 'The Later Technique',
  },
  {
    type: 'heading',
    level: 2,
    text: '#2: The "Later" Technique',
  },
  {
    type: 'story',
    text: `Not "I won't watch TikTok." Instead: "I can watch after dinner, but right now I'm choosing to practice."

Brain doesn't feel deprived with "later."`,
  },
]

const ch1Technique3Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/technique/Change%20Your%20Environment.webp',
    alt: 'Change Your Environment',
  },
  {
    type: 'heading',
    level: 2,
    text: '#3: Change Your Environment',
  },
  {
    type: 'story',
    text: `Tom's phone charged in the kitchen overnight. Speech notes where phone used to sit. Trophies on his desk.

Environmental changes reduce bad habits 80% without willpower.`,
  },
]

const ch1Technique3YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_technique_3_environment',
    label: 'Tonight—charge phone outside your bedroom.',
    description: 'Or pick another small environment change you will actually do.',
    input: 'text',
    placeholder: 'What environmental change will you make?',
    required: false,
  },
]

const ch1Technique4Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/technique/Visual%20Progress.webp',
    alt: 'Visual Progress technique',
  },
  {
    type: 'heading',
    level: 2,
    text: '#4: Visual Progress',
  },
  {
    type: 'story',
    text: `Tom made a paper chain. Every 10-minute practice = one link.

By day 30, it wrapped his room. Physical proof: "I'm someone who shows up."`,
  },
]

const ch1Technique4YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_technique_4_visual',
    label: 'Make progress visible.',
    description: "Paper chain, calendar X's, marble jar—choose one.",
    input: 'text',
    placeholder: 'What visual tracker will you use?',
    required: false,
  },
]

const ch1TechniquesPages: Array<{
  slug: string
  title: string
  order_index: number
  content: any[]
}> = [
  {
    slug: 'techniques-intro',
    title: 'Practical Techniques',
    order_index: 1,
    content: ch1TechniquesIntroBlocks,
  },
  {
    slug: 'technique-1',
    title: '#1: Substitution Game',
    order_index: 2,
    content: ch1Technique1Blocks,
  },
  {
    slug: 'technique-1-turn',
    title: 'Your Turn',
    order_index: 3,
    content: ch1Technique1YourTurnBlocks,
  },
  {
    slug: 'technique-2',
    title: '#2: The "Later" Technique',
    order_index: 4,
    content: ch1Technique2Blocks,
  },
  {
    slug: 'technique-3',
    title: '#3: Change Your Environment',
    order_index: 5,
    content: ch1Technique3Blocks,
  },
  {
    slug: 'technique-3-turn',
    title: 'Your Turn',
    order_index: 6,
    content: ch1Technique3YourTurnBlocks,
  },
  {
    slug: 'technique-4',
    title: '#4: Visual Progress',
    order_index: 7,
    content: ch1Technique4Blocks,
  },
  {
    slug: 'technique-4-turn',
    title: 'Your Turn',
    order_index: 8,
    content: ch1Technique4YourTurnBlocks,
  },
]

// ============================================
// FOLLOW-THROUGH (5 screens)
// ============================================

const ch1FollowThrough1Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/follow%20through/m1.webp?v=2',
    alt: 'Your Moment',
  },
  {
    type: 'heading',
    level: 1,
    text: 'YOUR MOMENT',
  },
  {
    type: 'story',
    text: `Tom's story isn't about superhuman willpower. It's about one Tuesday when he decided who he'd been wasn't who he wanted to become.

Some of you will bookmark this and come back when ready. That's fine.

But if you're feeling that pull right now—that voice saying "maybe I could actually do this"—don't ignore it.`,
  },
  {
    type: 'paragraph',
    text: 'Pick ONE thing:',
  },
  {
    type: 'paragraph',
    text: `• Write your identity statement in phone notes
• Text one person for weekly check-ins
• Delete one app that takes more than it gives`,
  },
  {
    type: 'paragraph',
    text: `Not all three. Just one.

The rest of this book will be here. But if you're ready now? Move. Don't let this feeling fade.

In six months, you'll either wish you'd started today, or you'll be glad you did. Your call.`,
  },
]

const ch1FollowThrough1YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_followthrough_1_pick_one',
    label: 'Pick one thing. Start now.',
    description: '',
    input: 'text',
    placeholder: 'Which one will you do right now?',
    required: false,
  },
]

const ch1FollowThrough2Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/follow%20through/realconversation.webp?v=2',
    alt: 'Real Conversations',
  },
  {
    type: 'heading',
    level: 2,
    text: 'BRING OTHERS IN — Real Conversations',
  },
  {
    type: 'paragraph',
    text: 'To Parents:',
  },
  {
    type: 'story',
    text: '"My phone\'s messing with [thing I care about]. I want to fix it but need help. Can we set rules together? Phone in kitchen at night, phone-free study time? I know I fought you before, but this time it\'s my idea."',
  },
  {
    type: 'paragraph',
    text: 'To Friends:',
  },
  {
    type: 'story',
    text: '"Gonna be less online. Getting back into [your thing]. Still wanna hang—maybe [non-screen activity]? Call me out if I\'m zombie-scrolling?"',
  },
  {
    type: 'paragraph',
    text: 'To Yourself:',
  },
  {
    type: 'story',
    text: '"This feeling passes in 5 minutes. What would future-me do right now?"',
  },
]

const ch1FollowThrough2YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_followthrough_2_conversations',
    label: 'Don\'t do this alone.',
    description: 'Use these scripts when you\'re ready.',
    input: 'textarea',
    placeholder: 'Which conversation will you have first?',
    required: false,
  },
]

const ch1FollowThrough3Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/follow%20through/cb.webp?v=2',
    alt: 'The Comeback',
  },
  {
    type: 'heading',
    level: 2,
    text: 'THE COMEBACK',
  },
  {
    type: 'story',
    text: `Six months later, same competition. Same venue.

Tom walked on stage, phone forgotten in his pocket.

"I want to tell you about the day I chose a screen over my dreams, and what happened when I chose my dreams back."

Seven minutes of truth. The shame. The hollow hours. The fear. The small daily choices.

Three seconds of silence. Then applause.

Second place. But more importantly—proof he could come back.

Tom today at sixteen: Volunteers as peer mentor. Chain hit 247 links. Placed third at states.

"My phone's a tool now, not my personality. I use it. It doesn't use me."

Three months later, fourteen-year-old Layla found him: "That chain thing—did it work?"

Tom showed her everything. That night he realized: his recovery gave him new purpose. The student became the teacher.`,
  },
]

const ch1FollowThrough4Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/follow%20through/When%20you%20mess%20up.webp?v=2',
    alt: 'When You Mess Up',
  },
  {
    type: 'heading',
    level: 2,
    text: 'WHEN YOU MESS UP — Recovery Mode',
  },
  {
    type: 'paragraph',
    text: '24-Hour Rule:',
  },
  {
    type: 'paragraph',
    text: `1. Stop spiral NOW
2. Ask: What triggered this?
3. Fix the leak in your system
4. Get back in within 24 hours
5. Tell your accountability person`,
  },
  {
    type: 'paragraph',
    text: 'Tom broke his streak twice. He still made it.',
  },
]

const ch1FollowThrough4YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_followthrough_3_recovery',
    label: 'When you slip, use the 24-Hour Rule.',
    description: 'Then get back in.',
    input: 'text',
    placeholder: 'Commit to the 24-Hour Rule',
    required: false,
  },
]

const ch1FollowThrough5Blocks = [
  {
    type: 'image',
    src: '/slider-work-on-quizz/chapter1/follow%20through/90days.webp?v=2',
    alt: '90-Day Plan',
  },
  {
    type: 'heading',
    level: 2,
    text: 'YOUR PATH — 90-Day Plan',
  },
  {
    type: 'paragraph',
    text: 'WEEKS 1–3: Awareness',
  },
  {
    type: 'paragraph',
    text: `• Week 1: Track usage. Don't change yet
• Week 2: Write identity statement. Make it visible
• Week 3: Pick micro-commitment. Tell someone`,
  },
  {
    type: 'paragraph',
    text: 'WEEKS 4–9: Build',
  },
  {
    type: 'paragraph',
    text: `• Use substitution moves
• Start visual tracker
• Find accountability partner
• Increase commitment gradually (add 5 min every 2 weeks)`,
  },
  {
    type: 'paragraph',
    text: 'WEEKS 10–13: Level Up',
  },
  {
    type: 'paragraph',
    text: `• Reconnect with community
• Share your story
• Set public goal
• Teach someone else`,
  },
]

const ch1FollowThrough5YourTurnBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'YOUR TURN',
  },
  {
    type: 'prompt',
    id: 'ch1_followthrough_4_plan',
    label: 'Where this goes over 90 days.',
    description: 'Start with Week 1.',
    input: 'textarea',
    placeholder: 'What will you do in Week 1?',
    required: false,
  },
]

const ch1FollowThroughPages: Array<{
  slug: string
  title: string
  order_index: number
  content: any[]
}> = [
  {
    slug: 'followthrough-1',
    title: 'Your Moment',
    order_index: 1,
    content: ch1FollowThrough1Blocks,
  },
  {
    slug: 'followthrough-1-turn',
    title: 'Your Turn',
    order_index: 2,
    content: ch1FollowThrough1YourTurnBlocks,
  },
  {
    slug: 'followthrough-2',
    title: 'Bring Others In',
    order_index: 3,
    content: ch1FollowThrough2Blocks,
  },
  {
    slug: 'followthrough-2-turn',
    title: 'Your Turn',
    order_index: 4,
    content: ch1FollowThrough2YourTurnBlocks,
  },
  {
    slug: 'followthrough-3',
    title: 'The Comeback',
    order_index: 5,
    content: ch1FollowThrough3Blocks,
  },
  {
    slug: 'followthrough-4',
    title: 'When You Mess Up',
    order_index: 6,
    content: ch1FollowThrough4Blocks,
  },
  {
    slug: 'followthrough-4-turn',
    title: 'Your Turn',
    order_index: 7,
    content: ch1FollowThrough4YourTurnBlocks,
  },
  {
    slug: 'followthrough-5',
    title: '90-Day Plan',
    order_index: 8,
    content: ch1FollowThrough5Blocks,
  },
  {
    slug: 'followthrough-5-turn',
    title: 'Your Turn',
    order_index: 9,
    content: ch1FollowThrough5YourTurnBlocks,
  },
]

// ============================================
// MIGRATION FUNCTION
// ============================================

async function migrateChapter1Complete() {
  console.log('\n🔥 COMPLETE CHAPTER 1 MIGRATION — Reverse Engineered\n')

  try {
    // Get Chapter 1
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('chapter_number', 1)
      .single()

    if (chapterError || !chapter) {
      console.error('❌ Chapter 1 not found:', chapterError)
      return false
    }

    // Helper to get a step by type
    const getStepByType = async (stepType: string) => {
      const { data: step, error: stepError } = await supabase
        .from('chapter_steps')
        .select('id, step_type, slug')
        .eq('chapter_id', chapter.id)
        .eq('step_type', stepType)
        .single()

      if (stepError || !step) {
        console.error(`❌ Step not found for type "${stepType}":`, stepError)
        return null
      }

      return step
    }

    // FRAMEWORK — 7 SPARK pages
    console.log('\n📚 Migrating Framework (SPARK)...')
    const frameworkStep = await getStepByType('framework')
    if (frameworkStep) {
      await supabase.from('step_pages').delete().eq('step_id', frameworkStep.id)
      for (const page of ch1FrameworkPages) {
        const { error: frameworkPageError } = await supabase
          .from('step_pages')
          .insert({
            step_id: frameworkStep.id,
            slug: page.slug,
            title: page.title,
            order_index: page.order_index,
            estimated_minutes: 3,
            xp_award: page.order_index === ch1FrameworkPages.length ? 40 : 0,
            content: page.content,
          })
        if (frameworkPageError)
          console.error(
            `❌ Chapter 1 Framework "${page.slug}":`,
            frameworkPageError
          )
        else console.log(`✅ Framework page ${page.order_index}: ${page.title}`)
      }
    }

    // TECHNIQUES — 5 pages
    console.log('\n🛠️  Migrating Techniques...')
    const techniquesStep = await getStepByType('techniques')
    if (techniquesStep) {
      await supabase.from('step_pages').delete().eq('step_id', techniquesStep.id)
      for (const page of ch1TechniquesPages) {
        const { error: techniquePageError } = await supabase
          .from('step_pages')
          .insert({
            step_id: techniquesStep.id,
            slug: page.slug,
            title: page.title,
            order_index: page.order_index,
            estimated_minutes: 3,
            xp_award: page.order_index === ch1TechniquesPages.length ? 30 : 0,
            content: page.content,
          })
        if (techniquePageError)
          console.error(
            `❌ Chapter 1 Techniques "${page.slug}":`,
            techniquePageError
          )
        else console.log(`✅ Techniques page ${page.order_index}: ${page.title}`)
      }
    }

    // FOLLOW-THROUGH — 5 pages
    console.log('\n🚀 Migrating Follow-Through...')
    const followThroughStep = await getStepByType('follow_through')
    if (followThroughStep) {
      await supabase
        .from('step_pages')
        .delete()
        .eq('step_id', followThroughStep.id)
      for (const page of ch1FollowThroughPages) {
        const { error: followThroughPageError } = await supabase
          .from('step_pages')
          .insert({
            step_id: followThroughStep.id,
            slug: page.slug,
            title: page.title,
            order_index: page.order_index,
            estimated_minutes: 4,
            xp_award:
              page.order_index === ch1FollowThroughPages.length ? 50 : 0,
            content: page.content,
          })
        if (followThroughPageError)
          console.error(
            `❌ Chapter 1 Follow-Through "${page.slug}":`,
            followThroughPageError
          )
        else
          console.log(
            `✅ Follow-Through page ${page.order_index}: ${page.title}`
          )
      }
    }

    console.log(
      '\n✅ COMPLETE CHAPTER 1 MIGRATION FINISHED!\n'
    )
    console.log('📊 Summary:')
    console.log(`   Framework: ${ch1FrameworkPages.length} pages (with separate "Your Turn" pages)`)
    console.log(`   Techniques: ${ch1TechniquesPages.length} pages (with separate "Your Turn" pages)`)
    console.log(`   Follow-Through: ${ch1FollowThroughPages.length} pages (with separate "Your Turn" pages)`)
    console.log('\n🎯 Chapter 1 now has clean "Your Turn" pages like Chapter 2!')

    return true
  } catch (error) {
    console.error('❌ Migration error:', error)
    return false
  }
}

// Run migration
migrateChapter1Complete()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
