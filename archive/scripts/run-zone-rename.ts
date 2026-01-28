/**
 * Run Zone 1 Rename Migration
 * Execute migration 110 to rename Zone 1 to "THE ATTENTION HEIST"
 * Run with: npx tsx scripts/run-zone-rename.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         Rename Zone 1 to "THE ATTENTION HEIST"            ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  try {
    // Update Zone 1
    console.log('📝 Updating Zone 1...\n')
    
    const { data, error } = await supabase
      .from('zones')
      .update({
        name: 'THE ATTENTION HEIST',
        description: 'Reclaiming Your Focus from the Digital Void - Days 1-7',
        color: '#FF2D2D'
      })
      .eq('zone_number', 1)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating zone:', error.message)
      process.exit(1)
    }

    console.log('✅ Zone 1 updated successfully!')
    console.log('\nNew Zone 1 details:')
    console.log(`   Name: ${data.name}`)
    console.log(`   Description: ${data.description}`)
    console.log(`   Icon: ${data.icon}`)
    console.log(`   Color: ${data.color}`)
    console.log(`   Unlock Condition: ${data.unlock_condition}`)

    // Verify the update
    console.log('\n🔍 Verifying all zones...\n')
    
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('zone_number, name, description, icon, color')
      .order('zone_number')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError.message)
      process.exit(1)
    }

    zones?.forEach(zone => {
      console.log(`   Zone ${zone.zone_number}: ${zone.name}`)
      console.log(`      ${zone.description}`)
      console.log(`      ${zone.icon} (${zone.color})`)
      console.log('')
    })

    console.log('✅ Migration completed successfully!\n')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
