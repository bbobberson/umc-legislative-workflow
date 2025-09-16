import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function fixCommitteeDuplicates() {
  console.log('Fixing duplicate committees...')
  
  // Get all committees
  const committees = await sql`SELECT id, name, abbreviation FROM committees ORDER BY name, id`
  
  // Group by name and keep only the first ID for each name
  const nameToFirstId = new Map()
  const idsToDelete = []
  
  committees.forEach((committee: any) => {
    if (!nameToFirstId.has(committee.name)) {
      nameToFirstId.set(committee.name, committee.id)
      console.log(`✅ Keeping: ${committee.name} (ID: ${committee.id})`)
    } else {
      idsToDelete.push(committee.id)
      console.log(`❌ Will delete: ${committee.name} (ID: ${committee.id})`)
    }
  })
  
  console.log(`\nFound ${idsToDelete.length} duplicate records to delete`)
  
  if (idsToDelete.length > 0) {
    // First, update any petitions that reference the duplicate committee IDs
    for (const duplicateId of idsToDelete) {
      const duplicateCommittee = committees.find((c: any) => c.id === duplicateId)
      const keepId = nameToFirstId.get(duplicateCommittee.name)
      
      console.log(`Updating petitions from ${duplicateCommittee.name} (${duplicateId}) to (${keepId})`)
      
      const updateResult = await sql`
        UPDATE petitions 
        SET committee_id = ${keepId}
        WHERE committee_id = ${duplicateId}
      `
      console.log(`Updated ${updateResult.count || 0} petition records`)
    }
    
    // Delete the duplicate committee records
    const deleteResult = await sql`
      DELETE FROM committees 
      WHERE id = ANY(${idsToDelete})
    `
    
    console.log(`✅ Deleted ${deleteResult.count || 0} duplicate committee records`)
    
    // Verify the fix
    const remainingCommittees = await sql`SELECT id, name FROM committees ORDER BY name`
    console.log(`\nRemaining committees: ${remainingCommittees.length}`)
    remainingCommittees.forEach((c: any, i: number) => {
      console.log(`${i + 1}. ${c.name}`)
    })
  } else {
    console.log('No duplicates found to delete')
  }
}

fixCommitteeDuplicates().catch(console.error)