import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      petition_id,
      committee_id,
      action,
      vote_tally,
      amendment_text = null,
      amendment_type = null,
      recorded_by
    } = body

    // Validate required fields
    if (!petition_id || !committee_id || !action || !vote_tally || !recorded_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate consent calendar eligibility
    let consent_calendar_eligible = false
    let consent_calendar_category = null

    // Auto-calculate based on petition type and vote results
    const petitionResult = await sql`
      SELECT petition_type, financial_impact 
      FROM petitions 
      WHERE id = ${petition_id}
    `
    
    if (petitionResult.length > 0) {
      const petition = petitionResult[0]
      const totalVotes = vote_tally.yes + vote_tally.no + vote_tally.abstain
      
      // Basic consent calendar rules
      if (!petition.financial_impact && action === 'adopt' && totalVotes > 0) {
        const yesPercentage = vote_tally.yes / totalVotes
        
        if (yesPercentage >= 0.8) { // 80% yes votes
          consent_calendar_eligible = true
          
          if (petition.petition_type === 'D') {
            consent_calendar_category = 'A' // Discipline
          } else if (petition.petition_type === 'R') {
            consent_calendar_category = 'B' // Non-Discipline
          }
        }
      } else if (action === 'refer' || action === 'assign_to_reference') {
        consent_calendar_eligible = true
        consent_calendar_category = 'C' // Referrals
      }
    }

    // Insert committee vote record
    const result = await sql`
      INSERT INTO committee_votes (
        petition_id,
        committee_id, 
        action,
        vote_tally,
        amendment_text,
        amendment_type,
        consent_calendar_eligible,
        consent_calendar_category,
        recorded_by,
        recorded_date,
        approved,
        created_at,
        updated_at
      ) VALUES (
        ${petition_id},
        ${committee_id},
        ${action},
        ${JSON.stringify(vote_tally)},
        ${amendment_text},
        ${amendment_type},
        ${consent_calendar_eligible},
        ${consent_calendar_category},
        ${recorded_by},
        NOW(),
        false,
        NOW(),
        NOW()
      )
      RETURNING id
    `

    // Update petition status
    let newPetitionStatus = 'in_committee'
    if (action === 'adopt') {
      newPetitionStatus = 'voted'
    } else if (action === 'not_support') {
      newPetitionStatus = 'rejected'
    }

    await sql`
      UPDATE petitions 
      SET status = ${newPetitionStatus}, updated_at = NOW()
      WHERE id = ${petition_id}
    `

    return NextResponse.json({
      id: result[0].id,
      consent_calendar_eligible,
      consent_calendar_category,
      message: 'Vote recorded successfully'
    })

  } catch (error) {
    console.error('Error recording committee vote:', error)
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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
      ORDER BY cv.recorded_date DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching committee votes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}