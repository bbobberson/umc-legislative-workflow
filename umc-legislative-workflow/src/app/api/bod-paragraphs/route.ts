import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const paragraphs = await db`
      SELECT id, number, title, current_text, section
      FROM bod_paragraphs
      ORDER BY number
    `

    return NextResponse.json({ paragraphs })
  } catch (error) {
    console.error('Error fetching BoD paragraphs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BoD paragraphs' },
      { status: 500 }
    )
  }
}