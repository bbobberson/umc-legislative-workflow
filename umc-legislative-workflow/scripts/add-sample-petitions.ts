import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function addSamplePetitions() {
  console.log('Adding sample petitions...')
  
  // Get committee IDs for assignments
  const committees = await sql`SELECT id, name FROM committees ORDER BY name`
  const faithOrder = committees.find(c => c.name === 'Faith and Order')
  const churchSociety = committees.find(c => c.name === 'Church and Society')
  
  const samplePetitions = [
    {
      title: 'Update language in ¶161 regarding pastoral appointments',
      submitter_name: 'Rev. Sarah Johnson',
      submitter_email: 'sarah.johnson@email.com',
      submitter_organization: 'North Georgia Annual Conference',
      bod_paragraph: '¶161',
      petition_type: 'D',
      petition_text: 'Amend ¶161 to include language about collaborative appointment processes...',
      rationale: 'Current language does not reflect modern collaborative practices in pastoral appointments.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Resolution on Climate Action',
      submitter_name: 'Dr. Michael Chen',
      submitter_email: 'mchen@email.com',
      submitter_organization: 'California-Pacific Annual Conference',
      bod_paragraph: '¶702',
      petition_type: 'R',
      petition_text: 'The United Methodist Church calls for immediate action on climate change...',
      rationale: 'Urgent environmental concerns require church leadership and advocacy.',
      financial_impact: true,
      status: 'reviewed',
      committee_id: churchSociety?.id
    },
    {
      title: 'Constitutional Amendment on Annual Conference Authority',
      submitter_name: 'Bishop Patricia Williams',
      submitter_email: 'pwilliams@email.com',
      submitter_organization: 'Texas Annual Conference',
      bod_paragraph: '¶213',
      petition_type: 'C',
      petition_text: 'Amend Article IV to expand annual conference legislative authority...',
      rationale: 'Current constitutional limitations prevent effective regional governance.',
      financial_impact: false,
      status: 'assigned',
      committee_id: faithOrder?.id
    },
    {
      title: 'Modernize General Conference Technology Requirements',
      submitter_name: 'Rev. James Martinez',
      submitter_email: 'jmartinez@email.com',
      submitter_organization: 'Rio Texas Annual Conference',
      bod_paragraph: '¶304',
      petition_type: 'D',
      petition_text: 'Add provisions for digital participation and voting in General Conference...',
      rationale: 'Recent events have shown the need for flexible conference participation options.',
      financial_impact: true,
      status: 'submitted'
    }
  ]

  for (const petition of samplePetitions) {
    await sql`
      INSERT INTO petitions (
        title, submitter_name, submitter_email, submitter_organization,
        bod_paragraph, petition_type, petition_text, rationale, 
        financial_impact, status, committee_id
      ) VALUES (
        ${petition.title}, ${petition.submitter_name}, ${petition.submitter_email}, 
        ${petition.submitter_organization}, ${petition.bod_paragraph}, ${petition.petition_type},
        ${petition.petition_text}, ${petition.rationale}, ${petition.financial_impact},
        ${petition.status}, ${petition.committee_id || null}
      )
    `
  }

  console.log('✅ Sample petitions added successfully')
}

addSamplePetitions().catch(console.error)