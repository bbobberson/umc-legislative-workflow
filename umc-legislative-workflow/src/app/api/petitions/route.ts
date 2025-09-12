import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      submitterName,
      submitterEmail,
      submitterOrganization,
      bodParagraph,
      petitionText,
      rationale,
      amendmentData,
      originalParagraphText,
      modifiedParagraphText
    } = body

    // Insert the petition
    const result = await db`
      INSERT INTO petitions (
        title,
        submitter_name,
        submitter_email,
        submitter_organization,
        bod_paragraph,
        petition_text,
        rationale,
        amendment_data,
        original_paragraph_text,
        modified_paragraph_text
      ) VALUES (
        ${title},
        ${submitterName},
        ${submitterEmail},
        ${submitterOrganization || null},
        ${bodParagraph},
        ${petitionText},
        ${rationale || null},
        ${amendmentData ? JSON.stringify(amendmentData) : null},
        ${originalParagraphText || null},
        ${modifiedParagraphText || null}
      )
      RETURNING id, title, status
    `

    return NextResponse.json({
      success: true,
      petition: result[0]
    })
  } catch (error) {
    console.error('Error creating petition:', error)
    return NextResponse.json(
      { error: 'Failed to create petition' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const petitions = await db`
      SELECT 
        p.*,
        c.name as committee_name,
        c.abbreviation as committee_abbr
      FROM petitions p
      LEFT JOIN committees c ON p.committee_id = c.id
      ORDER BY p.submission_date DESC
    `

    return NextResponse.json({ petitions })
  } catch (error) {
    console.error('Error fetching petitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch petitions' },
      { status: 500 }
    )
  }
}