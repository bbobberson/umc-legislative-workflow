import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function checkCommittees() {
  console.log('Checking committees in database...')
  
  try {
    const committees = await sql`
      SELECT id, name, abbreviation, created_at
      FROM committees
      ORDER BY name, created_at
    `
    
    console.log('Found committees:')
    committees.forEach(committee => {
      console.log(`- ${committee.id}: ${committee.name} (${committee.abbreviation})`)
    })
    
    console.log(`\nTotal count: ${committees.length}`)
    
    // Check for duplicates
    const names = committees.map(c => c.name)
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)
    
    if (duplicateNames.length > 0) {
      console.log('\n🔴 Found duplicate committee names:')
      const uniqueDuplicates = Array.from(new Set(duplicateNames))
      uniqueDuplicates.forEach(name => {
        console.log(`- ${name}`)
      })
    } else {
      console.log('\n✅ No duplicate committee names found')
    }
    
  } catch (error) {
    console.error('❌ Error checking committees:', error)
    throw error
  }
}

checkCommittees().catch(console.error)