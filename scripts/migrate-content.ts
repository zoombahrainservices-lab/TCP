/**
 * Content Migration Script
 * Converts hardcoded chapter slides to JSON blocks in the database
 * 
 * Run with: npx tsx scripts/migrate-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// Chapter 1 Content
// ============================================

// Chapter 1 Self-Check (assessment): 2 pages (intro + scale questions)
const chapter1SelfCheckIntroBlocks = [
  { type: 'heading', level: 1, text: 'YOUR SELF-CHECK' },
  { type: 'heading', level: 2, text: 'Why This Baseline Matters' },
  { 
    type: 'paragraph', 
    text: 'Before Tom could fix anything, he needed to know where he actually stood. Not where he thought he was. Where the data said he was.' 
  },
  { 
    type: 'paragraph', 
    text: 'This isn\'t a judgment. It\'s a snapshot. In 6 months, you\'ll take it again and see how far you\'ve come.' 
  },
  { 
    type: 'callout',
    variant: 'warning',
    title: 'Be honest',
    text: 'Nobody sees this but you. The more accurate you are now, the better your recovery plan will be.' 
  },
  { 
    type: 'callout',
    variant: 'info',
    title: 'How it works',
    text: 'You\'ll rate 7 statements from 1 to 7. Takes 2 minutes. Your score tells you which zone you\'re in.' 
  }
];

const chapter1SelfCheckScaleBlocks = [
  {
    type: 'scale_questions',
    id: 'ch1_self_check',
    title: 'Chapter 1 Self-Check',
    description: 'Rate each statement from 1 to 7. Be honest—only you see this.',
    questions: [
      { id: 'ch1_q1_phone_distraction', text: 'How often I grab phone when working', lowLabel: 'Rarely', highLabel: 'Constantly' },
      { id: 'ch1_q2_scrolling_recall', text: 'Remember yesterday\'s scrolling', lowLabel: 'Yes', highLabel: 'Barely' },
      { id: 'ch1_q3_post_session_feeling', text: 'Feel after phone session', lowLabel: 'Energized', highLabel: 'Empty' },
      { id: 'ch1_q4_passion_time', text: 'Time on passion this year', lowLabel: 'More', highLabel: 'Abandoned' },
      { id: 'ch1_q5_phone_urge_time', text: 'Time before phone urge', lowLabel: '30+ min', highLabel: 'Under 5' },
      { id: 'ch1_q6_avoidance', text: 'Use phone to avoid feelings', lowLabel: 'Rarely', highLabel: 'Always' },
      { id: 'ch1_q7_dependency', text: 'Phone vanished 24hrs', lowLabel: 'Relieved', highLabel: 'Panicked' }
    ],
    scale: { min: 1, max: 7, minLabel: 'Low', maxLabel: 'High' },
    scoring: {
      bands: [
        { range: [43, 49], label: 'Critical', description: 'Talk to a school counselor or trusted adult. This is affecting your life significantly.', color: 'red' },
        { range: [29, 42], label: 'Tom\'s Starting Point', description: 'Recovery is possible. Tom started here and made it back. So can you.', color: 'orange' },
        { range: [15, 28], label: 'Danger Zone', description: 'Start SPARK now. You\'re at risk of losing control over important things.', color: 'yellow' },
        { range: [7, 14], label: 'You\'re Good', description: 'You have a healthy relationship with your phone. Keep it up!', color: 'green' }
      ]
    }
  }
];

const chapter1SelfCheckPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'assessment-intro', title: 'Your Self-Check', order_index: 1, content: chapter1SelfCheckIntroBlocks },
  { slug: 'assessment-questions', title: 'Rate Yourself', order_index: 2, content: chapter1SelfCheckScaleBlocks },
];

// Chapter 1 Reading: Split into 6 pages to match the legacy chunk-by-chunk reader
// Page 1: Title slide (will be rendered as hero by DynamicChapterReadingClient)
// Pages 2-6: Content slides (moment, rise, what happened, science, truth)

const chapter1ReadingTitlePage = [
  { type: 'title_slide', chapterNumber: 1, title: 'FROM STAGE STAR TO SILENT STRUGGLES' }
];

const chapter1ReadingPage1Blocks = [
  {
    type: 'story',
    text: `Tom stood in the auditorium doorway, phone glowing, thumb scrolling through TikTok. Applause for another speaker leaked through the doors—a sound he used to live for, now just background noise.

"Tom Hammond? Is Tom here tonight?"

His mom grabbed his arm. "Tom! They're calling you!"

He shrugged her off. "Just one more video."

By the time his dad grabbed the phone, the organizers had moved on. Tom, fourteen, had just missed his slot at regionals—the same competition where he'd won first place eighteen months ago.

His mom's face: pure disappointment.`
  }
];

const chapter1ReadingPage2Blocks = [
  {
    type: 'story',
    text: `Rewind three years. Tom was different.

At eleven, this sixth-grader could hold 200 people captive with just his voice. While friends ground Fortnite after school, Tom practiced speeches for two hours in front of his mirror.

By seventh grade, Tom was that kid—the one who MCed assemblies, the one everyone's parents wanted at gatherings. After winning regionals at twelve, his debate coach said: "You're going to do something big someday."

Tom believed him.`
  }
];

const chapter1ReadingPage3Blocks = [
  {
    type: 'story',
    text: `Here's what nobody tells you: what happened to Tom is happening to everyone your age. And it's not your fault.

Dr. Anna Lembke (legit psychiatrist) wrote Dopamine Nation explaining how TikTok, Instagram, and YouTube hijack your brain. Every scroll gives you dopamine—the same chemical released when you eat your favorite food or get a text from your crush.`
  }
];

const chapter1ReadingPage4Blocks = [
  {
    type: 'story',
    text: `Stanford tracked 2,500 teenagers for three years. Those spending 3+ hours daily on entertainment apps showed a 60% drop in passion activities. Brain scans revealed reduced activity in the prefrontal cortex—the part handling delayed gratification.

Tom's brain: Stage performances released dopamine naturally, but required work. TikTok? Instant dopamine every 15 seconds.`
  }
];

const chapter1ReadingPage5Blocks = [
  {
    type: 'story',
    text: `Reality check: Average teenager gets 237 notifications daily. Takes just 66 days to rewire neural pathways.

You're not weak. You're being gamed by billion-dollar algorithms. The game is rigged.

But you can still win.`
  }
];

const chapter1ReadingPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'reading-title', title: 'FROM STAGE STAR TO SILENT STRUGGLES', order_index: 1, content: chapter1ReadingTitlePage },
  { slug: 'reading-1', title: 'THE MOMENT EVERYTHING CHANGED', order_index: 2, content: chapter1ReadingPage1Blocks },
  { slug: 'reading-2', title: 'THE RISE', order_index: 3, content: chapter1ReadingPage2Blocks },
  { slug: 'reading-3', title: 'WHAT ACTUALLY HAPPENED', order_index: 4, content: chapter1ReadingPage3Blocks },
  { slug: 'reading-4', title: 'THE SCIENCE', order_index: 5, content: chapter1ReadingPage4Blocks },
  { slug: 'reading-5', title: 'THE TRUTH', order_index: 6, content: chapter1ReadingPage5Blocks },
];

// Chapter 1 Framework: simple multi-perspective SPARK-style framework
// This gives the user a working framework flow instead of "no content" errors.

const chapter1FrameworkIntroBlocks = [
  {
    type: 'heading',
    level: 1,
    text: 'THE SPARK FRAMEWORK',
  },
  {
    type: 'paragraph',
    text: `Tom didn’t just “decide” to fix his phone problem. He used a simple system—SPARK—to pull his attention back from endless scrolling and put it into things that actually mattered.`,
  },
];

const chapter1FrameworkSBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'S — SEE THE PATTERN',
  },
  {
    type: 'story',
    text: `The first move is not deleting your apps. It's noticing what actually happens before you grab your phone.\n\nIs it boredom? Awkward silence? Homework you don't want to start?\n\nTom realized he opened TikTok every time he hit a “hard part” of practice.`,
  },
];

const chapter1FrameworkPBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'P — PAUSE THE AUTOPILOT',
  },
  {
    type: 'story',
    text: `Tom built a 10–second pause before he let himself open an app.\n\nNot forever. Just 10 seconds to ask: “Do I actually want this… or am I running away from something?”\n\nThat tiny pause is what broke the automatic grab–scroll–regret cycle.`,
  },
];

const chapter1FrameworkABlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'A — AIM YOUR ATTENTION',
  },
  {
    type: 'story',
    text: `Attention is like a flashlight.\n\nWhen Tom pointed it at his phone, his speeches died. When he pointed it back at practice, his life came back.\n\nSPARK is not about “no phone forever.” It’s about choosing where that flashlight goes on purpose.`,
  },
];

const chapter1FrameworkRBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'R — RESET THE ENVIRONMENT',
  },
  {
    type: 'story',
    text: `Tom didn’t trust willpower alone.\n\nHe moved his phone across the room during practice. Turned off notifications for the worst apps. Put his scripts on the desk where his phone used to live.\n\nWhen the environment changes, self–control becomes 10x easier.`,
  },
];

const chapter1FrameworkKBlocks = [
  {
    type: 'heading',
    level: 2,
    text: 'K — KEEP THE STREAK SMALL',
  },
  {
    type: 'story',
    text: `Tom didn’t try to become a “perfect” person overnight.\n\nHe aimed for tiny wins: 10 focused minutes without his phone. Then 15. Then 20.\n\nSmall streaks beat heroic bursts. SPARK is built to be something you can actually keep going.`,
  },
];

const chapter1FrameworkPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'spark-intro', title: 'The SPARK Framework', order_index: 1, content: chapter1FrameworkIntroBlocks },
  { slug: 'spark-s', title: 'S — See the Pattern', order_index: 2, content: chapter1FrameworkSBlocks },
  { slug: 'spark-p', title: 'P — Pause the Autopilot', order_index: 3, content: chapter1FrameworkPBlocks },
  { slug: 'spark-a', title: 'A — Aim Your Attention', order_index: 4, content: chapter1FrameworkABlocks },
  { slug: 'spark-r', title: 'R — Reset the Environment', order_index: 5, content: chapter1FrameworkRBlocks },
  { slug: 'spark-k', title: 'K — Keep the Streak Small', order_index: 6, content: chapter1FrameworkKBlocks },
];

// ============================================
// Chapter 2 Content
// ============================================

// Chapter 2 Reading: intro page with chapter title, then 5 pages of story/content.
const chapter2ReadingIntroBlocks = [
  {
    type: 'paragraph',
    text: 'Tony\'s story about turning stage fright into fuel. This chapter shows you how to work with your fear instead of letting it silence you.'
  },
];

const chapter2ReadingPage1Blocks = [
  {
    type: 'story',
    text: `Tony stood outside the conference room, hand on the door handle, unable to move. Inside, twelve people waited to hear his pitch—the app idea he'd been perfecting for six months. His boss had hyped it up all week: "Tony's got something game-changing."

His chest tightened. His hands were already shaking. The presentation was loaded on his laptop, but his mind was completely blank.

He pushed the door open. Twelve faces turned toward him. His throat closed up.

"So, uh... hey everyone," he started, voice cracking. "I, um... I made this thing..."

Forty-five seconds later, he was still on the title slide. Someone coughed. His boss looked confused. Tony's brilliant idea—six months of work—was dying in real-time because he physically could not get the words out.

He mumbled something about "technical difficulties" and basically ran out of the room.

Sitting in his car afterward, Tony wanted to disappear. He had the ideas. He had the talent. But none of it mattered if he couldn't speak.`
  }
];

const chapter2ReadingPage2Blocks = [
  { type: 'heading', level: 2, text: 'HOW IT STARTED' },
  {
    type: 'story',
    text: `Tony wasn't always like this.

As a kid, he was the one asking endless questions, making up elaborate stories during recess, volunteering answers in class.

But in eighth grade, something changed.

During a class presentation, he mispronounced "epitome" (said it like "epi-tome"). Three kids laughed. His face went hot. The teacher corrected him. More laughs.

From that day forward, a voice in his head whispered every time he had to speak:

"What if you mess up again? What if they laugh?"

By high school, Tony stopped volunteering in class.

In college, he'd take a lower grade rather than do presentations.

At his first job, he was the guy with brilliant ideas in Slack who went silent in meetings.

His mom didn't help. She had her own public speaking anxiety and would say things like, "Some people just aren't meant to talk in front of others. Nothing wrong with being behind-the-scenes."

Tony believed her.

Until the day his boss said:

"Tony, your ideas are incredible. But if you can't present them, someone else will take the credit."

That hit different.`
  }
];

const chapter2ReadingPage3Blocks = [
  { type: 'heading', level: 2, text: 'WHAT\'S ACTUALLY HAPPENING (The Science)' },
  { type: 'paragraph', text: `Here's what nobody tells you about stage fright: it's not just "being nervous." It's your brain literally perceiving public speaking as a physical threat.` },
  {
    type: 'callout',
    variant: 'science',
    title: 'Your brain on stage fright',
    text: `Dr. Maya Shankar, cognitive scientist, explains that when you have to speak in front of people, your amygdala (the fear center) activates the same fight-or-flight response as if you were facing a predator. Your body floods with cortisol and adrenaline. Heart races. Hands shake. Mind goes blank.`
  }
];

const chapter2ReadingPage4Blocks = [
  { type: 'heading', level: 2, text: 'THE RESEARCH' },
  {
    type: 'callout',
    variant: 'research',
    title: 'You are not alone',
    text: `Harvard research found that 75% of people experience speech anxiety. You're not broken—you're normal.

Stanford studied people with severe speech anxiety and found that those who reframed physical symptoms (racing heart, shaky hands) as "excitement" rather than "fear" performed significantly better than those who tried to "calm down."`
  }
];

const chapter2ReadingPage5Blocks = [
  { type: 'heading', level: 2, text: 'THE TRUTH' },
  {
    type: 'callout',
    variant: 'truth',
    title: 'Fear vs excitement',
    text: `Your body can't tell the difference between excitement and fear—same physical response. Your brain assigns the meaning.

Tony's breakthrough: The shaking wasn't weakness. It was energy. He just had to redirect it.`
  }
];

const chapter2ReadingPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  // Intro: big chapter title only
  { slug: 'reading-intro', title: 'THE GENIUS WHO COULDNT SPEAK', order_index: 1, content: chapter2ReadingIntroBlocks },
  // Main story pages
  { slug: 'reading-1', title: 'The Nightmare', order_index: 2, content: chapter2ReadingPage1Blocks },
  { slug: 'reading-2', title: 'How It Started', order_index: 3, content: chapter2ReadingPage2Blocks },
  { slug: 'reading-3', title: "What's Actually Happening", order_index: 4, content: chapter2ReadingPage3Blocks },
  { slug: 'reading-4', title: 'The Research', order_index: 5, content: chapter2ReadingPage4Blocks },
  { slug: 'reading-5', title: 'The Truth', order_index: 6, content: chapter2ReadingPage5Blocks },
];

// Chapter 2 Framework: one page per letter (like Chapter 1 SPARK) — intro + V, O, I, C, E
const chapter2FrameworkIntroBlocks = [
  {
    type: 'heading',
    level: 1,
    text: 'THE VOICE FRAMEWORK'
  },
  {
    type: 'paragraph',
    text: 'Tony worked with a speaking coach who taught him VOICE—a system specifically for stage fright.'
  }
];

// Framework V: content page + Your Turn page (like Chapter 1)
const chapter2FrameworkVContent = [
  {
    type: 'paragraph',
    text: `It's real, and that's okay.

Tony's coach made him say out loud: "I'm scared of public speaking. That's a normal human response to perceived judgment."

No toxic positivity. No "just imagine everyone naked" BS. Just: your fear is valid.`
  }
];
const chapter2FrameworkVYourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_voice_v_fear',
    label: 'What specific speaking situation scares you?',
    description: 'Complete the sentence: "I\'m scared of ______. That\'s normal."',
    input: 'textarea',
    placeholder: 'Example: presenting in front of my class next week',
    required: false
  }
];

const chapter2FrameworkOContent = [
  {
    type: 'paragraph',
    text: `Notice without judging.

Before speaking, Tony learned to do a body scan: "My heart is racing. My palms are sweaty. My throat feels tight." Just observations, no "I'm such a mess" added.

Neuroscience shows that naming physical sensations reduces their intensity by up to 30%.`
  }
];
const chapter2FrameworkOYourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_voice_o_body_scan',
    label: 'Name three physical sensations you feel when you get nervous.',
    description: 'Just observations. No judgment or labels like "I\'m a mess."',
    input: 'textarea',
    placeholder: 'Example: heart racing, shaky hands, tight throat',
    required: false
  }
];

const chapter2FrameworkIContent = [
  {
    type: 'paragraph',
    text: `Find your anchor.

Tony's coach told him: "Don't speak to 'the room.' Pick one friendly face and talk to them like it's a conversation."

In his next presentation, Tony focused on his colleague Jamie, who always smiled and nodded. It transformed everything—suddenly it wasn't a performance, it was just telling Jamie about his idea while other people happened to be there.`
  }
];
const chapter2FrameworkIYourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_voice_i_anchor',
    label: 'Who could be your "Jamie" in your next speaking situation?',
    description: 'Think of one person you can lock onto and talk to like a friend.',
    input: 'text',
    placeholder: 'Example: my friend Aisha in the second row',
    required: false
  }
];

const chapter2FrameworkCContent = [
  {
    type: 'paragraph',
    text: `Reframe shaking as power.

Instead of thinking "I'm scared," Tony trained himself to think: "My body is giving me energy to deliver this powerfully."

Same physical sensation. Different story. Stanford found this reframing improved performance by 40% compared to trying to calm down.`
  }
];
const chapter2FrameworkCYourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_voice_c_reframe',
    label: 'Write the sentence you\'ll tell yourself before you speak.',
    description: 'Example: "This energy is here to help me. I\'m excited."',
    input: 'text',
    placeholder: 'This energy is here to help me. I\'m excited.',
    required: false
  }
];

const chapter2FrameworkEContent = [
  {
    type: 'paragraph',
    text: `Celebrate something specific.

After every speaking attempt—even disasters—Tony forced himself to name ONE thing that went right.

"I made eye contact once."
"I got through the introduction."
"I didn't actually die."

This builds what psychologists call "self-efficacy"—proof to your brain that you can do hard things.`
  }
];
const chapter2FrameworkEYourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_voice_e_win',
    label: 'What\'s one tiny win you\'ll look for after your next speaking moment?',
    input: 'text',
    placeholder: 'Example: I spoke for at least 30 seconds without stopping.',
    required: false
  }
];

const chapter2FrameworkPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'voice-intro', title: 'THE VOICE FRAMEWORK', order_index: 1, content: chapter2FrameworkIntroBlocks },
  { slug: 'voice-v', title: 'V - Validate the Fear', order_index: 2, content: chapter2FrameworkVContent },
  { slug: 'voice-v-turn', title: 'Your Turn', order_index: 3, content: chapter2FrameworkVYourTurn },
  { slug: 'voice-o', title: 'O - Observe Your Body', order_index: 4, content: chapter2FrameworkOContent },
  { slug: 'voice-o-turn', title: 'Your Turn', order_index: 5, content: chapter2FrameworkOYourTurn },
  { slug: 'voice-i', title: 'I - Identify One Person', order_index: 6, content: chapter2FrameworkIContent },
  { slug: 'voice-i-turn', title: 'Your Turn', order_index: 7, content: chapter2FrameworkIYourTurn },
  { slug: 'voice-c', title: 'C - Channel the Energy', order_index: 8, content: chapter2FrameworkCContent },
  { slug: 'voice-c-turn', title: 'Your Turn', order_index: 9, content: chapter2FrameworkCYourTurn },
  { slug: 'voice-e', title: 'E - Exit with One Win', order_index: 10, content: chapter2FrameworkEContent },
  { slug: 'voice-e-turn', title: 'Your Turn', order_index: 11, content: chapter2FrameworkEYourTurn },
];

// Chapter 2 Techniques: content page + Your Turn page per technique (like Chapter 1)
const chapter2Technique1Content = [
  { type: 'paragraph', text: 'Here are three practical tools Tony used to move from panic to performance.' },
  { type: 'heading', level: 2, text: 'Technique #1: The 10-Second Rule' },
  { type: 'paragraph', text: `Tony's coach gave him this:\n\nWhen fear spikes, you have 10 seconds before your brain fully spirals. In those 10 seconds, do ONE of these:` },
  {
    type: 'list',
    style: 'bullets',
    items: [
      'Take three deep belly breaths (in for 4, out for 6)',
      'Shake out your hands like you\'re flinging water off them',
      'Hum (activates vagus nerve, literally calms your nervous system)'
    ]
  }
];
const chapter2Technique1YourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  { type: 'callout', variant: 'tip', title: 'Practice it now', text: 'Practice one of these right now. For real. Pick one and do it.' }
];

const chapter2Technique2Content = [
  {
    type: 'paragraph',
    text: `Tony stopped trying to be perfect. His new strategy: start with real honesty.

His next big presentation opened with:

"Okay, full disclosure—I'm nervous right now and my hands are shaking. But I'm really excited about what I'm about to show you."

The room relaxed. He relaxed. Turns out, acknowledging your nervousness makes the audience root for you.`
  }
];
const chapter2Technique2YourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_technique_honest_opener',
    label: 'Draft your honest opener line.',
    description: 'Write one sentence you could use to start honestly instead of pretending you\'re not nervous.',
    input: 'textarea',
    placeholder: 'Okay, full disclosure—...',
    required: false
  }
];

const chapter2Technique3Content = [
  { type: 'paragraph', text: `Tony didn't jump from "can't speak" to "conference presentations." He built a ladder:` },
  {
    type: 'list',
    style: 'numbers',
    items: [
      'Week 1: Said his idea out loud to his bedroom wall',
      'Week 2: Voice-recorded himself presenting, listened back',
      'Week 3: Presented to his roommate',
      'Week 4: Presented to two friends',
      'Week 6: Volunteered in a small team meeting',
      'Week 8: Pitched in the conference room (where he\'d failed before)'
    ]
  },
  { type: 'paragraph', text: 'Each rung built proof his brain could handle the next level.' }
];
const chapter2Technique3YourTurn = [
  { type: 'heading', level: 2, text: 'YOUR TURN' },
  {
    type: 'prompt',
    id: 'ch2_technique_ladder_first_rung',
    label: 'What\'s your first rung on the ladder?',
    description: 'Make it tiny. Something you could actually do this week.',
    input: 'textarea',
    placeholder: 'Example: say one idea out loud to my bedroom wall.',
    required: false
  }
];

const chapter2TechniquesPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'technique-1', title: 'TECHNIQUES FOR STAGE FRIGHT', order_index: 1, content: chapter2Technique1Content },
  { slug: 'technique-1-turn', title: 'Your Turn', order_index: 2, content: chapter2Technique1YourTurn },
  { slug: 'technique-2', title: 'Technique #2: The Honest Opener', order_index: 3, content: chapter2Technique2Content },
  { slug: 'technique-2-turn', title: 'Your Turn', order_index: 4, content: chapter2Technique2YourTurn },
  { slug: 'technique-3', title: 'Technique #3: The Repetition Ladder', order_index: 5, content: chapter2Technique3Content },
  { slug: 'technique-3-turn', title: 'Your Turn', order_index: 6, content: chapter2Technique3YourTurn },
];

// Chapter 2 Self-Check (assessment): 2 pages (intro + scale questions)
const chapter2SelfCheckIntroBlocks = [
  { type: 'heading', level: 1, text: 'YOUR QUICK CHECK' },
  { type: 'paragraph', text: 'Rate yourself honestly on the next page. This helps you see where you are—and where the VOICE framework and techniques will help most.' }
];

const chapter2SelfCheckScaleBlocks = [
  {
    type: 'scale_questions',
    id: 'ch2_self_check',
    title: 'How intense is your speaking anxiety right now?',
    description: 'Rate yourself honestly on each question from 1–7.',
    questions: [
      { id: 'ch2_q1_avoid_speaking', text: 'I avoid speaking situations when possible (1 = rarely, 7 = always)' },
      { id: 'ch2_q2_mind_blank', text: 'My mind goes blank when speaking (1 = never, 7 = every time)' },
      { id: 'ch2_q3_physical_symptoms', text: 'Physical symptoms (shaking/racing heart) overwhelm me (1 = manageable, 7 = paralyzing)' },
      { id: 'ch2_q4_catastrophize', text: 'I catastrophize what could go wrong (1 = rarely, 7 = constantly)' }
    ],
    scale: { min: 1, max: 7, minLabel: 'Low', maxLabel: 'High' },
    scoring: {
      bands: [
        { range: [12, 28], label: 'You\'re where Tony started', description: 'VOICE framework will help the most here.', color: 'red' },
        { range: [8, 11], label: 'Moderate anxiety', description: 'Focus on Techniques #1 and #3.', color: 'yellow' },
        { range: [4, 7], label: 'You\'re managing it', description: 'Keep building experience and reps.', color: 'green' }
      ]
    }
  }
];

const chapter2SelfCheckPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'assessment-intro', title: 'Your Quick Check', order_index: 1, content: chapter2SelfCheckIntroBlocks },
  { slug: 'assessment-questions', title: 'Rate Yourself', order_index: 2, content: chapter2SelfCheckScaleBlocks },
];

// Chapter 2 Follow-Through: 4 pages (comeback, 6-week plan, scripts, your move)
const chapter2FollowThrough1Blocks = [
  { type: 'heading', level: 1, text: 'THE COMEBACK' },
  {
    type: 'story',
    text: `Eight weeks after his conference room disaster, Tony's boss asked him to pitch again—this time to potential investors.

Old Tony would've faked sick.

New Tony said yes, then immediately wanted to throw up. But he had his system now.

Day of presentation:
• Validated: "I'm scared. That's normal."
• Observed: "Heart racing. Hands clammy. Throat tight."
• Identified: Found one investor who looked friendly
• Channeled: "This energy means I care about this"
• Committed to exit win: Just finish, that's the win

He walked in. Opened with:

"I'll be honest—I'm nervous because I care about this idea so much."

The friendly investor smiled.

Tony made it through his entire pitch. Voice shook in places. Forgot one slide. Messed up a transition. Didn't matter. They funded his app.

Afterward, the friendly investor said:

"Your passion came through. That's what sold me."

Where is Tony now?

At 23, he's given presentations to rooms of 100+ people. Still gets nervous (always will). But now nervousness feels like fuel, not failure.

His advice:

"Stage fright never completely goes away. You just get better at dancing with it."`
  }
];

const chapter2FollowThrough2Blocks = [
  { type: 'heading', level: 2, text: 'YOUR 6-WEEK PLAN' },
  {
    type: 'task_plan',
    id: 'ch2_6_week_plan',
    title: 'Build your speaking ladder over the next 6 weeks',
    description: 'Start with the lowest-stakes situations and climb one rung at a time.',
    duration: '6 weeks',
    tasks: [
      { week: 1, title: 'Week 1', description: 'Practice VOICE framework alone (speak to wall/camera)' },
      { week: 2, title: 'Week 2', description: 'Use the 10-Second Rule three times this week when anxious' },
      { week: 3, title: 'Week 3', description: 'Speak in the lowest-stakes situation available (dinner table, friend group)' },
      { week: 4, title: 'Week 4', description: 'Volunteer to speak in a slightly-higher-stakes situation (class comment, team meeting)' },
      { week: 5, title: 'Week 5', description: 'Record yourself presenting something you care about; watch without cringing' },
      { week: 6, title: 'Week 6', description: 'Accept one speaking opportunity you\'d normally avoid' }
    ]
  }
];

const chapter2FollowThrough3Blocks = [
  { type: 'heading', level: 2, text: 'REAL TALK SCRIPTS' },
  {
    type: 'scripts',
    id: 'ch2_real_talk_scripts',
    title: 'Use these exact words if you need them',
    scripts: [
      { id: 'to_teacher', title: 'To a teacher/professor', target: 'teacher or professor', content: 'I have pretty bad presentation anxiety. Would it be okay if I present first so I\'m not sitting there panicking the whole time?' },
      { id: 'to_self', title: 'To yourself before speaking', target: 'yourself', content: 'My body is trying to help me, not sabotage me. This energy is useful. I\'ve got this for the next 5 minutes.' },
      { id: 'to_friends', title: 'To friends', target: 'friends', content: 'I\'m working on getting better at speaking up. If I\'m being too quiet in group conversations, call me out?' }
    ]
  }
];

const chapter2FollowThrough4Blocks = [
  { type: 'heading', level: 2, text: 'YOUR MOVE' },
  { type: 'paragraph', text: `Tony's story isn't about becoming fearless. It's about doing the thing even while scared.\n\nSome of you need more time. That's valid—don't force it.\n\nBut if you're tired of letting fear steal your voice, pick your first rung on the ladder. Not the top rung. The very first one.` },
  { type: 'paragraph', text: `Maybe it's saying one thing in class this week.\nMaybe it's recording yourself talking about something you love.\nMaybe it's just admitting out loud: "I'm scared of this."` },
  { type: 'cta', title: 'Start your first rung today', text: 'Six weeks from now, you\'ll either wish you\'d started today, or you\'ll be shocked at how far you\'ve come. Your call.', variant: 'primary' }
];

const chapter2FollowThroughPages: Array<{ slug: string; title: string; order_index: number; content: any[] }> = [
  { slug: 'follow-1', title: 'The Comeback', order_index: 1, content: chapter2FollowThrough1Blocks },
  { slug: 'follow-2', title: 'Your 6-Week Plan', order_index: 2, content: chapter2FollowThrough2Blocks },
  { slug: 'follow-3', title: 'Real Talk Scripts', order_index: 3, content: chapter2FollowThrough3Blocks },
  { slug: 'follow-4', title: 'Your Move', order_index: 4, content: chapter2FollowThrough4Blocks },
];

// ============================================
// Migration Functions
// ============================================

async function migrateChapter1() {
  console.log('\n🔄 Migrating Chapter 1 content...');

  try {
    // Get Chapter 1
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('chapter_number', 1)
      .single();

    if (chapterError || !chapter) {
      console.error('❌ Chapter 1 not found:', chapterError);
      return false;
    }

    // Helper to get a step by type
    const getStepByType = async (stepType: string) => {
      const { data: step, error: stepError } = await supabase
        .from('chapter_steps')
        .select('id, step_type, slug')
        .eq('chapter_id', chapter.id)
        .eq('step_type', stepType)
        .single();

      if (stepError || !step) {
        console.error(`❌ Step not found for type "${stepType}":`, stepError);
        return null;
      }

      return step;
    };

    // READ — 6 pages matching the legacy chunk-by-chunk reader
    const readStep = await getStepByType('read');
    if (readStep) {
      await supabase.from('step_pages').delete().eq('step_id', readStep.id);
      for (const page of chapter1ReadingPages) {
        const { error: readPageError } = await supabase.from('step_pages').insert({
          step_id: readStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 2,
          xp_award: page.order_index === 6 ? 50 : 0, // XP only on last page
          content: page.content
        });
        if (readPageError) console.error(`❌ Chapter 1 Reading "${page.slug}":`, readPageError);
        else console.log(`✅ Chapter 1 Reading page ${page.order_index}: ${page.slug}`);
      }
    }

    // SELF CHECK (assessment) — 2 pages
    const selfCheckStep = await getStepByType('self_check');
    if (selfCheckStep) {
      await supabase.from('step_pages').delete().eq('step_id', selfCheckStep.id);
      for (const page of chapter1SelfCheckPages) {
        const { error: selfCheckPageError } = await supabase.from('step_pages').insert({
          step_id: selfCheckStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 3,
          xp_award: 15,
          content: page.content
        });
        if (selfCheckPageError) console.error(`❌ Chapter 1 Self-Check "${page.slug}":`, selfCheckPageError);
        else console.log(`✅ Chapter 1 Self-Check page: ${page.slug}`);
      }
    }

    // FRAMEWORK — basic SPARK framework so the step is no longer empty
    const frameworkStep = await getStepByType('framework');
    if (frameworkStep) {
      await supabase.from('step_pages').delete().eq('step_id', frameworkStep.id);
      for (const page of chapter1FrameworkPages) {
        const { error: frameworkPageError } = await supabase.from('step_pages').insert({
          step_id: frameworkStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 4,
          xp_award: page.order_index === chapter1FrameworkPages.length ? 40 : 0,
          content: page.content,
        });
        if (frameworkPageError) console.error(`❌ Chapter 1 Framework "${page.slug}":`, frameworkPageError);
        else console.log(`✅ Chapter 1 Framework page: ${page.slug}`);
      }
    }

    console.log('✅ Chapter 1 content migration complete (reading + self-check + framework)');
    console.log('⚠️  Note: Techniques and Follow-Through steps need manual migration or block creation');
    return true;
  } catch (error) {
    console.error('❌ Chapter 1 migration error:', error);
    return false;
  }
}

async function migrateChapter2() {
  console.log('\n🔄 Migrating Chapter 2 content...');

  try {
    // Get Chapter 2
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('chapter_number', 2)
      .single();

    if (chapterError || !chapter) {
      console.error('❌ Chapter 2 not found:', chapterError);
      return false;
    }

    // Helper to get a step by type
    const getStepByType = async (stepType: string) => {
      const { data: step, error: stepError } = await supabase
        .from('chapter_steps')
        .select('id, step_type, slug')
        .eq('chapter_id', chapter.id)
        .eq('step_type', stepType)
        .single();

      if (stepError || !step) {
        console.error(`❌ Step not found for type "${stepType}":`, stepError);
        return null;
      }

      return step;
    };

    // READ — 5 chunked pages
    const readStep = await getStepByType('read');
    if (readStep) {
      await supabase.from('step_pages').delete().eq('step_id', readStep.id);
      for (const page of chapter2ReadingPages) {
        const { error: readPageError } = await supabase.from('step_pages').insert({
          step_id: readStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 2,
          xp_award: 10,
          content: page.content
        });
        if (readPageError) console.error(`❌ Chapter 2 Reading "${page.slug}":`, readPageError);
        else console.log(`✅ Chapter 2 Reading page: ${page.slug}`);
      }
    }

    // FRAMEWORK — 6 pages (intro + V, O, I, C, E), like Chapter 1 SPARK
    const frameworkStep = await getStepByType('framework');
    if (frameworkStep) {
      const { error: deleteError } = await supabase
        .from('step_pages')
        .delete()
        .eq('step_id', frameworkStep.id);

      if (deleteError) {
        console.warn('⚠️ Could not delete existing Chapter 2 Framework pages:', deleteError.message);
      }

      for (const page of chapter2FrameworkPages) {
        const { error: frameworkPageError } = await supabase.from('step_pages').insert({
          step_id: frameworkStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 2,
          xp_award: 10,
          content: page.content
        });

        if (frameworkPageError) {
          console.error(`❌ Error inserting Chapter 2 Framework page "${page.slug}":`, frameworkPageError);
        } else {
          console.log(`✅ Chapter 2 Framework page inserted: ${page.slug}`);
        }
      }
    }

    // TECHNIQUES — 3 chunked pages
    const techniquesStep = await getStepByType('techniques');
    if (techniquesStep) {
      await supabase.from('step_pages').delete().eq('step_id', techniquesStep.id);
      for (const page of chapter2TechniquesPages) {
        const { error: techniquesPageError } = await supabase.from('step_pages').insert({
          step_id: techniquesStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 3,
          xp_award: 15,
          content: page.content
        });
        if (techniquesPageError) console.error(`❌ Chapter 2 Techniques "${page.slug}":`, techniquesPageError);
        else console.log(`✅ Chapter 2 Techniques page: ${page.slug}`);
      }
    }

    // SELF CHECK (assessment) — 2 chunked pages
    const selfCheckStep = await getStepByType('self_check');
    if (selfCheckStep) {
      await supabase.from('step_pages').delete().eq('step_id', selfCheckStep.id);
      for (const page of chapter2SelfCheckPages) {
        const { error: selfCheckPageError } = await supabase.from('step_pages').insert({
          step_id: selfCheckStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 3,
          xp_award: 15,
          content: page.content
        });
        if (selfCheckPageError) console.error(`❌ Chapter 2 Self-Check "${page.slug}":`, selfCheckPageError);
        else console.log(`✅ Chapter 2 Self-Check page: ${page.slug}`);
      }
    }

    // FOLLOW THROUGH — 4 chunked pages
    const followThroughStep = await getStepByType('follow_through');
    if (followThroughStep) {
      await supabase.from('step_pages').delete().eq('step_id', followThroughStep.id);
      for (const page of chapter2FollowThroughPages) {
        const { error: followThroughPageError } = await supabase.from('step_pages').insert({
          step_id: followThroughStep.id,
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: 3,
          xp_award: 10,
          content: page.content
        });
        if (followThroughPageError) console.error(`❌ Chapter 2 Follow-Through "${page.slug}":`, followThroughPageError);
        else console.log(`✅ Chapter 2 Follow-Through page: ${page.slug}`);
      }
    }

    console.log('✅ Chapter 2 content migration complete');
    return true;
  } catch (error) {
    console.error('❌ Chapter 2 migration error:', error);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  try {
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, chapter_number, slug, title');

    if (chaptersError) {
      console.error('❌ Error fetching chapters:', chaptersError);
      return;
    }

    console.log(`\n📊 Found ${chapters?.length || 0} chapters:`);
    chapters?.forEach(ch => {
      console.log(`   ${ch.chapter_number}. ${ch.title} (${ch.slug})`);
    });

    for (const chapter of chapters || []) {
      const { data: steps } = await supabase
        .from('chapter_steps')
        .select('id, step_type, title')
        .eq('chapter_id', chapter.id);

      console.log(`\n   Chapter ${chapter.chapter_number} steps:`);
      for (const step of steps || []) {
        const { data: pages } = await supabase
          .from('step_pages')
          .select('id, slug, title')
          .eq('step_id', step.id);

        console.log(`     - ${step.title} (${step.step_type}): ${pages?.length || 0} pages`);
        pages?.forEach(page => {
          const content = page as any;
          const blockCount = Array.isArray(content.content) ? content.content.length : 0;
          console.log(`       • ${page.title || page.slug} (${blockCount} blocks)`);
        });
      }
    }

    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// ============================================
// Main Execution
// ============================================

async function main() {
  console.log('================================================');
  console.log('  Content Migration Script');
  console.log('================================================');

  try {
    // Verify connection
    const { data, error } = await supabase.from('parts').select('count');
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase');

    // Run migrations
    await migrateChapter1();
    await migrateChapter2();

    // Verify
    await verifyMigration();

    console.log('\n✅ Migration complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the dynamic routes at /read/stage-star-silent-struggles and /read/genius-who-couldnt-speak');
    console.log('   2. Build out remaining Chapter 1 steps (framework, techniques, follow-through) as blocks if desired');
    console.log('   3. Use the admin content panel to review and adjust content');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateChapter1, verifyMigration };
