'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface CommitteeVote {
  id: string
  petition_id: string
  committee_id: string
  action: string
  vote_tally: {
    yes: number
    no: number
    abstain: number
    present: number
  }
  amendment_text: string | null
  consent_calendar_eligible: boolean
  consent_calendar_category: string | null
  recorded_by: string
  recorded_date: string
  approved: boolean
  approved_by: string | null
  approved_date: string | null
  petition_title: string
  committee_name: string
}

export default function ApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const [vote, setVote] = useState<CommitteeVote | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [approverName, setApproverName] = useState('')
  const [approverRole, setApproverRole] = useState<'chair' | 'secretary' | 'vice_chair'>('chair')

  useEffect(() => {
    if (params.id) {
      loadVoteData(params.id as string)
    }
  }, [params.id])

  const loadVoteData = async (voteId: string) => {
    try {
      const response = await fetch(`/api/committee-votes/${voteId}`)
      const voteData = await response.json()
      setVote(voteData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading vote:', error)
      setLoading(false)
    }
  }

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!approverName.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/committee-votes/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_by: `${approverName} (${approverRole.replace('_', ' ')})`
        })
      })

      if (response.ok) {
        router.push('/recorder?success=vote_approved')
      } else {
        throw new Error('Failed to approve vote')
      }
    } catch (error) {
      console.error('Error approving vote:', error)
      alert('Error approving vote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!vote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vote Record Not Found</h2>
            <button 
              onClick={() => router.push('/recorder')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Return to Recorder
            </button>
          </div>
        </div>
      </div>
    )
  }

  const actionLabels = {
    adopt: 'Adopt',
    not_support: 'Not Support', 
    refer: 'Refer to Committee/Agency',
    assign_to_reference: 'Assign to Reference Committee'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-trade">
            Committee Vote Approval
          </h1>
          <p className="text-gray-600 mt-1">
            Digital signature required to complete Form A process
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vote Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4 font-trade">Vote Summary</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Committee:</span>
                <p className="font-medium">{vote.committee_name}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Petition:</span>
                <p className="font-medium">{vote.petition_title}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Committee Action:</span>
                <p className="font-medium">{actionLabels[vote.action as keyof typeof actionLabels]}</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{vote.vote_tally.yes}</div>
                  <div className="text-xs text-gray-500">Yes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{vote.vote_tally.no}</div>
                  <div className="text-xs text-gray-500">No</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{vote.vote_tally.abstain}</div>
                  <div className="text-xs text-gray-500">Abstain</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{vote.vote_tally.present}</div>
                  <div className="text-xs text-gray-500">Present</div>
                </div>
              </div>

              {vote.amendment_text && (
                <div>
                  <span className="text-sm text-gray-500">Amendment Notes:</span>
                  <div className="bg-gray-50 rounded p-3 mt-1 text-sm">
                    {vote.amendment_text}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <span className="text-sm text-gray-500">Recorded by:</span>
                <p className="font-medium">{vote.recorded_by}</p>
                <p className="text-xs text-gray-500">
                  {new Date(vote.recorded_date).toLocaleString()}
                </p>
              </div>

              {vote.consent_calendar_eligible && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center text-green-800">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Consent Calendar Eligible - Category {vote.consent_calendar_category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Form */}
          <div className="bg-white rounded-lg shadow p-6">
            {vote.approved ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-trade">
                  Already Approved
                </h3>
                <p className="text-gray-600 mb-4">
                  This vote has been approved by: <strong>{vote.approved_by}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(vote.approved_date!).toLocaleString()}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApprove}>
                <h3 className="font-semibold text-gray-900 mb-4 font-trade">
                  Committee Leadership Approval
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={approverRole}
                      onChange={(e) => setApproverRole(e.target.value as typeof approverRole)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="chair">Committee Chair</option>
                      <option value="vice_chair">Committee Vice Chair</option>
                      <option value="secretary">Committee Secretary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Digital Signature</p>
                        <p>By clicking "Approve and Sign", you are digitally signing this committee vote record, replacing the physical signature requirement on Form A.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !approverName.trim()}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      submitting || !approverName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-600'
                    }`}
                  >
                    {submitting ? 'Processing...' : 'Approve and Sign'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}