import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.POSTGRES_URL!)

// Sample realistic petitions with simple amendments
const petitions = [
  {
    title: "Add Digital Ministry Training to Clergy Education",
    submitter_name: "Rev. Sarah Kim",
    submitter_email: "sarahkim@methodist.org",
    submitter_organization: "Greater New Jersey Annual Conference",
    bod_paragraph: "¶324.6",
    rationale: "With the rapid growth of online and hybrid worship, clergy need formal training in digital ministry tools and virtual pastoral care to effectively serve congregations in the digital age.",
    originalText: "The candidate shall demonstrate competency in oral communication, worship leadership, and spiritual formation.",
    modifiedText: "The candidate shall demonstrate competency in oral communication, worship leadership, digital ministry tools, and spiritual formation.",
    changes: [
      { type: 'insert', newText: 'digital ministry tools, ', position: 85 }
    ]
  },
  {
    title: "Extend Pastor Appointment Term Limit to 10 Years",
    submitter_name: "Dr. Michael Rodriguez",
    submitter_email: "mrodriguez@email.com", 
    submitter_organization: "California-Pacific Annual Conference",
    bod_paragraph: "¶161",
    rationale: "Longer appointment terms allow pastors to build deeper relationships with congregations and implement long-term ministry plans, leading to more effective pastoral ministry and church growth.",
    originalText: "No pastor shall be appointed to the same pastoral charge for more than six consecutive years.",
    modifiedText: "No pastor shall be appointed to the same pastoral charge for more than ten consecutive years.",
    changes: [
      { type: 'delete', originalText: 'six', position: 71 },
      { type: 'insert', newText: 'ten', position: 71 }
    ]
  },
  {
    title: "Lower Minimum Age for General Conference Delegates to 21",
    submitter_name: "Taylor Washington",
    submitter_email: "taylor.w@umyoungadults.org",
    submitter_organization: "United Methodist Young Adult Ministries",
    bod_paragraph: "¶502.1",
    rationale: "Young adults aged 21-25 bring fresh perspectives and represent the future of our church. Lowering the age requirement increases youth representation and engagement in church governance.",
    originalText: "Delegates to General Conference must be at least twenty-five years of age.",
    modifiedText: "Delegates to General Conference must be at least twenty-one years of age.",
    changes: [
      { type: 'delete', originalText: 'twenty-five', position: 49 },
      { type: 'insert', newText: 'twenty-one', position: 49 }
    ]
  },
  {
    title: "Add Mental Health Training to Pastoral Care Requirements",
    submitter_name: "Rev. Dr. Jennifer Martinez",
    submitter_email: "jmartinez@seminary.edu",
    submitter_organization: "Board of Higher Education and Ministry",
    bod_paragraph: "¶335.1",
    rationale: "Mental health awareness is crucial for effective pastoral care. This training will help pastors recognize mental health issues and provide appropriate referrals while maintaining professional boundaries.",
    originalText: "All pastors shall complete training in pastoral care and counseling.",
    modifiedText: "All pastors shall complete training in pastoral care, mental health awareness, and counseling.",
    changes: [
      { type: 'insert', newText: ', mental health awareness', position: 50 }
    ]
  },
  {
    title: "Include Creation Care in Social Principles Education",
    submitter_name: "Rev. David Chen",
    submitter_email: "dchen@greenchurch.org",
    submitter_organization: "Creation Care Alliance",
    bod_paragraph: "¶265.1",
    rationale: "Environmental stewardship is a critical Christian responsibility. Including creation care in mandatory education ensures all members understand their role in protecting God's creation.",
    originalText: "All members shall receive education in Christian discipleship and social justice.",
    modifiedText: "All members shall receive education in Christian discipleship, creation care, and social justice.",
    changes: [
      { type: 'insert', newText: ', creation care', position: 70 }
    ]
  },
  {
    title: "Expand Online Worship Authorization Beyond Emergency",
    submitter_name: "Rev. Lisa Thompson",
    submitter_email: "lthompson@digitalchurch.net",
    submitter_organization: "Digital Ministry Collective",
    bod_paragraph: "¶341.5",
    rationale: "Online worship has proven effective for reaching homebound members and expanding ministry reach. This change allows continued digital ministry beyond emergency circumstances.",
    originalText: "Online worship may be authorized only during declared emergencies.",
    modifiedText: "Online worship may be authorized for regular ministry and during declared emergencies.",
    changes: [
      { type: 'insert', newText: 'for regular ministry and ', position: 34 }
    ]
  },
  {
    title: "Add Anti-Racism Training to Clergy Requirements",
    submitter_name: "Rev. Angela Davis",
    submitter_email: "adavis@justiceministry.org",
    submitter_organization: "Commission on Religion and Race",
    bod_paragraph: "¶324",
    rationale: "Anti-racism education is essential for creating inclusive congregations and addressing systemic inequities within our church and communities.",
    originalText: "Candidates for ordination must complete courses in theology, church history, and practical ministry.",
    modifiedText: "Candidates for ordination must complete courses in theology, church history, anti-racism education, and practical ministry.",
    changes: [
      { type: 'insert', newText: ', anti-racism education', position: 85 }
    ]
  },
  {
    title: "Increase Frequency of Church Financial Audits",
    submitter_name: "CPA Robert Johnson",
    submitter_email: "rjohnson@accountability.org",
    submitter_organization: "United Methodist Financial Accountability Network",
    bod_paragraph: "¶707",
    rationale: "More frequent audits increase transparency and prevent financial mismanagement, strengthening trust between congregations and leadership.",
    originalText: "Local churches shall undergo financial audits every three years.",
    modifiedText: "Local churches shall undergo financial audits every two years.",
    changes: [
      { type: 'delete', originalText: 'three', position: 58 },
      { type: 'insert', newText: 'two', position: 58 }
    ]
  },
  {
    title: "Add Indigenous Peoples Recognition to Church Calendar",
    submitter_name: "Rev. Maria Spotted Eagle",
    submitter_email: "mspottedeagle@nativeministry.org",
    submitter_organization: "Native American International Caucus",
    bod_paragraph: "¶265.1",
    rationale: "Recognizing Indigenous Peoples promotes historical awareness and supports reconciliation with Native American communities affected by colonization.",
    originalText: "The church calendar shall include World Communion Sunday and Human Relations Day.",
    modifiedText: "The church calendar shall include Indigenous Peoples Sunday, World Communion Sunday, and Human Relations Day.",
    changes: [
      { type: 'insert', newText: 'Indigenous Peoples Sunday, ', position: 36 }
    ]
  },
  {
    title: "Expand Deacon Ministry in Hospital Settings",
    submitter_name: "Rev. Deacon Patricia Lee",
    submitter_email: "plee@hospitalministry.org",
    submitter_organization: "Order of Deacons",
    bod_paragraph: "¶329",
    rationale: "Deacons are uniquely trained for service ministries. Expanding their role in healthcare settings addresses growing spiritual care needs in medical environments.",
    originalText: "Deacons may serve in educational and social service institutions.",
    modifiedText: "Deacons may serve in educational, healthcare, and social service institutions.",
    changes: [
      { type: 'insert', newText: ', healthcare', position: 44 }
    ]
  },
  {
    title: "Reduce General Conference Delegate Count by 20%",
    submitter_name: "Rev. Dr. James Wilson",
    submitter_email: "jwilson@efficiency.org",
    submitter_organization: "General Conference Reform Coalition",
    bod_paragraph: "¶501",
    rationale: "Smaller delegate counts reduce costs, improve decision-making efficiency, and make General Conference more manageable while maintaining proportional representation.",
    originalText: "Each annual conference shall elect one delegate for every 500 members.",
    modifiedText: "Each annual conference shall elect one delegate for every 625 members.",
    changes: [
      { type: 'delete', originalText: '500', position: 56 },
      { type: 'insert', newText: '625', position: 56 }
    ]
  },
  {
    title: "Add Youth Representative to Bishop Selection Committee",
    submitter_name: "Jessica Rodriguez",
    submitter_email: "jrodriguez@umyouth.org",
    submitter_organization: "United Methodist Youth",
    bod_paragraph: "¶403",
    rationale: "Youth voices in episcopal selection ensure bishops understand and can effectively minister to younger generations who are the church's future.",
    originalText: "The episcopal selection committee shall include clergy and lay representatives.",
    modifiedText: "The episcopal selection committee shall include clergy, lay, and youth representatives.",
    changes: [
      { type: 'insert', newText: ', and youth', position: 67 }
    ]
  },
  {
    title: "Extend Property Holding Period for Closed Churches",
    submitter_name: "Rev. Mark Stevens",
    submitter_email: "mstevens@churchrevitalization.org",
    submitter_organization: "Path 1 Church Revitalization",
    bod_paragraph: "¶2543",
    rationale: "Longer holding periods allow more time for church restart efforts and prevent hasty property sales that eliminate future ministry opportunities.",
    originalText: "Church properties shall be held for two years before sale.",
    modifiedText: "Church properties shall be held for five years before sale.",
    changes: [
      { type: 'delete', originalText: 'two', position: 31 },
      { type: 'insert', newText: 'five', position: 31 }
    ]
  },
  {
    title: "Add Accessibility Standards to Building Requirements",
    submitter_name: "Rev. Susan Martinez",
    submitter_email: "smartinez@inclusion.org",
    submitter_organization: "Disability Advocacy Coalition",
    bod_paragraph: "¶2533",
    rationale: "Accessibility standards ensure full participation of persons with disabilities in worship and ministry, reflecting our commitment to radical hospitality and inclusion.",
    originalText: "Church buildings shall meet local safety and zoning requirements.",
    modifiedText: "Church buildings shall meet local safety, accessibility, and zoning requirements.",
    changes: [
      { type: 'insert', newText: ', accessibility', position: 42 }
    ]
  },
  {
    title: "Require Mental Health First Aid Training for Leaders",
    submitter_name: "Dr. Rebecca Thompson",
    submitter_email: "rthompson@mentalhealth.org",
    submitter_organization: "Mental Health Ministry Network",
    bod_paragraph: "¶2553",
    rationale: "Mental health first aid training equips church leaders to recognize mental health crises and provide appropriate initial support while connecting people to professional resources.",
    originalText: "Church leaders shall complete basic safety training.",
    modifiedText: "Church leaders shall complete basic safety and mental health first aid training.",
    changes: [
      { type: 'insert', newText: ' and mental health first aid', position: 42 }
    ]
  },
  {
    title: "Expand Climate Action Requirements for Churches",
    submitter_name: "Rev. Dr. Carol Green",
    submitter_email: "cgreen@earthkeeping.org",
    submitter_organization: "Creation Justice Ministries",
    bod_paragraph: "¶702.6",
    rationale: "Mandatory climate action addresses the urgent environmental crisis and demonstrates Christian stewardship of creation through concrete congregational commitments.",
    originalText: "Churches are encouraged to practice environmental stewardship.",
    modifiedText: "Churches are required to develop and implement environmental stewardship plans.",
    changes: [
      { type: 'delete', originalText: 'encouraged to practice', position: 13 },
      { type: 'insert', newText: 'required to develop and implement', position: 13 },
      { type: 'insert', newText: ' plans', position: 67 }
    ]
  },
  {
    title: "Add Gender Identity Protection to Non-Discrimination Policy",
    submitter_name: "Rev. Alex Morgan",
    submitter_email: "amorgan@inclusion.org",
    submitter_organization: "Reconciling Ministries Network",
    bod_paragraph: "¶304.3",
    rationale: "Explicit protection for gender identity ensures transgender individuals can fully participate in church life without fear of discrimination or exclusion.",
    originalText: "The church prohibits discrimination based on race, gender, and age.",
    modifiedText: "The church prohibits discrimination based on race, gender, gender identity, and age.",
    changes: [
      { type: 'insert', newText: ', gender identity', position: 57 }
    ]
  },
  {
    title: "Simplify Ordination Interview Process for Deacons",
    submitter_name: "Rev. Deacon Karen Williams",
    submitter_email: "kwilliams@orderofdeacons.org",
    submitter_organization: "Fellowship of United Methodist Deacons",
    bod_paragraph: "¶324",
    rationale: "Streamlining the interview process reduces barriers for deacon candidates while maintaining quality standards, encouraging more people to answer the call to servant ministry.",
    originalText: "Deacon candidates must complete five separate interview sessions.",
    modifiedText: "Deacon candidates must complete three separate interview sessions.",
    changes: [
      { type: 'delete', originalText: 'five', position: 30 },
      { type: 'insert', newText: 'three', position: 30 }
    ]
  },
  {
    title: "Extend Rural Church Support Fund Duration",
    submitter_name: "Rev. John Farmer",
    submitter_email: "jfarmer@ruralministry.org",
    submitter_organization: "Rural Church Coalition",
    bod_paragraph: "¶629",
    rationale: "Extended support duration provides rural congregations more time to achieve sustainability, recognizing the unique challenges of ministry in sparsely populated areas.",
    originalText: "Rural church support funds may be provided for up to three years.",
    modifiedText: "Rural church support funds may be provided for up to five years.",
    changes: [
      { type: 'delete', originalText: 'three', position: 56 },
      { type: 'insert', newText: 'five', position: 56 }
    ]
  },
  {
    title: "Add Technology Training to General Conference Requirements",
    submitter_name: "Rev. Dr. Christine Lee",
    submitter_email: "clee@digitalchurch.org",
    submitter_organization: "Digital Ministry Network",
    bod_paragraph: "¶304",
    rationale: "Technology literacy is essential for modern church participation. Training ensures all delegates can effectively engage with digital voting systems and virtual participation options.",
    originalText: "General Conference delegates must complete parliamentary procedure training.",
    modifiedText: "General Conference delegates must complete parliamentary procedure and technology training.",
    changes: [
      { type: 'insert', newText: ' and technology', position: 70 }
    ]
  },
  {
    title: "Expand Annual Conference Legislative Authority",
    submitter_name: "Bishop Rachel Adams",
    submitter_email: "radams@conference.org",
    submitter_organization: "Council of Bishops",
    bod_paragraph: "¶213",
    rationale: "Enhanced regional authority allows annual conferences to adapt ministry approaches to local contexts while maintaining denominational unity and core doctrinal standards.",
    originalText: "Annual conferences may adopt policies consistent with the Book of Discipline.",
    modifiedText: "Annual conferences may adopt policies and procedures consistent with the Book of Discipline.",
    changes: [
      { type: 'insert', newText: ' and procedures', position: 39 }
    ]
  },
  {
    title: "Increase Judicial Council Geographic Diversity",
    submitter_name: "Rev. Dr. Michael Johnson",
    submitter_email: "mjohnson@justice.org",
    submitter_organization: "Global Methodist Justice Network",
    bod_paragraph: "¶2601",
    rationale: "Geographic diversity ensures the Judicial Council represents the global nature of United Methodism and brings varied cultural perspectives to constitutional interpretation.",
    originalText: "The Judicial Council shall have representation from at least three jurisdictions.",
    modifiedText: "The Judicial Council shall have representation from at least four jurisdictions and central conferences.",
    changes: [
      { type: 'delete', originalText: 'three', position: 56 },
      { type: 'insert', newText: 'four', position: 56 },
      { type: 'insert', newText: ' and central conferences', position: 73 }
    ]
  },
  {
    title: "Add Sanctuary Church Guidelines to Social Principles",
    submitter_name: "Rev. Maria Gonzalez",
    submitter_email: "mgonzalez@sanctuary.org",
    submitter_organization: "Sanctuary Movement Coalition",
    bod_paragraph: "¶2702",
    rationale: "Sanctuary church guidelines provide legal and theological framework for congregations offering hospitality to immigrants facing persecution or unjust deportation.",
    originalText: "Churches may provide humanitarian aid to those in need.",
    modifiedText: "Churches may provide humanitarian aid and sanctuary to those facing persecution or injustice.",
    changes: [
      { type: 'insert', newText: ' and sanctuary', position: 41 },
      { type: 'insert', newText: ' facing persecution or injustice', position: 63 }
    ]
  },
  {
    title: "Require Inclusive Language in Official Documents",
    submitter_name: "Dr. Sarah Johnson",
    submitter_email: "sjohnson@inclusiveministry.org",
    submitter_organization: "Commission on the Status and Role of Women",
    bod_paragraph: "¶2102",
    rationale: "Inclusive language reflects our commitment to gender equality and ensures all people see themselves represented in official church communications and liturgy.",
    originalText: "Official church documents shall use traditional biblical language.",
    modifiedText: "Official church documents shall use inclusive and traditional biblical language.",
    changes: [
      { type: 'insert', newText: 'inclusive and ', position: 37 }
    ]
  },
  {
    title: "Expand Housing Allowance Flexibility for Clergy",
    submitter_name: "Rev. Thomas Anderson",
    submitter_email: "tanderson@clergysupport.org",
    submitter_organization: "Clergy Family Alliance",
    bod_paragraph: "¶415",
    rationale: "Flexible housing allowances accommodate diverse family situations and regional cost variations, reducing financial stress on clergy families and improving pastoral effectiveness.",
    originalText: "Housing allowances may be adjusted annually in January.",
    modifiedText: "Housing allowances may be adjusted quarterly as circumstances require.",
    changes: [
      { type: 'delete', originalText: 'annually in January', position: 35 },
      { type: 'insert', newText: 'quarterly as circumstances require', position: 35 }
    ]
  },
  {
    title: "Add LGBTQ+ Inclusive Language to Wedding Policies",
    submitter_name: "Rev. Jordan Smith",
    submitter_email: "jsmith@loveislove.org",
    submitter_organization: "Reconciling Ministries Network",
    bod_paragraph: "¶304.3",
    rationale: "Inclusive wedding policies ensure LGBTQ+ couples receive the same pastoral care and ceremonial options as all couples, reflecting God's unconditional love for all people.",
    originalText: "Pastors may officiate weddings between a man and a woman.",
    modifiedText: "Pastors may officiate weddings between two consenting adults.",
    changes: [
      { type: 'delete', originalText: 'a man and a woman', position: 35 },
      { type: 'insert', newText: 'two consenting adults', position: 35 }
    ]
  },
  {
    title: "Extend Probationary Member Service Period",
    submitter_name: "Rev. Emily Davis",
    submitter_email: "edavis@ministry.org",
    submitter_organization: "Board of Ordained Ministry",
    bod_paragraph: "¶324.6",
    rationale: "Extended probationary periods provide additional mentoring time and practical experience, better preparing new clergy for the challenges of ordained ministry.",
    originalText: "Probationary members serve for two years before ordination.",
    modifiedText: "Probationary members serve for three years before ordination.",
    changes: [
      { type: 'delete', originalText: 'two', position: 30 },
      { type: 'insert', newText: 'three', position: 30 }
    ]
  },
  {
    title: "Add Environmental Impact Assessment to Building Projects",
    submitter_name: "Rev. Dr. Peter Green",
    submitter_email: "pgreen@creation.org",
    submitter_organization: "Creation Care Network",
    bod_paragraph: "¶2533",
    rationale: "Environmental assessments ensure church construction projects align with creation care values and minimize ecological impact through sustainable building practices.",
    originalText: "Building projects must receive trustee and finance committee approval.",
    modifiedText: "Building projects must receive environmental assessment, trustee, and finance committee approval.",
    changes: [
      { type: 'insert', newText: 'environmental assessment, ', position: 29 }
    ]
  },
  {
    title: "Establish Young Adult Ministry Coordinator Position",
    submitter_name: "Taylor Martinez",
    submitter_email: "tmartinez@youngadults.org",
    submitter_organization: "Young Adult Ministry Coalition",
    bod_paragraph: "¶629",
    rationale: "Dedicated young adult coordinators address the unique needs of 18-35 year olds, helping retain young adults in the church and develop age-appropriate programming.",
    originalText: "Conferences may establish specialized ministry positions as needed.",
    modifiedText: "Conferences may establish specialized ministry positions, including young adult coordinators, as needed.",
    changes: [
      { type: 'insert', newText: ', including young adult coordinators', position: 55 }
    ]
  }
]

async function createRealisticPetitions() {
  try {
    console.log('Creating 30 realistic petitions with amendments...')
    
    for (let i = 0; i < petitions.length; i++) {
      const petition = petitions[i]
      
      const result = await sql`
        INSERT INTO petitions (
          title,
          submitter_name,
          submitter_email,
          submitter_organization,
          bod_paragraph,
          petition_type,
          rationale,
          financial_impact,
          status,
          submission_date,
          amendment_data,
          original_paragraph_text,
          modified_paragraph_text
        ) VALUES (
          ${petition.title},
          ${petition.submitter_name},
          ${petition.submitter_email},
          ${petition.submitter_organization},
          ${petition.bod_paragraph},
          ${Math.random() < 0.6 ? 'D' : Math.random() < 0.3 ? 'C' : 'R'},
          ${petition.rationale},
          ${Math.random() < 0.3},
          'submitted',
          NOW(),
          ${JSON.stringify(petition.changes)},
          ${petition.originalText},
          ${petition.modifiedText}
        )
      `
      
      console.log(`${i + 1}. Created: ${petition.title}`)
    }
    
    console.log('\nSuccessfully created all 30 petitions!')
    
    // Show final count
    const totalCount = await sql`SELECT COUNT(*) as count FROM petitions`
    console.log(`Total petitions in database: ${totalCount[0].count}`)
    
  } catch (error) {
    console.error('Error creating petitions:', error)
  }
}

createRealisticPetitions()