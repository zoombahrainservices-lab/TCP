import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

async function createTestData() {
  const supabase = createAdminClient()

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const user = authUsers.users[0]
  const userId = user.id

  console.log('🔧 Creating test data for complete Chapter 1 report...\n')

  // 1. Create Self-Check Assessment
  console.log('📊 Creating Self-Check Assessment...')
  const assessmentResponses = {
    1: 5, // How often I grab phone when working
    2: 4, // Remember yesterday's scrolling
    3: 6, // Feel after phone session
    4: 5, // Time on passion this year
    5: 6, // Time before phone urge
    6: 5, // Use phone to avoid feelings
    7: 4, // Phone vanished 24hrs
  }
  const totalScore = Object.values(assessmentResponses).reduce((sum, val) => sum + val, 0)

  const { error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      chapter_id: 1,
      kind: 'baseline',
      responses: assessmentResponses,
      score: totalScore,
      created_at: new Date().toISOString(),
    })

  if (assessmentError) {
    console.error('❌ Error creating assessment:', assessmentError)
  } else {
    console.log(`✅ Assessment created (Score: ${totalScore}/49)`)
  }

  // 2. Create Your Turn Responses - Framework
  console.log('\n📝 Creating Your Turn Responses - Framework...')
  const frameworkResponses = [
    {
      promptKey: 'ch1_framework_1',
      promptText: 'What patterns do you notice in your digital habits?',
      responseText: 'I notice that I tend to reach for my phone during transitions - between tasks, after meetings, or when I feel stressed. These micro-moments add up throughout the day.',
    },
    {
      promptKey: 'ch1_framework_2',
      promptText: 'How has technology affected your ability to focus?',
      responseText: 'My focus has definitely decreased. I find it harder to read long articles or work on complex problems without checking my phone. The constant notifications have trained me to expect interruptions.',
    },
  ]

  for (const response of frameworkResponses) {
    const { error } = await supabase.from('artifacts').insert({
      user_id: userId,
      chapter_id: 1,
      type: 'your_turn_response',
      data: {
        promptKey: response.promptKey,
        promptText: response.promptText,
        responseText: response.responseText,
      },
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`❌ Error creating ${response.promptKey}:`, error)
    } else {
      console.log(`✅ Created ${response.promptKey}`)
    }
  }

  // 3. Create Your Turn Responses - Technique
  console.log('\n🛠️ Creating Your Turn Responses - Technique...')
  const techniqueResponses = [
    {
      promptKey: 'ch1_technique_1',
      promptText: 'What specific technique will you try first?',
      responseText: 'I will start by implementing the "phone in another room" technique during my morning work hours. This will help me establish a focused work routine.',
    },
    {
      promptKey: 'ch1_technique_2',
      promptText: 'How will you track your progress?',
      responseText: 'I will use a simple journal to note my focused work sessions and any urges I resist. I will review this weekly to see patterns and progress.',
    },
  ]

  for (const response of techniqueResponses) {
    const { error } = await supabase.from('artifacts').insert({
      user_id: userId,
      chapter_id: 1,
      type: 'your_turn_response',
      data: {
        promptKey: response.promptKey,
        promptText: response.promptText,
        responseText: response.responseText,
      },
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`❌ Error creating ${response.promptKey}:`, error)
    } else {
      console.log(`✅ Created ${response.promptKey}`)
    }
  }

  // 4. Create Your Turn Responses - Follow-Through
  console.log('\n🎯 Creating Your Turn Responses - Follow-Through...')
  const followThroughResponses = [
    {
      promptKey: 'ch1_followthrough_1',
      promptText: 'What is your commitment for the next 7 days?',
      responseText: 'For the next 7 days, I commit to keeping my phone in another room during my morning work block (9 AM - 12 PM) and checking it only during scheduled breaks.',
    },
    {
      promptKey: 'ch1_followthrough_2',
      promptText: 'What obstacles might you face?',
      responseText: 'I might face pressure from work colleagues who expect instant responses. I will set an auto-reply explaining my focused work hours and provide an alternative contact method for emergencies.',
    },
    {
      promptKey: 'ch1_followthrough_3',
      promptText: 'How will you celebrate small wins?',
      responseText: 'I will celebrate each successful day by taking a proper lunch break doing something I enjoy - reading or going for a walk, rather than scrolling on my phone.',
    },
  ]

  for (const response of followThroughResponses) {
    const { error } = await supabase.from('artifacts').insert({
      user_id: userId,
      chapter_id: 1,
      type: 'your_turn_response',
      data: {
        promptKey: response.promptKey,
        promptText: response.promptText,
        responseText: response.responseText,
      },
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`❌ Error creating ${response.promptKey}:`, error)
    } else {
      console.log(`✅ Created ${response.promptKey}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ TEST DATA CREATION COMPLETE')
  console.log('='.repeat(80))
  console.log('\n📄 You can now download the complete Chapter 1 report with:')
  console.log('   - Self-Check Assessment (7 questions with answers)')
  console.log('   - Framework Reflections (2 responses)')
  console.log('   - Technique Applications (2 responses)')
  console.log('   - Follow-Through Commitments (3 responses)')
  console.log('   - Identity Statement & Proof (already exists)')
  console.log('\n🔗 Go to /reports and download "Complete Report"')
}

createTestData().catch(console.error)
