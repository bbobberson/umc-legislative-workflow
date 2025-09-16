import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approved_by } = body

    if (!approved_by) {
      return NextResponse.json(
        { error: 'Approver name is required' },
        { status: 400 }
      )
    }

    // Update the committee vote with approval
    const result = await sql`
      UPDATE committee_votes 
      SET 
        approved = true,
        approved_by = ${approved_by},
        approved_date = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, petition_id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vote record not found' },
        { status: 404 }
      )
    }

    // Update petition status to approved if the vote was to adopt
    const voteData = await sql`
      SELECT action FROM committee_votes WHERE id = ${id}
    `

    if (voteData.length > 0 && voteData[0].action === 'adopt') {
      await sql`
        UPDATE petitions 
        SET status = 'approved', updated_at = NOW()
        WHERE id = ${result[0].petition_id}
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Vote approved successfully'
    })

  } catch (error) {
    console.error('Error approving committee vote:', error)
    return NextResponse.json(
      { error: 'Failed to approve vote' },
      { status: 500 }
    )
  }
}