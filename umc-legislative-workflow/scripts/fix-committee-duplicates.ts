import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function fixCommitteeDuplicates() {
  console.log('Fixing committee duplicates...')
  
  try {
    // First, get the mapping of duplicate committees to keep the earliest one
    const committees = await sql`
      SELECT id, name, created_at,
             ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
      FROM committees
      ORDER BY name, created_at
    `
    
    // Create mapping from duplicates to originals
    const keepIds = new Map()
    const removeIds = []
    
    committees.forEach(c => {
      if (c.rn === 1) {
        // This is the first (keep) record for this name
        keepIds.set(c.name, c.id)
      } else {
        // This is a duplicate
        removeIds.push({ oldId: c.id, newId: keepIds.get(c.name), name: c.name })
      }
    })
    
    console.log('Committee mappings:')
    removeIds.forEach(mapping => {
      console.log(`- ${mapping.name}: ${mapping.oldId} -> ${mapping.newId}`)
    })
    
    // Update petitions to reference the correct committee IDs
    for (const mapping of removeIds) {
      const updateResult = await sql`
        UPDATE petitions 
        SET committee_id = ${mapping.newId}
        WHERE committee_id = ${mapping.oldId}
      `
      console.log(`Updated ${updateResult.count || 0} petitions for ${mapping.name}`)
    }
    
    // Now remove the duplicate committees
    for (const mapping of removeIds) {
      await sql`DELETE FROM committees WHERE id = ${mapping.oldId}`
      console.log(`Removed duplicate ${mapping.name} committee`)
    }
    
    console.log('✅ Committee duplicates fixed')
    
    // Check the result
    const remainingCommittees = await sql`
      SELECT id, name, abbreviation
      FROM committees
      ORDER BY name
    `
    
    console.log(`\nFinal committees (${remainingCommittees.length}):`)
    remainingCommittees.forEach(committee => {
      console.log(`- ${committee.name} (${committee.abbreviation})`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing duplicates:', error)
    throw error
  }
}

fixCommitteeDuplicates().catch(console.error)