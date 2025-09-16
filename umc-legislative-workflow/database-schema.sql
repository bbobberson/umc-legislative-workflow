-- UMC Legislative Workflow Database Schema
-- Simple schema for prototype demo

-- Book of Discipline Paragraphs
CREATE TABLE bod_paragraphs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(20) NOT NULL, -- e.g., "¶123.4"
    title VARCHAR(255) NOT NULL,
    current_text TEXT NOT NULL,
    section VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Committees
CREATE TABLE committees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Petitions
CREATE TABLE petitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    submitter_name VARCHAR(255) NOT NULL,
    submitter_email VARCHAR(255) NOT NULL,
    submitter_organization VARCHAR(255),
    bod_paragraph VARCHAR(20), -- Links to BoD paragraph number
    petition_type VARCHAR(1) CHECK (petition_type IN ('D', 'C', 'R', 'O')), -- Discipline, Constitution, Resolution, Other
    rationale TEXT,
    financial_impact BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'assigned', 'in_committee', 'voted', 'approved', 'rejected')),
    committee_id UUID REFERENCES committees(id),
    amendment_data JSONB, -- Amendment editor data
    original_paragraph_text TEXT, -- Original BoD text
    modified_paragraph_text TEXT, -- Modified BoD text
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Committee Votes (The star feature!)
CREATE TABLE committee_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    petition_id UUID REFERENCES petitions(id) NOT NULL,
    committee_id UUID REFERENCES committees(id) NOT NULL,
    action VARCHAR(20) CHECK (action IN ('adopt', 'refer', 'not_support', 'assign_to_reference')) NOT NULL,
    vote_tally JSONB NOT NULL, -- {yes: number, no: number, abstain: number, present: number}
    amendment_text TEXT,
    amendment_type VARCHAR(15) CHECK (amendment_type IN ('addition', 'deletion', 'substitution')),
    consent_calendar_eligible BOOLEAN DEFAULT FALSE,
    consent_calendar_category VARCHAR(1) CHECK (consent_calendar_category IN ('A', 'B', 'C')), -- A=Discipline, B=Non-Discipline, C=Referrals
    recorded_by VARCHAR(255) NOT NULL,
    recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample committees
INSERT INTO committees (name, abbreviation) VALUES
('Faith and Order', 'F&O'),
('Church and Society', 'C&S'),
('Discipleship', 'DISC'),
('Global Ministries', 'GM'),
('Higher Education and Ministry', 'HEM'),
('Connectional Table', 'CT'),
('Judicial Administration', 'JA'),
('Financial Administration', 'FA');

-- Insert a few sample BoD paragraphs (you can add your uploaded ones later)
INSERT INTO bod_paragraphs (number, title, current_text, section) VALUES
('¶161', 'Appointments', 'Appointments to pastoral charges shall be made by the bishop...', 'The Ministry'),
('¶213', 'Annual Conference', 'The annual conference is the fundamental body in the Church...', 'Local Church'),
('¶304', 'General Conference', 'The General Conference shall meet in regular session...', 'The Conferences'),
('¶702', 'Social Principles', 'We believe in God, Creator of the world...', 'Social Principles');