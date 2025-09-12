import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function removeDuplicateCommittees() {
  console.log('Removing duplicate committees...')
  
  try {
    // For each committee name, keep only the earliest created record
    await sql`
      DELETE FROM committees c1
      WHERE c1.id NOT IN (
        SELECT c2.id
        FROM committees c2
        WHERE c2.name = c1.name
        ORDER BY c2.created_at ASC
        LIMIT 1
      )
    `
    
    console.log('✅ Duplicate committees removed')
    
    // Check the result
    const remainingCommittees = await sql`
      SELECT id, name, abbreviation, created_at
      FROM committees
      ORDER BY name
    `
    
    console.log(`\nRemaining committees (${remainingCommittees.length}):`)
    remainingCommittees.forEach(committee => {
      console.log(`- ${committee.name} (${committee.abbreviation})`)
    })
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error)
    throw error
  }
}

removeDuplicateCommittees().catch(console.error)