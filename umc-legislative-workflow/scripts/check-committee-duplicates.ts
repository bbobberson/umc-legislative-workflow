import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function checkCommitteeDuplicates() {
  console.log('Checking for duplicate committees...')
  
  // Get all committees
  const committees = await sql`SELECT id, name, abbreviation FROM committees ORDER BY name`
  
  console.log('\nAll committees:')
  committees.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (ID: ${c.id})`)
  })
  
  // Check for duplicates by name
  const nameGroups = committees.reduce((groups: any, committee: any) => {
    const name = committee.name
    if (!groups[name]) {
      groups[name] = []
    }
    groups[name].push(committee)
    return groups
  }, {})
  
  console.log('\nDuplicate analysis:')
  Object.entries(nameGroups).forEach(([name, committees]: [string, any]) => {
    if (committees.length > 1) {
      console.log(`❌ DUPLICATE: "${name}" appears ${committees.length} times:`)
      committees.forEach((c: any) => console.log(`   - ID: ${c.id}`))
    }
  })
  
  const duplicateCount = Object.values(nameGroups).filter((committees: any) => committees.length > 1).length
  if (duplicateCount === 0) {
    console.log('✅ No duplicates found in database')
  } else {
    console.log(`❌ Found ${duplicateCount} duplicate committee names`)
  }
}

checkCommitteeDuplicates().catch(console.error)