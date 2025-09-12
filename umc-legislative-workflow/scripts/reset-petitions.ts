import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function resetPetitions() {
  console.log('Resetting petitions to submitted status...')
  
  try {
    // Reset all petitions to submitted status without type/financial impact set
    await sql`
      UPDATE petitions 
      SET 
        petition_type = NULL,
        financial_impact = false,
        status = 'submitted',
        committee_id = NULL,
        updated_at = NOW()
    `
    
    console.log('✅ Petitions reset successfully')
  } catch (error) {
    console.error('❌ Error resetting petitions:', error)
    throw error
  }
}

resetPetitions().catch(console.error)