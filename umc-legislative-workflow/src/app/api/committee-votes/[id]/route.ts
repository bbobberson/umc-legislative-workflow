import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await sql`
      SELECT 
        cv.*,
        p.title as petition_title,
        p.submitter_name,
        c.name as committee_name,
        c.abbreviation as committee_abbreviation
      FROM committee_votes cv
      JOIN petitions p ON cv.petition_id = p.id
      JOIN committees c ON cv.committee_id = c.id
      WHERE cv.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vote record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error fetching committee vote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vote record' },
      { status: 500 }
    )
  }
}