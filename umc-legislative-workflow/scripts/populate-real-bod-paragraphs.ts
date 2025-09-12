import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function populateRealBodParagraphs() {
  console.log('Populating database with real BoD paragraphs...')
  
  try {
    // First clear existing paragraphs
    await sql`DELETE FROM bod_paragraphs`
    console.log('Cleared existing BoD paragraphs')
    
    // Real BoD paragraphs from the Constitutional and Doctrinal sections
    const realParagraphs = [
      // Constitutional paragraphs
      {
        number: '¶ 38',
        title: 'Central Conferences Outside United States',
        current_text: 'The work of the Church outside the United States of America may be formed into central conferences, the number and boundaries of which shall be determined by the Uniting Conference, the General Conference having authority subsequently to make changes in the number and boundaries.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 39',
        title: 'Changes in Jurisdictional Conferences',
        current_text: 'Changes in the number, names, and boundaries of the jurisdictional conferences may be effected by the General Conference upon the consent of a majority of the annual conferences of each of the jurisdictional conferences involved.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 40',
        title: 'Annual Conference and Episcopal Area Boundaries',
        current_text: 'The number, names, and boundaries of the annual conferences and episcopal areas shall be determined by the jurisdictional conferences in the United States of America and by the central conferences outside the United States of America according to the provisions under the respective powers and pursuant to the respective structures of the jurisdictional and the central conferences.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 41',
        title: 'Transfer of Local Churches',
        current_text: 'A local church may be transferred from one annual conference to another in which it is geographically located upon approval by a two-thirds vote of those present and voting in each of the following: a) the charge conference; b) the congregational meeting of the local church; c) each of the two annual conferences involved.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 42',
        title: 'District Conferences',
        current_text: 'There may be organized in an annual conference, district conferences composed of such persons and invested with such powers as the General Conference may determine.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 43',
        title: 'Charge Conferences',
        current_text: 'There shall be organized in each charge a charge conference composed of such persons and invested with such powers as the General Conference shall provide.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 44',
        title: 'Election of Church Officers',
        current_text: 'Unless the General Conference shall order otherwise, the officers of the church or churches constituting a charge shall be elected by the charge conference or by the professing members of said church or churches at a meeting called for that purpose, as may be arranged by the charge conference, unless the election is otherwise required by local church charters or state or provincial law.',
        section: 'The Constitution - Organization'
      },
      {
        number: '¶ 45',
        title: 'Continuance of Episcopacy',
        current_text: 'There shall be a continuance of an episcopacy in The United Methodist Church of like plan, powers, privileges, and duties as now exist in The Methodist Church and in The Evangelical United Brethren Church in all those matters in which they agree and may be considered identical; and the differences between these historic episcopacies are deemed to be reconciled and harmonized by and in this Plan of Union and Constitution.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 46',
        title: 'Election and Consecration of Bishops',
        current_text: 'The bishops shall be elected by the respective jurisdictional and central conferences and consecrated in the historic manner at such time and place as may be fixed by the General Conference for those elected by the jurisdictions and by each central conference for those elected by such central conference.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 47',
        title: 'Council of Bishops',
        current_text: 'There shall be a Council of Bishops composed of all the bishops of The United Methodist Church. The council shall meet at least once a year and plan for the general oversight and promotion of the temporal and spiritual interests of the entire Church and for carrying into effect the rules, regulations, and responsibilities prescribed and enjoined by the General Conference.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 48',
        title: 'College of Bishops',
        current_text: 'The bishops of each jurisdictional and central conference shall constitute a College of Bishops, and such College of Bishops shall arrange the plan of episcopal supervision of the annual conferences, missionary conferences, and missions within their respective territories.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 49',
        title: 'Episcopal Supervision and Transfer',
        current_text: 'The bishops shall have residential and presidential supervision in the jurisdictional or central conferences in which they are elected or to which they are transferred. Bishops may be transferred from one jurisdiction to another jurisdiction for presidential and residential supervision under specific conditions requiring approval by a majority vote of the members present and voting of the jurisdictional committees on episcopacy.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 51',
        title: 'Episcopal Decisions on Questions of Law',
        current_text: 'A bishop presiding over an annual, central, or jurisdictional conference shall decide all questions of law coming before the bishop in the regular business of a session, provided that such questions be presented in writing and that the decisions be recorded in the journal of the conference.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 54',
        title: 'Episcopal Appointments',
        current_text: 'The bishops shall appoint, after consultation with the district superintendents, ministers to the charges; and they shall have such responsibilities and authorities as the General Conference shall prescribe.',
        section: 'The Constitution - Episcopal Supervision'
      },
      {
        number: '¶ 59',
        title: 'Constitutional Amendments',
        current_text: 'Amendments to the Constitution shall be made upon a two-thirds majority of the General Conference present and voting and a two-thirds affirmative vote of the aggregate number of members of the several annual conferences present and voting, except in the case of the first and second Restrictive Rules, which shall require a three-fourths majority.',
        section: 'The Constitution - Amendments'
      },

      // General Book and Doctrinal paragraphs
      {
        number: '¶ 101',
        title: 'General Book of Discipline',
        current_text: 'The General Book of Discipline reflects our Wesleyan way of serving Christ through doctrine and disciplined Christian life. We are a worldwide denomination united by doctrine, discipline, and mission through our connectional covenant. The General Book of Discipline expresses that unity.',
        section: 'General Book of Discipline'
      },
      {
        number: '¶ 102',
        title: 'Our Doctrinal Heritage',
        current_text: 'United Methodists profess the historic Christian faith in God, incarnate in Jesus Christ for our salvation and ever at work in human history in the Holy Spirit. Living in a covenant of grace under the Lordship of Jesus Christ, we participate in the first fruits of God\'s coming reign and pray in hope for its full realization on earth as in heaven.',
        section: 'Doctrinal Standards and Our Theological Task'
      },

      // Social Principles (examples)
      {
        number: '¶ 160',
        title: 'The Natural World',
        current_text: 'All creation is the Lord\'s, and we are responsible for the ways in which we use and abuse it. Water, air, soil, minerals, energy resources, plants, animal life, and space are to be valued and conserved because they are God\'s creation and not solely because they are useful to human beings.',
        section: 'Social Principles'
      },
      {
        number: '¶ 161',
        title: 'The Nurturing Community',
        current_text: 'The community provides the potential for nurturing human beings into the fullness of their humanity. We believe we have a responsibility to innovate, sponsor, and evaluate new forms of community that will encourage development of the fullest potential in individuals.',
        section: 'Social Principles'
      },
      {
        number: '¶ 162',
        title: 'The Social Community',
        current_text: 'We affirm all persons as equally valuable in the sight of God. We therefore work toward societies in which each person\'s value is recognized, maintained, and strengthened. We support the basic rights of all persons to equal access to housing, education, communication, employment, medical care, legal redress for grievances, and physical protection.',
        section: 'Social Principles'
      },
      {
        number: '¶ 163',
        title: 'The Economic Community',
        current_text: 'We claim all economic systems to be under the judgment of God no less than other facets of the created order. Therefore, we recognize the responsibility of governments to develop and implement sound fiscal and monetary policies that provide for the economic life of individuals and corporate entities.',
        section: 'Social Principles'
      },
      {
        number: '¶ 164',
        title: 'The Political Community',
        current_text: 'We hold governments responsible for the protection of the rights of the people to free and fair elections and to the freedoms of speech, religion, assembly, communications media, and petition for redress of grievances without fear of reprisal; to the right to privacy; and to the guarantee of the rights to adequate food, clothing, shelter, education, and health care.',
        section: 'Social Principles'
      },

      // Local Church paragraphs (examples)
      {
        number: '¶ 201',
        title: 'The Church',
        current_text: 'The church of Jesus Christ exists in and for the world, and its very dividedness is a hindrance to its mission in that world. The prayer of our Lord is "that they all may be one" (John 17:21). We call on the church, wherever it exists, to work toward a unity based on the love of God in Jesus Christ.',
        section: 'The Local Church'
      },
      {
        number: '¶ 214',
        title: 'Meaning of Church Membership',
        current_text: 'The church is the community of all true believers under the Lordship of Christ. It is the redeemed and redeeming fellowship in which the Word of God is preached by persons divinely called and the sacraments are duly administered according to Christ\'s own appointment.',
        section: 'The Local Church'
      },
      {
        number: '¶ 215',
        title: 'Qualifications for Church Membership',
        current_text: 'Membership in The United Methodist Church shall be open to all people without regard to race, color, gender, age, national origin, or economic condition. All persons who respond to God\'s grace through faith in Jesus Christ as Lord and Savior and are led to commit themselves to lives as Christian disciples are appropriate candidates for membership.',
        section: 'The Local Church'
      },

      // Ministry paragraphs (examples)
      {
        number: '¶ 301',
        title: 'The Ministry of All Christians',
        current_text: 'All Christians are called to ministry by virtue of their baptism. This ministry is fulfilled through the graces of the Spirit working in and through each person. It finds expression both in the Church and in daily life and work.',
        section: 'The Ministry of the Ordained'
      },
      {
        number: '¶ 303',
        title: 'The Call to Ordained Ministry',
        current_text: 'God calls some persons to the ordained ministry. This call is evidenced by the fruits of the Spirit in the person\'s life and confirmed by the community of faith and the orders of ministry.',
        section: 'The Ministry of the Ordained'
      },
      {
        number: '¶ 310',
        title: 'Requirements for Ordination',
        current_text: 'Ordination to this ministry is a gift from God to the Church. In ordination, the Church affirms and continues the apostolic ministry through persons empowered by the Holy Spirit.',
        section: 'The Ministry of the Ordained'
      }
    ];

    // Insert all paragraphs
    for (const paragraph of realParagraphs) {
      await sql`
        INSERT INTO bod_paragraphs (number, title, current_text, section) 
        VALUES (${paragraph.number}, ${paragraph.title}, ${paragraph.current_text}, ${paragraph.section})
      `
    }

    console.log(`✅ Successfully inserted ${realParagraphs.length} real BoD paragraphs`)
    
    // Verify the results
    const count = await sql`SELECT COUNT(*) as count FROM bod_paragraphs`
    console.log(`Total paragraphs in database: ${count[0].count}`)
    
    // Show some examples
    const examples = await sql`
      SELECT number, title, section 
      FROM bod_paragraphs 
      ORDER BY number 
      LIMIT 10
    `
    
    console.log('\nSample paragraphs:')
    examples.forEach(p => {
      console.log(`- ${p.number}: ${p.title} (${p.section})`)
    })
    
  } catch (error) {
    console.error('❌ Error populating BoD paragraphs:', error)
    throw error
  }
}

populateRealBodParagraphs().catch(console.error)