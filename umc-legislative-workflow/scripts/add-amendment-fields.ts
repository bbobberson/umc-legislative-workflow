import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function addAmendmentFields() {
  console.log('Adding amendment tracking fields to petitions table...')
  
  try {
    // Add new columns for structured amendment data
    await sql`
      ALTER TABLE petitions 
      ADD COLUMN IF NOT EXISTS amendment_data JSONB,
      ADD COLUMN IF NOT EXISTS original_paragraph_text TEXT,
      ADD COLUMN IF NOT EXISTS modified_paragraph_text TEXT
    `
    
    console.log('✅ Amendment fields added successfully')
    
    // Check the updated schema
    const schema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'petitions' 
      AND column_name IN ('amendment_data', 'original_paragraph_text', 'modified_paragraph_text')
      ORDER BY ordinal_position
    `
    
    console.log('New columns added:')
    schema.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
  } catch (error) {
    console.error('❌ Error adding amendment fields:', error)
    throw error
  }
}

addAmendmentFields().catch(console.error)