import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db`
      SELECT 
        p.*,
        c.name as committee_name,
        c.abbreviation as committee_abbr
      FROM petitions p
      LEFT JOIN committees c ON p.committee_id = c.id
      WHERE p.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ petition: result[0] })
  } catch (error) {
    console.error('Error fetching petition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch petition' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      petition_type,
      financial_impact,
      committee_id,
      status
    } = body
    
    await db`
      UPDATE petitions 
      SET 
        petition_type = ${petition_type},
        financial_impact = ${financial_impact},
        committee_id = ${committee_id},
        status = ${status},
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Fetch updated petition with committee info
    const result = await db`
      SELECT 
        p.*,
        c.name as committee_name,
        c.abbreviation as committee_abbr
      FROM petitions p
      LEFT JOIN committees c ON p.committee_id = c.id
      WHERE p.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      petition: result[0]
    })
  } catch (error) {
    console.error('Error updating petition:', error)
    return NextResponse.json(
      { error: 'Failed to update petition' },
      { status: 500 }
    )
  }
}