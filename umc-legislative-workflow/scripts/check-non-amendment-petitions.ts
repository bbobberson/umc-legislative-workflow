import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.POSTGRES_URL!)

async function checkNonAmendmentPetitions() {
  try {
    console.log('Checking for petitions without amendment data...')
    
    const petitions = await sql`
      SELECT 
        id, 
        title, 
        amendment_data, 
        original_paragraph_text,
        modified_paragraph_text,
        bod_paragraph
      FROM petitions 
      WHERE 
        amendment_data IS NULL 
        OR original_paragraph_text IS NULL 
        OR modified_paragraph_text IS NULL
      ORDER BY submission_date DESC
    `
    
    console.log(`Found ${petitions.length} petitions without complete amendment data:`)
    
    petitions.forEach((petition, index) => {
      console.log(`\n${index + 1}. ${petition.title}`)
      console.log(`   ID: ${petition.id}`)
      console.log(`   BoD Paragraph: ${petition.bod_paragraph}`)
      console.log(`   Has amendment_data: ${petition.amendment_data ? 'Yes' : 'No'}`)
      console.log(`   Has original_paragraph_text: ${petition.original_paragraph_text ? 'Yes' : 'No'}`)
      console.log(`   Has modified_paragraph_text: ${petition.modified_paragraph_text ? 'Yes' : 'No'}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkNonAmendmentPetitions()