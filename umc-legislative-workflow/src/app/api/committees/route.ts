import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const committees = await db`
      SELECT id, name, abbreviation
      FROM committees
      ORDER BY name
    `

    return NextResponse.json({ committees })
  } catch (error) {
    console.error('Error fetching committees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch committees' },
      { status: 500 }
    )
  }
}