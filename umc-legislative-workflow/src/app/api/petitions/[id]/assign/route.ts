import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { committeeId } = await request.json()
    
    // Update petition committee assignment and status
    const result = await db`
      UPDATE petitions 
      SET 
        committee_id = ${committeeId},
        status = 'assigned',
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, status
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
    console.error('Error assigning petition:', error)
    return NextResponse.json(
      { error: 'Failed to assign petition' },
      { status: 500 }
    )
  }
}