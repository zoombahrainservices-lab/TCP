import { createAdminClient } from '@/lib/supabase/admin'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

const adminClient = createAdminClient()

async function checkMission1() {
  try {
    console.log('🔍 Checking Mission 1 data...\n')

    // Check Zone 1
    const { data: zone1, error: zoneError } = await adminClient
      .from('zones')
      .select('*')
      .eq('zone_number', 1)
      .single()

    if (zoneError || !zone1) {
      console.error('❌ Zone 1 not found:', zoneError)
      return
    }
    console.log('✅ Zone 1:', zone1)
    console.log()

    // Check Chapter 1
    const { data: chapter1, error: chapterError } = await adminClient
      .from('chapters')
      .select('*')
      .eq('zone_id', zone1.id)
      .eq('chapter_number', 1)
      .single()

    if (chapterError || !chapter1) {
      console.error('❌ Chapter 1 not found:', chapterError)
      return
    }
    console.log('✅ Chapter 1:', {
      id: chapter1.id,
      title: chapter1.title,
      chapter_number: chapter1.chapter_number,
      zone_id: chapter1.zone_id
    })
    console.log()

    // Check all phases for Chapter 1
    const { data: phases, error: phasesError } = await adminClient
      .from('phases')
      .select('*')
      .eq('chapter_id', chapter1.id)
      .order('phase_number', { ascending: true })

    if (phasesError) {
      console.error('❌ Error fetching phases:', phasesError)
      return
    }

    console.log(`✅ Found ${phases?.length || 0} phases for Chapter 1:`)
    phases?.forEach((phase: any) => {
      console.log(`  - Phase ${phase.phase_number}: ${phase.phase_type} (ID: ${phase.id})`)
      console.log(`    Title: ${phase.title || 'N/A'}`)
      console.log(`    Content length: ${phase.content?.length || 0} chars`)
      console.log(`    Metadata: ${JSON.stringify(phase.metadata).substring(0, 100)}...`)
      console.log()
    })

    // Specifically check power-scan phase
    const { data: powerScan, error: powerScanError } = await adminClient
      .from('phases')
      .select('*')
      .eq('chapter_id', chapter1.id)
      .eq('phase_type', 'power-scan')
      .single()

    if (powerScanError || !powerScan) {
      console.error('❌ Power Scan phase not found:', powerScanError)
      console.error('   Looking for chapter_id:', chapter1.id, 'phase_type: power-scan')
    } else {
      console.log('✅ Power Scan phase found:')
      console.log('   ID:', powerScan.id)
      console.log('   Chapter ID:', powerScan.chapter_id)
      console.log('   Phase Type:', powerScan.phase_type)
      console.log('   Title:', powerScan.title)
      console.log('   Has Questions:', !!powerScan.metadata?.questions)
      console.log('   Questions Count:', powerScan.metadata?.questions?.length || 0)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkMission1()
