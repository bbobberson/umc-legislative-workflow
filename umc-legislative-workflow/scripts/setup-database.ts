import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

async function setupDatabase() {
  console.log('Setting up database schema...')

  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS bod_paragraphs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        number VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        current_text TEXT NOT NULL,
        section VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS committees (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        abbreviation VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS petitions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        submitter_name VARCHAR(255) NOT NULL,
        submitter_email VARCHAR(255) NOT NULL,
        submitter_organization VARCHAR(255),
        bod_paragraph VARCHAR(20),
        petition_type VARCHAR(1) CHECK (petition_type IN ('D', 'C', 'R', 'O')),
        rationale TEXT,
        financial_impact BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'assigned', 'in_committee', 'voted', 'approved', 'rejected')),
        committee_id UUID,
        amendment_data JSONB,
        original_paragraph_text TEXT,
        modified_paragraph_text TEXT,
        submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (committee_id) REFERENCES committees(id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS committee_votes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        petition_id UUID NOT NULL,
        committee_id UUID NOT NULL,
        action VARCHAR(20) CHECK (action IN ('adopt', 'refer', 'not_support', 'assign_to_reference')) NOT NULL,
        vote_tally JSONB NOT NULL,
        amendment_text TEXT,
        amendment_type VARCHAR(15) CHECK (amendment_type IN ('addition', 'deletion', 'substitution')),
        consent_calendar_eligible BOOLEAN DEFAULT FALSE,
        consent_calendar_category VARCHAR(1) CHECK (consent_calendar_category IN ('A', 'B', 'C')),
        recorded_by VARCHAR(255) NOT NULL,
        recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved BOOLEAN DEFAULT FALSE,
        approved_by VARCHAR(255),
        approved_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (petition_id) REFERENCES petitions(id),
        FOREIGN KEY (committee_id) REFERENCES committees(id)
      )
    `

    console.log('✅ Tables created successfully')

    // Insert sample committees
    await sql`
      INSERT INTO committees (name, abbreviation) VALUES
      ('Faith and Order', 'F&O'),
      ('Church and Society', 'C&S'),
      ('Discipleship', 'DISC'),
      ('Global Ministries', 'GM'),
      ('Higher Education and Ministry', 'HEM'),
      ('Connectional Table', 'CT'),
      ('Judicial Administration', 'JA'),
      ('Financial Administration', 'FA')
      ON CONFLICT DO NOTHING
    `

    // Insert sample BoD paragraphs
    await sql`
      INSERT INTO bod_paragraphs (number, title, current_text, section) VALUES
      ('¶161', 'Appointments', 'Appointments to pastoral charges shall be made by the bishop, who is empowered to make and fix all appointments in the annual conference.', 'The Ministry'),
      ('¶213', 'Annual Conference', 'The annual conference is the fundamental body in the Church and as such shall have reserved to it the right to vote on all constitutional amendments.', 'Local Church'),
      ('¶304', 'General Conference', 'The General Conference shall meet in regular session once every four years at such time and in such place as shall have been determined by the General Conference.', 'The Conferences'),
      ('¶702', 'Social Principles', 'We believe in God, Creator of the world; and in Jesus Christ, the Redeemer of creation. We believe in the Holy Spirit, through whom we acknowledge God''s gifts.', 'Social Principles'),
      ('¶230', 'Local Church Property', 'All property of United Methodist local churches and other United Methodist agencies and institutions is held, in trust, for the benefit of the entire denomination.', 'Property'),
      ('¶415', 'Ordained Minister', 'Ordained ministers are authorized to preach and teach the Word of God, to provide pastoral care, and to administer the sacraments of baptism and Holy Communion.', 'Orders of Ministry')
      ON CONFLICT DO NOTHING
    `

    console.log('✅ Sample data inserted successfully')
    console.log('🎉 Database setup complete!')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  }
}

// Run the setup
setupDatabase().catch(console.error)