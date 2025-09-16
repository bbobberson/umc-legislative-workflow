import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.POSTGRES_URL!)

async function deleteNonAmendmentPetitions() {
  try {
    console.log('Finding petitions without amendment data...')
    
    const petitionsToDelete = await sql`
      SELECT 
        id, 
        title
      FROM petitions 
      WHERE 
        amendment_data IS NULL 
        OR original_paragraph_text IS NULL 
        OR modified_paragraph_text IS NULL
      ORDER BY submission_date DESC
    `
    
    console.log(`Found ${petitionsToDelete.length} petitions to delete:`)
    
    petitionsToDelete.forEach((petition, index) => {
      console.log(`${index + 1}. ${petition.title} (${petition.id})`)
    })
    
    if (petitionsToDelete.length === 0) {
      console.log('No petitions to delete.')
      return
    }
    
    console.log('\nDeleting petitions...')
    
    const result = await sql`
      DELETE FROM petitions 
      WHERE 
        amendment_data IS NULL 
        OR original_paragraph_text IS NULL 
        OR modified_paragraph_text IS NULL
    `
    
    console.log(`Successfully deleted ${result.length} petitions.`)
    
    // Verify deletion
    const remainingCount = await sql`SELECT COUNT(*) as count FROM petitions`
    console.log(`Remaining petitions in database: ${remainingCount[0].count}`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

deleteNonAmendmentPetitions()