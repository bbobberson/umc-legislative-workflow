import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function updateStatusConstraint() {
  console.log('Updating petition status constraint...')
  
  try {
    // Drop the existing constraint
    await sql`
      ALTER TABLE petitions 
      DROP CONSTRAINT IF EXISTS petitions_status_check
    `
    
    // Add the new constraint with 'under_review' status
    await sql`
      ALTER TABLE petitions 
      ADD CONSTRAINT petitions_status_check 
      CHECK (status IN ('submitted', 'under_review', 'reviewed', 'assigned', 'in_committee', 'voted', 'approved', 'rejected'))
    `
    
    console.log('✅ Status constraint updated successfully')
  } catch (error) {
    console.error('❌ Error updating constraint:', error)
    throw error
  }
}

updateStatusConstraint().catch(console.error)