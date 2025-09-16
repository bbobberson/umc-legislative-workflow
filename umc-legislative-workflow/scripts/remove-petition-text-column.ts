import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function removePetitionTextColumn() {
  console.log('Removing petition_text column from database...')

  try {
    // Drop the petition_text column
    await sql`
      ALTER TABLE petitions 
      DROP COLUMN IF EXISTS petition_text
    `

    console.log('✅ Successfully removed petition_text column')
    console.log('🧹 Database schema cleaned up')

  } catch (error) {
    console.error('❌ Error removing petition_text column:', error)
    process.exit(1)
  }
}

removePetitionTextColumn()