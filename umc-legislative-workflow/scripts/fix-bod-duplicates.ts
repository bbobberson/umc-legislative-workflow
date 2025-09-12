import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function fixBodDuplicates() {
  console.log('Fixing BoD paragraph duplicates...')
  
  try {
    // First, get the mapping of duplicate paragraphs to keep the earliest one
    const paragraphs = await sql`
      SELECT id, number, title, current_text, section, created_at,
             ROW_NUMBER() OVER (PARTITION BY number ORDER BY created_at ASC) as rn
      FROM bod_paragraphs
      ORDER BY number, created_at
    `
    
    // Create mapping from duplicates to originals
    const keepIds = new Map()
    const removeIds = []
    
    paragraphs.forEach(p => {
      if (p.rn === 1) {
        // This is the first (keep) record for this paragraph number
        keepIds.set(p.number, p.id)
      } else {
        // This is a duplicate
        removeIds.push({ oldId: p.id, newId: keepIds.get(p.number), number: p.number })
      }
    })
    
    console.log('BoD paragraph mappings:')
    removeIds.forEach(mapping => {
      console.log(`- ${mapping.number}: ${mapping.oldId} -> ${mapping.newId}`)
    })
    
    // Update petitions to reference the correct paragraph IDs (if any references exist)
    for (const mapping of removeIds) {
      const updateResult = await sql`
        UPDATE petitions 
        SET bod_paragraph = ${mapping.number}
        WHERE bod_paragraph = ${mapping.number}
      `
      console.log(`Updated petitions referencing ${mapping.number}`)
    }
    
    // Now remove the duplicate paragraphs
    for (const mapping of removeIds) {
      await sql`DELETE FROM bod_paragraphs WHERE id = ${mapping.oldId}`
      console.log(`Removed duplicate ${mapping.number} paragraph`)
    }
    
    console.log('✅ BoD paragraph duplicates fixed')
    
    // Check the result
    const remainingParagraphs = await sql`
      SELECT id, number, title, section
      FROM bod_paragraphs
      ORDER BY number
    `
    
    console.log(`\nFinal BoD paragraphs (${remainingParagraphs.length}):`)
    remainingParagraphs.forEach(paragraph => {
      console.log(`- ${paragraph.number}: ${paragraph.title} (${paragraph.section})`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing duplicates:', error)
    throw error
  }
}

fixBodDuplicates().catch(console.error)