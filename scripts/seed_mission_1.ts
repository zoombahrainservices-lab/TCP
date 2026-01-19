import { createAdminClient } from '@/lib/supabase/admin'

const adminClient = createAdminClient()

async function seedMission1() {
  try {
    console.log('🌱 Starting Mission 1 seed...')

    // Step 1: Ensure Zone 1 exists (update if it exists with different name)
    console.log('📦 Creating/updating Zone 1...')
    const { data: existingZone } = await adminClient
      .from('zones')
      .select('id')
      .eq('zone_number', 1)
      .single()

    let zone1
    if (existingZone) {
      // Update existing zone
      const { data: updatedZone, error: updateError } = await adminClient
        .from('zones')
        .update({
          name: 'THE INNER CIRCLE',
          description: 'Master yourself first - Days 1-7',
          icon: '🔴',
          color: '#FF2D2D',
          unlock_condition: 'always_unlocked',
        })
        .eq('zone_number', 1)
        .select()
        .single()
      
      if (updateError) {
        throw new Error(`Zone update error: ${updateError.message}`)
      }
      zone1 = updatedZone
    } else {
      // Create new zone
      const { data: newZone, error: createError } = await adminClient
        .from('zones')
        .insert({
          zone_number: 1,
          name: 'THE INNER CIRCLE',
          description: 'Master yourself first - Days 1-7',
          icon: '🔴',
          color: '#FF2D2D',
          unlock_condition: 'always_unlocked',
        })
        .select()
        .single()
      
      if (createError) {
        throw new Error(`Zone create error: ${createError.message}`)
      }
      zone1 = newZone
    }

    if (zoneError) {
      throw new Error(`Zone error: ${zoneError.message}`)
    }

    console.log('✅ Zone 1 created:', zone1?.id)

    // Step 2: Create/Update Chapter 1 (Mission 1)
    console.log('📚 Creating Mission 1 chapter...')
    const { data: chapter1, error: chapterError } = await adminClient
      .from('chapters')
      .upsert({
        zone_id: zone1.id,
        chapter_number: 1,
        title: 'THE ATTENTION HEIST',
        subtitle: 'Reclaiming Your Focus from the Digital Void',
        content: `# 🎯 THE ATTENTION HEIST: YOUR BRAIN UNDER SIEGE

Here's what's actually happening:
Your phone isn't just distracting you—it's stealing your life force. Every notification is a tiny theft. Every scroll is a moment you'll never get back. The algorithms know exactly how to keep you trapped.

## 🧠 THE SCIENCE BOMB:

• Average person checks phone 144 times per day
• That's once every 6.5 minutes while awake
• Your attention span during tasks has dropped from 2.5 minutes to 47 seconds
• Even having your phone visible reduces your brain power by 20%

Translation: You're trying to level up your life with 20% less brain power. That's like playing a game on hard mode with one hand tied behind your back.

## 🔓 THE UNLOCKABLE SUPERPOWER: THE ATTENTION SHIELD 🛡️

What it does: Protects your focus from digital hijacking and reclaims 2-3 hours of daily mental energy for things that actually matter.

When you need it:
• 📚 Before studying or homework
• 🎯 During important conversations
• 💪 When building any skill that matters
• 🎨 While creating anything meaningful

The Real Talk: You can't transform your communication if you're distracted every 47 seconds. First mission: Take back your attention.`,
        task_description: `🎮 YOUR MISSION, SHOULD YOU CHOOSE TO ACCEPT IT:
OPERATION: THE 25-MINUTE BLACKOUT

🎯 PRIMARY OBJECTIVE: Complete ONE 25-minute focus session on any important task with your phone in a completely different room (not just face-down nearby—actually OUT OF SIGHT).

📋 MISSION PARAMETERS:
• When: Choose your best focus time today (morning or evening)
• Where: Your workspace with NO phone visible
• What: Homework, studying, creative project, or practicing a skill
• Duration: 25 minutes minimum (use a timer in another room or a watch)

🔄 OPTIONAL BONUS MISSION (+10 XP): After your 25-minute blackout, do NOT check your phone immediately. Instead, stand up, stretch for 2 minutes, THEN check it. Notice how that feels different.`,
        before_questions: [
          {
            id: 'q1',
            question: 'The Notification Battle: When your phone buzzes during homework or a conversation, how quickly can you resist checking it?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q2',
            question: 'The Focus Test: How long can you work on something important before your mind drifts to checking social media or messaging apps?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q3',
            question: 'The Memory Challenge: Can you remember what you scrolled through yesterday on your phone for more than 5 minutes?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q4',
            question: 'The Morning Mission: Do you check your phone within the first 10 minutes of waking up?',
            scale: '1 = Always, 2 = Usually, 3 = Sometimes, 4 = Rarely, 5 = Never',
            type: 'scale'
          },
          {
            id: 'q5',
            question: 'The Real-Time Presence: When hanging with friends, can you keep your phone away for the entire time without feeling anxious?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          }
        ],
        after_questions: [
          {
            id: 'q1',
            question: 'The Notification Battle: When your phone buzzes, how quickly can you resist checking it?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q2',
            question: 'The Focus Test: How long can you work on something important before your mind drifts to checking?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q3',
            question: 'The Memory Challenge: Can you remember what you focused on (instead of scrolled)?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q4',
            question: 'The Morning Mission: Could you delay checking your phone this morning?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          },
          {
            id: 'q5',
            question: 'The Real-Time Presence: Do you feel more capable of phone-free presence now?',
            scale: '1 = ⚡ Glitching (struggling hard), 2 = 🔋 Low Battery (need serious help), 3 = ⚙️ Powering Up (working on it), 4 = 🔥 High Performance (pretty strong), 5 = 💎 Maximum Power (absolute mastery)',
            type: 'scale'
          }
        ],
        task_deadline_hours: 24,
      }, {
        onConflict: 'zone_id,chapter_number',
      })
      .select()
      .single()

    if (chapterError) {
      throw new Error(`Chapter error: ${chapterError.message}`)
    }

    console.log('✅ Chapter 1 created:', chapter1?.id)

    // Step 3: Create 5 Phases
    console.log('⚡ Creating phases...')

    // Phase 1: Power Scan
    const phase1Content = `⚙️ PHASE 1: THE POWER SCAN (Pre-Assessment)
🔍 Ready to scan your current power levels for this mission?
Rate yourself honestly using the Power Meter (1-5):
• 1 = ⚡ Glitching (struggling hard)
• 2 = 🔋 Low Battery (need serious help)
• 3 = ⚙️ Powering Up (working on it)
• 4 = 🔥 High Performance (pretty strong)
• 5 = 💎 Maximum Power (absolute mastery)

YOUR POWER SCAN QUESTIONS:
1. The Notification Battle: When your phone buzzes during homework or a conversation, how quickly can you resist checking it?
2. The Focus Test: How long can you work on something important before your mind drifts to checking social media or messaging apps?
3. The Memory Challenge: Can you remember what you scrolled through yesterday on your phone for more than 5 minutes?
4. The Morning Mission: Do you check your phone within the first 10 minutes of waking up? (1 = always, 5 = never)
5. The Real-Time Presence: When hanging with friends, can you keep your phone away for the entire time without feeling anxious?

📊 YOUR CURRENT POWER SCORE: _____ / 25
No judgment—just data. This is your starting point, Agent.`

    const { error: phase1Error } = await adminClient
      .from('phases')
      .upsert({
        chapter_id: chapter1.id,
        phase_number: 1,
        phase_type: 'power-scan',
        title: 'THE POWER SCAN',
        content: phase1Content,
        metadata: {
          questions: chapter1.before_questions,
          instructions: 'Rate yourself honestly on each question. This helps track your growth.',
          powerMeter: {
            '1': '⚡ Glitching (struggling hard)',
            '2': '🔋 Low Battery (need serious help)',
            '3': '⚙️ Powering Up (working on it)',
            '4': '🔥 High Performance (pretty strong)',
            '5': '💎 Maximum Power (absolute mastery)'
          }
        }
      }, {
        onConflict: 'chapter_id,phase_number',
      })

    if (phase1Error) {
      throw new Error(`Phase 1 error: ${phase1Error.message}`)
    }
    console.log('✅ Phase 1 (Power Scan) created')

    // Phase 2: Secret Intel
    const phase2Content = `📡 PHASE 2: THE SECRET INTEL (The Knowledge)
🎯 THE ATTENTION HEIST: YOUR BRAIN UNDER SIEGE

Here's what's actually happening:
Your phone isn't just distracting you—it's stealing your life force. Every notification is a tiny theft. Every scroll is a moment you'll never get back. The algorithms know exactly how to keep you trapped.

🧠 THE SCIENCE BOMB:
• Average person checks phone 144 times per day
• That's once every 6.5 minutes while awake
• Your attention span during tasks has dropped from 2.5 minutes to 47 seconds
• Even having your phone visible reduces your brain power by 20%

Translation: You're trying to level up your life with 20% less brain power. That's like playing a game on hard mode with one hand tied behind your back.

🔓 THE UNLOCKABLE SUPERPOWER: THE ATTENTION SHIELD 🛡️
What it does: Protects your focus from digital hijacking and reclaims 2-3 hours of daily mental energy for things that actually matter.

When you need it:
• 📚 Before studying or homework
• 🎯 During important conversations
• 💪 When building any skill that matters
• 🎨 While creating anything meaningful

The Real Talk: You can't transform your communication if you're distracted every 47 seconds. First mission: Take back your attention.`

    const { error: phase2Error } = await adminClient
      .from('phases')
      .upsert({
        chapter_id: chapter1.id,
        phase_number: 2,
        phase_type: 'secret-intel',
        title: 'THE SECRET INTEL',
        content: phase2Content,
        metadata: {
          hasChunks: false,
          chunks: []
        }
      }, {
        onConflict: 'chapter_id,phase_number',
      })

    if (phase2Error) {
      throw new Error(`Phase 2 error: ${phase2Error.message}`)
    }
    console.log('✅ Phase 2 (Secret Intel) created')

    // Phase 3: Visual Guide
    const phase3Content = `🎬 PHASE 3: THE HERO'S VISUAL GUIDE (Power Activation)
🦸 THE ATTENTION SHIELD ACTIVATION SEQUENCE

Since we're building your mental superpower library, here's your FIRST power pose:

1. THE PHONE LOCKDOWN STANCE
• 🎯 Physical Setup: Place phone face-down in another room OR in a drawer you can't see from your workspace
• 💪 Body Position: Sit upright, both feet on ground, shoulders back
• 👁️ Eye Focus: Look directly at your work/conversation partner—not where your phone is hidden
• 🫁 Breathing Pattern: 3 deep breaths (in through nose for 4 counts, out through mouth for 6 counts)

2. THE MENTAL SIMULATION (Practice this in your mind RIGHT NOW):
Close your eyes. Picture this scene:
You're working on something important. Your phone buzzes in another room. You feel the pull—that magnetic urge to check it. But instead, you:
1. Notice the feeling (acknowledge: "There's the urge")
2. Take one deep breath
3. Remind yourself: "This can wait 30 minutes. My focus can't."
4. Return to your task feeling STRONGER, not weaker

Repeat this mental movie 3 times. Your brain learns from visualization just like it learns from real experience.

3. THE VICTORY VISUAL MAP:
What Success Looks Like:
• ✅ Phone is physically separated from you
• ✅ Your body is alert but not tense
• ✅ Your eyes stay on your task for 25+ minutes
• ✅ When distractions knock, you notice them and let them pass
• ✅ You feel PROUD instead of guilty

The Power Mantra: "My attention is my superpower. I choose where it goes."
Say it 3 times before each focus session this week.`

    const { error: phase3Error } = await adminClient
      .from('phases')
      .upsert({
        chapter_id: chapter1.id,
        phase_number: 3,
        phase_type: 'visual-guide',
        title: "THE HERO'S VISUAL GUIDE",
        content: phase3Content,
        metadata: {
          activationSequence: [
            {
              step: 1,
              title: 'THE PHONE LOCKDOWN STANCE',
              description: 'Physical Setup: Place phone face-down in another room OR in a drawer you can\'t see from your workspace'
            },
            {
              step: 2,
              title: 'THE MENTAL SIMULATION',
              description: 'Practice this in your mind RIGHT NOW: Picture resisting the urge to check your phone'
            },
            {
              step: 3,
              title: 'THE VICTORY VISUAL MAP',
              description: 'Visualize what success looks like: Phone separated, body alert, focus maintained for 25+ minutes'
            }
          ],
          powerMantra: 'My attention is my superpower. I choose where it goes.'
        }
      }, {
        onConflict: 'chapter_id,phase_number',
      })

    if (phase3Error) {
      throw new Error(`Phase 3 error: ${phase3Error.message}`)
    }
    console.log('✅ Phase 3 (Visual Guide) created')

    // Phase 4: Field Mission
    const phase4Content = `🎯 PHASE 4: THE FIELD MISSION (Real-World Task)
🎮 YOUR MISSION, SHOULD YOU CHOOSE TO ACCEPT IT:

OPERATION: THE 25-MINUTE BLACKOUT

🎯 PRIMARY OBJECTIVE: Complete ONE 25-minute focus session on any important task with your phone in a completely different room (not just face-down nearby—actually OUT OF SIGHT).

📋 MISSION PARAMETERS:
• When: Choose your best focus time today (morning or evening)
• Where: Your workspace with NO phone visible
• What: Homework, studying, creative project, or practicing a skill
• Duration: 25 minutes minimum (use a timer in another room or a watch)

🔄 OPTIONAL BONUS MISSION (+10 XP): After your 25-minute blackout, do NOT check your phone immediately. Instead, stand up, stretch for 2 minutes, THEN check it. Notice how that feels different.

📝 MISSION LOG (Your Written Submission)
Agent, report back on your field experience:

1. MISSION STATUS:
• [ ] ✅ Completed
• [ ] ⚠️ Partially Completed
• [ ] ❌ Encountered Critical Failure

2. THE PLAY-BY-PLAY: Describe what happened during your 25-minute blackout:
• How many times did you want to check your phone?
• What did that urge feel like physically? (Example: "Like an itch in my brain" or "Like I was missing out on something")
• Did the urge get stronger or weaker as time passed?

3. THE BREAKTHROUGH MOMENT: Was there a specific moment when you felt STRONGER than the urge to check your phone? Describe it:

4. THE AFTERMATH: When you finally checked your phone after 25+ minutes, was it as important as your brain made it seem?
• [ ] Yes, I missed something urgent
• [ ] No, it was mostly nothing
• [ ] Mixed—some stuff mattered, most didn't

5. THE POWER RATING: On a scale of 1-10, how POWERFUL did you feel during moments when you resisted the phone urge? Rating: _____ / 10`

    const { error: phase4Error } = await adminClient
      .from('phases')
      .upsert({
        chapter_id: chapter1.id,
        phase_number: 4,
        phase_type: 'field-mission',
        title: 'THE FIELD MISSION',
        content: phase4Content,
        metadata: {
          task_deadline_hours: 24,
          upload_types: ['text'],
          instructions: 'Complete the mission and upload your mission log.',
          missionObjective: 'OPERATION: THE 25-MINUTE BLACKOUT',
          bonusMission: {
            available: true,
            description: 'After your 25-minute blackout, do NOT check your phone immediately. Instead, stand up, stretch for 2 minutes, THEN check it.',
            xpBonus: 10
          }
        }
      }, {
        onConflict: 'chapter_id,phase_number',
      })

    if (phase4Error) {
      throw new Error(`Phase 4 error: ${phase4Error.message}`)
    }
    console.log('✅ Phase 4 (Field Mission) created')

    // Phase 5: Level Up
    const phase5Content = `🆙 PHASE 5: LEVEL UP & THE MENTOR'S SCROLL
📊 POST-MISSION POWER SCAN

Now that you've completed your first field mission, re-scan your power levels:
Rate yourself again using the Power Meter (1-5):

1. The Notification Battle: When your phone buzzes, how quickly can you resist checking it?
2. The Focus Test: How long can you work on something important before your mind drifts to checking?
3. The Memory Challenge: Can you remember what you focused on (instead of scrolled)?
4. The Morning Mission: Could you delay checking your phone this morning?
5. The Real-Time Presence: Do you feel more capable of phone-free presence now?

📊 YOUR NEW POWER SCORE: _____ / 25
⚡ POWER GROWTH: Previous Score _____ → New Score _____ = +_____ points!

📜 THE MENTOR'S SCROLL
[FOR COACH/PARENT/MENTOR TO COMPLETE]

🏆 LEGENDARY FEEDBACK:
What did you observe about this agent's focus during their mission? What strengths did they demonstrate?

💡 PRO-TIPS FOR NEXT MISSION:
What's ONE specific thing this agent could do to level up even faster?

🌟 POWER-UP UNLOCKED:
• [ ] ⭐ Attention Apprentice (Completed mission)
• [ ] ⭐⭐ Focus Fighter (Showed significant improvement)
• [ ] ⭐⭐⭐ Attention Master (Exceeded expectations)

Mentor Signature: ___________________ Date: ___________`

    const { error: phase5Error } = await adminClient
      .from('phases')
      .upsert({
        chapter_id: chapter1.id,
        phase_number: 5,
        phase_type: 'level-up',
        title: "LEVEL UP & MENTOR'S SCROLL",
        content: phase5Content,
        metadata: {
          questions: chapter1.after_questions,
          reflection_required: true,
          min_reflection_length: 50,
          instructions: 'Answer the questions and write a reflection on what you learned.',
          mentorFeedback: {
            enabled: true,
            fields: ['legendaryFeedback', 'proTips', 'powerUpUnlocked']
          }
        }
      }, {
        onConflict: 'chapter_id,phase_number',
      })

    if (phase5Error) {
      throw new Error(`Phase 5 error: ${phase5Error.message}`)
    }
    console.log('✅ Phase 5 (Level Up) created')

    console.log('🎉 Mission 1 seed completed successfully!')
    console.log(`
📊 Summary:
- Zone 1: THE INNER CIRCLE
- Mission 1: THE ATTENTION HEIST
- 5 Phases created:
  1. Power Scan (Pre-Assessment)
  2. Secret Intel (The Knowledge)
  3. Visual Guide (Power Activation)
  4. Field Mission (Real-World Task)
  5. Level Up (Post-Assessment + Reflection)
    `)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedMission1()
