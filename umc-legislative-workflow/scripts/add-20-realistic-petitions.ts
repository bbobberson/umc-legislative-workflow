import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function add20RealisticPetitions() {
  console.log('Adding 20 realistic submitted petitions...')
  
  const realisticPetitions = [
    {
      title: 'Simplify Ordination Requirements for Deacons',
      submitter_name: 'Rev. Maria Santos',
      submitter_email: 'maria.santos@umcchurch.org',
      submitter_organization: 'Eastern Pennsylvania Annual Conference',
      bod_paragraph: '¶324',
      petition_type: 'D',
      petition_text: 'Amend ¶324 to reduce the required candidacy period for deacon ordination from four years to two years for candidates who have completed a Master of Divinity degree with emphasis in diaconal ministry.',
      rationale: 'Current requirements create unnecessary barriers for well-prepared candidates and contribute to the shortage of ordained deacons in local churches.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Expand LGBTQ+ Inclusion in Church Leadership',
      submitter_name: 'Dr. Jonathan Hayes',
      submitter_email: 'jhayes@reconciling.org',
      submitter_organization: 'Reconciling Ministries Network',
      bod_paragraph: '¶304.3',
      petition_type: 'D',
      petition_text: 'Remove restrictions on LGBTQ+ persons serving in ordained ministry and eliminate language defining marriage as only between a man and woman.',
      rationale: 'Full inclusion of LGBTQ+ persons reflects Christ\'s radical welcome and enables the church to utilize all gifts for ministry.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Mandatory Climate Action for All Local Churches',
      submitter_name: 'Rev. Dr. Angela Thompson',
      submitter_email: 'athompson@earthkeeper.org',
      submitter_organization: 'Earth Keeper Ministries',
      bod_paragraph: '¶702.6',
      petition_type: 'R',
      petition_text: 'Establish mandatory environmental stewardship standards for all local churches including solar panel installation, recycling programs, and carbon footprint reduction by 2030.',
      rationale: 'The climate crisis demands immediate, coordinated action across all levels of the church to fulfill our responsibility as stewards of creation.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Lower Age Requirement for General Conference Delegates',
      submitter_name: 'Sarah Kim',
      submitter_email: 'sarah.kim@youngpeople.umc',
      submitter_organization: 'United Methodist Student Movement',
      bod_paragraph: '¶502.1',
      petition_type: 'C',
      petition_text: 'Amend the constitutional requirement for General Conference delegates from 18 years to 16 years of age, allowing younger voices in church governance.',
      rationale: 'Young people are vital to the future of the church and should have representation in our highest legislative body.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Establish Mental Health Ministry Standards',
      submitter_name: 'Rev. Dr. Mark Peterson',
      submitter_email: 'mpeterson@mentalhealth.umc',
      submitter_organization: 'Minnesota Annual Conference',
      bod_paragraph: '¶2553',
      petition_type: 'D',
      petition_text: 'Create mandatory mental health first aid training for all clergy and establish minimum standards for church-based mental health ministries.',
      rationale: 'The mental health crisis requires trained church leaders who can provide appropriate care and referrals.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Streamline Local Church Property Transfer Process',
      submitter_name: 'Rev. Patricia Rodriguez',
      submitter_email: 'prodriguez@property.umc',
      submitter_organization: 'Southwest Texas Annual Conference',
      bod_paragraph: '¶2543',
      petition_type: 'D',
      petition_text: 'Simplify the trust clause and property transfer procedures for local churches seeking to leave the denomination, reducing legal costs and timeline.',
      rationale: 'Current processes are costly, time-consuming, and create unnecessary conflict during already difficult transitions.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Mandate Accessibility Standards for Church Buildings',
      submitter_name: 'Dr. Rebecca Martinez',
      submitter_email: 'rmartinez@accessibility.org',
      submitter_organization: 'UMC Disability Advocacy Coalition',
      bod_paragraph: '¶2533',
      petition_type: 'D',
      petition_text: 'Require all church buildings to meet ADA accessibility standards within five years, with annual conference funding assistance available.',
      rationale: 'Physical barriers prevent full participation of persons with disabilities in worship and ministry.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Create Indigenous Peoples Sunday',
      submitter_name: 'Rev. David Crow Feather',
      submitter_email: 'dcrowfeather@indigenous.umc',
      submitter_organization: 'Oklahoma Indian Missionary Conference',
      bod_paragraph: '¶265.1',
      petition_type: 'R',
      petition_text: 'Establish an annual Indigenous Peoples Sunday to acknowledge historical harm, celebrate native cultures, and commit to ongoing justice work.',
      rationale: 'The church must reckon with its role in colonization and work toward healing relationships with indigenous communities.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Expand Online Ministry Authorization',
      submitter_name: 'Rev. Jennifer Chen',
      submitter_email: 'jchen@digitalministry.org',
      submitter_organization: 'California-Nevada Annual Conference',
      bod_paragraph: '¶341.5',
      petition_type: 'D',
      petition_text: 'Authorize clergy to serve virtual congregations across annual conference boundaries and establish standards for digital ministry.',
      rationale: 'Post-pandemic ministry requires flexible geographic boundaries to serve dispersed communities effectively.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Mandate Anti-Racism Training for All Clergy',
      submitter_name: 'Rev. Dr. Marcus Williams',
      submitter_email: 'mwilliams@antiracism.umc',
      submitter_organization: 'Black Methodists for Church Renewal',
      bod_paragraph: '¶335.1',
      petition_type: 'D',
      petition_text: 'Require annual anti-racism education for all ordained and licensed clergy, with curriculum developed by the General Commission on Religion and Race.',
      rationale: 'Dismantling racism requires intentional, ongoing education for church leaders to create truly inclusive congregations.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Reform Episcopal Election Process',
      submitter_name: 'Rev. Dr. Helen Chang',
      submitter_email: 'hchang@episcopalreform.org',
      submitter_organization: 'Greater New Jersey Annual Conference',
      bod_paragraph: '¶405',
      petition_type: 'D',
      petition_text: 'Implement term limits of 12 years for bishops and establish a transparent nomination process with broader input from laity and clergy.',
      rationale: 'Current episcopal structure lacks accountability measures and may benefit from regular leadership renewal.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Expand Deacon Ministry in Specialized Settings',
      submitter_name: 'Rev. Thomas Anderson',
      submitter_email: 'tanderson@specialized.umc',
      submitter_organization: 'West Virginia Annual Conference',
      bod_paragraph: '¶329',
      petition_type: 'D',
      petition_text: 'Authorize deacons to serve in specialized ministries including chaplaincy, community organizing, and social services without local church appointment requirements.',
      rationale: 'Rigid appointment structures limit deacons from serving in their areas of calling and expertise.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Create Sanctuary Church Network',
      submitter_name: 'Rev. Carmen Valdez',
      submitter_email: 'cvaldez@sanctuary.umc',
      submitter_organization: 'Rio Grande Annual Conference',
      bod_paragraph: '¶2702',
      petition_type: 'R',
      petition_text: 'Establish an official sanctuary church network to support congregations providing refuge for undocumented immigrants and asylum seekers.',
      rationale: 'Biblical hospitality demands that the church offer sanctuary to the vulnerable and marginalized.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Reduce General Conference Frequency',
      submitter_name: 'Bishop Elizabeth Morrison',
      submitter_email: 'emorrison@episcopal.umc',
      submitter_organization: 'North Alabama Annual Conference',
      bod_paragraph: '¶501',
      petition_type: 'C',
      petition_text: 'Change General Conference from quadrennial to sextennial (every six years) to reduce costs and allow more time for implementation of legislation.',
      rationale: 'Four-year cycles create financial strain on the church and insufficient time for meaningful change between conferences.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Establish Rural Ministry Support Fund',
      submitter_name: 'Rev. Robert Johnson',
      submitter_email: 'rjohnson@rural.umc',
      submitter_organization: 'Nebraska Annual Conference',
      bod_paragraph: '¶629',
      petition_type: 'D',
      petition_text: 'Create a dedicated apportionment fund to support clergy compensation and ministry resources in rural and small membership churches.',
      rationale: 'Rural churches face unique challenges requiring specialized support to maintain vital ministry presence.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Reform Judicial Council Selection Process',
      submitter_name: 'Dr. Rachel Green',
      submitter_email: 'rgreen@judicial.umc',
      submitter_organization: 'Northern Illinois Annual Conference',
      bod_paragraph: '¶2601',
      petition_type: 'D',
      petition_text: 'Establish transparent nomination procedures for Judicial Council members including public hearings and standardized qualifications.',
      rationale: 'The highest court of the church should have clear, transparent selection processes to ensure integrity and competence.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Expand Women\'s Leadership Development',
      submitter_name: 'Rev. Dr. Grace Park',
      submitter_email: 'gpark@womensleadership.org',
      submitter_organization: 'United Methodist Women',
      bod_paragraph: '¶2102',
      petition_type: 'R',
      petition_text: 'Establish annual conference requirements for women\'s leadership development programs and mentoring initiatives for clergy and lay leaders.',
      rationale: 'Despite ordaining women for decades, gender equity in church leadership remains a challenge requiring intentional intervention.',
      financial_impact: true,
      status: 'submitted'
    },
    {
      title: 'Create Youth Bishop Position',
      submitter_name: 'Michael Thompson',
      submitter_email: 'mthompson@youth.umc',
      submitter_organization: 'United Methodist Youth Fellowship',
      bod_paragraph: '¶403',
      petition_type: 'D',
      petition_text: 'Establish a non-voting Youth Bishop position (ages 18-30) to provide young adult perspective in the Council of Bishops.',
      rationale: 'Young adults are underrepresented in church leadership despite comprising the future of the denomination.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Mandate Financial Transparency for All Levels',
      submitter_name: 'Rev. Steven Davis',
      submitter_email: 'sdavis@transparency.umc',
      submitter_organization: 'Western North Carolina Annual Conference',
      bod_paragraph: '¶707',
      petition_type: 'D',
      petition_text: 'Require annual public disclosure of detailed financial reports for general agencies, annual conferences, and local churches above specified membership thresholds.',
      rationale: 'Transparency builds trust and enables informed decision-making by church members about their financial contributions.',
      financial_impact: false,
      status: 'submitted'
    },
    {
      title: 'Reform Seminary Education Requirements',
      submitter_name: 'Dr. Katherine White',
      submitter_email: 'kwhite@seminary.umc',
      submitter_organization: 'Association of United Methodist Theological Schools',
      bod_paragraph: '¶324.6',
      petition_type: 'D',
      petition_text: 'Allow alternative paths to ordination including supervised field education and competency-based assessment in lieu of traditional seminary degrees.',
      rationale: 'Rising education costs and debt burdens prevent qualified candidates from pursuing ordained ministry.',
      financial_impact: false,
      status: 'submitted'
    }
  ]

  for (const petition of realisticPetitions) {
    await sql`
      INSERT INTO petitions (
        title, submitter_name, submitter_email, submitter_organization,
        bod_paragraph, petition_type, petition_text, rationale, 
        financial_impact, status
      ) VALUES (
        ${petition.title}, ${petition.submitter_name}, ${petition.submitter_email}, 
        ${petition.submitter_organization}, ${petition.bod_paragraph}, ${petition.petition_type},
        ${petition.petition_text}, ${petition.rationale}, ${petition.financial_impact},
        ${petition.status}
      )
    `
  }

  console.log('✅ 20 realistic submitted petitions added successfully')
}

add20RealisticPetitions().catch(console.error)