import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function checkBodParagraphs() {
  console.log('Checking BoD paragraphs in database...')
  
  try {
    const paragraphs = await sql`
      SELECT id, number, title, section, created_at
      FROM bod_paragraphs
      ORDER BY number, created_at
    `
    
    console.log('Found BoD paragraphs:')
    paragraphs.forEach(paragraph => {
      console.log(`- ${paragraph.number}: ${paragraph.title} (${paragraph.section})`)
    })
    
    console.log(`\nTotal count: ${paragraphs.length}`)
    
    // Check for duplicates
    const numbers = paragraphs.map(p => p.number)
    const duplicateNumbers = numbers.filter((number, index) => numbers.indexOf(number) !== index)
    
    if (duplicateNumbers.length > 0) {
      console.log('\n🔴 Found duplicate paragraph numbers:')
      const uniqueDuplicates = Array.from(new Set(duplicateNumbers))
      uniqueDuplicates.forEach(number => {
        console.log(`- ${number}`)
        const dupes = paragraphs.filter(p => p.number === number)
        dupes.forEach(dupe => {
          console.log(`  - ID: ${dupe.id}, Created: ${dupe.created_at}`)
        })
      })
    } else {
      console.log('\n✅ No duplicate paragraph numbers found')
    }
    
  } catch (error) {
    console.error('❌ Error checking BoD paragraphs:', error)
    throw error
  }
}

checkBodParagraphs().catch(console.error)