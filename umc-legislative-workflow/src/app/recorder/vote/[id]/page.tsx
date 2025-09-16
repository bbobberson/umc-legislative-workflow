'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Amendment {
  type: 'insert' | 'delete'
  originalText?: string
  newText?: string
  position: number
}

interface Petition {
  id: string
  title: string
  submitter_name: string
  submitter_organization: string
  bod_paragraph: string
  petition_type: 'D' | 'C' | 'R' | 'O'
  rationale: string
  financial_impact: boolean
  original_paragraph_text: string
  modified_paragraph_text: string
  amendment_data: Amendment[]
  committee_id: string
}

interface Committee {
  id: string
  name: string
  abbreviation: string
}

interface VoteData {
  action: 'adopt' | 'refer' | 'not_support' | 'assign_to_reference' | ''
  vote_tally: {
    yes: number
    no: number
    abstain: number
    present: number
  }
  amendment_text: string
  amendment_type: 'addition' | 'deletion' | 'substitution' | null
  consent_calendar_eligible: boolean
  consent_calendar_category: 'A' | 'B' | 'C' | null
  recorded_by: string
}

export default function VoteRecordingPage() {
  const params = useParams()
  const router = useRouter()
  const [petition, setPetition] = useState<Petition | null>(null)
  const [committee, setCommittee] = useState<Committee | null>(null)
  const [allCommittees, setAllCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [voteData, setVoteData] = useState<VoteData>({
    action: '',
    vote_tally: { yes: 0, no: 0, abstain: 0, present: 0 },
    amendment_text: '',
    amendment_type: null,
    consent_calendar_eligible: false,
    consent_calendar_category: null,
    recorded_by: 'Katie Voigt'
  })

  useEffect(() => {
    if (params.id) {
      loadPetitionData(params.id as string)
      loadCommittees()
    }
  }, [params.id])

  const loadPetitionData = async (petitionId: string) => {
    try {
      const response = await fetch(`/api/petitions/${petitionId}`)
      const data = await response.json()
      const petitionData = data.petition
      setPetition(petitionData)
      
      // Load committee data
      if (petitionData.committee_id) {
        const committeeResponse = await fetch('/api/committees')
        const committees = await committeeResponse.json()
        const petitionCommittee = committees.committees.find((c: Committee) => c.id === petitionData.committee_id)
        setCommittee(petitionCommittee)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading petition:', error)
      setLoading(false)
    }
  }

  const loadCommittees = async () => {
    try {
      const response = await fetch('/api/committees')
      const data = await response.json()
      setAllCommittees(data.committees || [])
    } catch (error) {
      console.error('Error loading committees:', error)
    }
  }

  const updateVoteData = (field: keyof VoteData, value: any) => {
    setVoteData(prev => ({ ...prev, [field]: value }))
  }

  const updateVoteTally = (field: keyof VoteData['vote_tally'], value: number) => {
    setVoteData(prev => ({
      ...prev,
      vote_tally: { ...prev.vote_tally, [field]: value }
    }))
  }

  const generateVisualDiff = (originalText: string, amendments: Amendment[]): string => {
    if (!amendments || amendments.length === 0) {
      return originalText
    }

    // Sort amendments by position (descending) to apply them from end to beginning
    const sortedAmendments = [...amendments].sort((a, b) => b.position - a.position)
    
    let result = originalText
    
    for (const amendment of sortedAmendments) {
      if (amendment.type === 'insert' && amendment.newText) {
        // Insert with underline formatting
        const before = result.substring(0, amendment.position)
        const after = result.substring(amendment.position)
        result = before + `<span style="text-decoration: underline; color: #059669; font-weight: 500;">${amendment.newText}</span>` + after
      } else if (amendment.type === 'delete' && amendment.originalText) {
        // Find and mark deleted text with strikethrough
        const deleteStart = amendment.position
        const deleteEnd = amendment.position + amendment.originalText.length
        const before = result.substring(0, deleteStart)
        const deletedText = result.substring(deleteStart, deleteEnd)
        const after = result.substring(deleteEnd)
        result = before + `<span style="text-decoration: line-through; color: #dc2626;">${deletedText}</span>` + after
      }
    }
    
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!voteData.action) {
      alert('Please select a recommendation before submitting.')
      return
    }
    
    setSubmitting(true)

    try {
      const response = await fetch(`/api/committee-votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petition_id: petition?.id,
          committee_id: petition?.committee_id,
          ...voteData
        })
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/recorder/approve/${result.id}`)
      } else {
        throw new Error('Failed to record vote')
      }
    } catch (error) {
      console.error('Error recording vote:', error)
      alert('Error recording vote. Please try again.')
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

  if (!petition || !committee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Petition Not Found</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-trade">
            Record Committee Vote - {committee.name}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Petition Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4 font-trade">Petition Details</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Title:</span>
                  <p className="font-medium text-gray-900">{petition.title}</p>
                </div>
                
                <div>
                  <span className="text-gray-500">Submitter:</span>
                  <p className="text-gray-900">{petition.submitter_name}</p>
                  {petition.submitter_organization && (
                    <p className="text-gray-800">{petition.submitter_organization}</p>
                  )}
                </div>
                
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    petition.petition_type === 'D' ? 'bg-blue-100 text-blue-800' :
                    petition.petition_type === 'C' ? 'bg-purple-100 text-purple-800' :
                    petition.petition_type === 'R' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {petition.petition_type === 'D' ? 'Discipline' :
                     petition.petition_type === 'C' ? 'Constitution' :
                     petition.petition_type === 'R' ? 'Resolution' : 'Other'}
                  </span>
                </div>
                
                {petition.bod_paragraph && (
                  <div>
                    <span className="text-gray-500">BoD Reference:</span>
                    <p className="font-mono text-sm text-gray-900">{petition.bod_paragraph}</p>
                  </div>
                )}
                
                {petition.financial_impact && (
                  <div className="flex items-center text-amber-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Financial Impact
                  </div>
                )}

                {(petition.original_paragraph_text && petition.amendment_data) && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500 mb-2 block">Proposed Amendment:</span>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <div 
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: generateVisualDiff(petition.original_paragraph_text, petition.amendment_data)
                        }}
                      />
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        <span className="inline-block mr-4">
                          <span className="line-through text-red-600">Strikethrough</span> = deleted text
                        </span>
                        <span className="inline-block">
                          <span className="underline text-green-600 font-medium">Underline</span> = added text
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {petition.rationale && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500 mb-2 block">Rationale:</span>
                    <div className="bg-blue-50 rounded p-3 text-sm text-gray-900">
                      {petition.rationale}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vote Recording Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-6 font-trade">Committee Action</h3>
              
              {/* Committee Action */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'adopt', label: 'Adopt', bgColor: 'bg-green-600', hoverColor: 'hover:bg-green-700', selectedBg: 'bg-green-600', unselectedBg: 'bg-white', unselectedText: 'text-gray-700', selectedText: 'text-white' },
                    { value: 'not_support', label: 'Not Support', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700', selectedBg: 'bg-red-600', unselectedBg: 'bg-white', unselectedText: 'text-gray-700', selectedText: 'text-white' },
                    { value: 'refer', label: 'Refer to Committee/Agency', bgColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', selectedBg: 'bg-blue-600', unselectedBg: 'bg-white', unselectedText: 'text-gray-700', selectedText: 'text-white' },
                    { value: 'assign_to_reference', label: 'Assign to Reference Committee', bgColor: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', selectedBg: 'bg-purple-600', unselectedBg: 'bg-white', unselectedText: 'text-gray-700', selectedText: 'text-white' }
                  ].map((action) => {
                    const isSelected = voteData.action === action.value
                    return (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => updateVoteData('action', action.value as VoteData['action'])}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 border-2 ${
                          isSelected 
                            ? `${action.selectedBg} ${action.selectedText} border-gray-300 shadow-md` 
                            : `${action.unselectedBg} ${action.unselectedText} border-gray-300 hover:border-gray-400 hover:shadow-sm`
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            isSelected ? 'border-white bg-white' : 'border-gray-500'
                          }`}>
                            {isSelected && (
                              <div className={`w-2 h-2 rounded-full ${action.selectedBg}`}></div>
                            )}
                          </div>
                          {action.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Vote Tally */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vote Tally
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(voteData.vote_tally).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {key}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => updateVoteTally(key as keyof VoteData['vote_tally'], parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Amendment Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amendment Text (if applicable)
                </label>
                <textarea
                  value={voteData.amendment_text}
                  onChange={(e) => updateVoteData('amendment_text', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Enter any amendments or modifications..."
                />
              </div>

              {/* Recorded By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recorded By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={voteData.recorded_by}
                  onChange={(e) => updateVoteData('recorded_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Enter recorder name"
                />
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/recorder')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || !voteData.recorded_by || !voteData.action}
                  className="btn-primary disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {submitting ? 'Recording...' : 'Record Vote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}