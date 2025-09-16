'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BodParagraphPreview from '@/components/BodParagraphPreview'

interface Petition {
  id: string
  title: string
  submitter_name: string
  submitter_email: string
  submitter_organization: string
  bod_paragraph: string
  petition_type: string
  rationale: string
  financial_impact: boolean
  status: string
  submission_date: string
  committee_id?: string
  committee_name?: string
  amendment_data?: any[]
  original_paragraph_text?: string
  modified_paragraph_text?: string
}

interface Committee {
  id: string
  name: string
  abbreviation: string
}

interface BodParagraph {
  id: string
  number: string
  title: string
  current_text: string
  section: string
}

interface Change {
  type: 'delete' | 'insert'
  originalText?: string
  newText?: string
  position: number
}

export default function PetitionDetail() {
  const params = useParams()
  const router = useRouter()
  const [petition, setPetition] = useState<Petition | null>(null)
  const [committees, setCommittees] = useState<Committee[]>([])
  const [bodParagraph, setBodParagraph] = useState<BodParagraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state for secretary edits
  const [petitionType, setPetitionType] = useState('')
  const [financialImpact, setFinancialImpact] = useState(false)
  const [committeeId, setCommitteeId] = useState('')

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    Promise.all([
      fetch(`/api/petitions/${params.id}`),
      fetch('/api/committees'),
      fetch('/api/bod-paragraphs')
    ])
      .then(async ([petitionRes, committeesRes, bodRes]) => {
        if (!petitionRes.ok) throw new Error('Petition not found')
        
        const petitionData = await petitionRes.json()
        const committeesData = await committeesRes.json()
        const bodData = await bodRes.json()
        
        setPetition(petitionData.petition)
        setCommittees(committeesData.committees || [])
        
        // Set form state from petition
        setPetitionType(petitionData.petition.petition_type || '')
        setFinancialImpact(petitionData.petition.financial_impact || false)
        setCommitteeId(petitionData.petition.committee_id || '')
        
        // Find BoD paragraph details
        const paragraph = bodData.paragraphs?.find((p: BodParagraph) => 
          p.number === petitionData.petition.bod_paragraph
        )
        setBodParagraph(paragraph || null)
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading petition:', err)
        setLoading(false)
      })
  }, [params.id])

  const getTypeLabel = (type: string) => {
    const types = {
      'D': 'Disciplinary',
      'C': 'Constitutional', 
      'R': 'Resolution',
      'O': 'Other'
    }
    return types[type as keyof typeof types] || 'Not Set'
  }

  const saveChanges = async () => {
    if (!petition) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/petitions/${petition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petition_type: petitionType,
          financial_impact: financialImpact,
          committee_id: committeeId || null,
          status: committeeId ? 'assigned' : 'under_review'
        })
      })
      
      if (response.ok) {
        const updatedData = await response.json()
        setPetition(updatedData.petition)
        // Optionally redirect back to dashboard or show success message
      } else {
        alert('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving petition:', error)
      alert('Error saving changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading petition...</div>
      </div>
    )
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Petition Not Found</h2>
          <Link href="/secretary" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Petition</h1>
          <p className="text-gray-600">
            Categorize and assign petition to appropriate committee
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Petition Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Petition Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <div className="mt-1 text-gray-900 text-lg font-medium">
                    {petition.title}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Submitter</label>
                    <div className="mt-1 text-gray-900">{petition.submitter_name}</div>
                    <div className="text-sm text-gray-500">{petition.submitter_email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Organization</label>
                    <div className="mt-1 text-gray-900">
                      {petition.submitter_organization || '—'}
                    </div>
                  </div>
                </div>


                {petition.rationale && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rationale</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-md text-gray-900 whitespace-pre-wrap">
                      {petition.rationale}
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Amendment Visualization */}
            {petition.amendment_data && petition.original_paragraph_text && petition.modified_paragraph_text && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Proposed Amendment to Book of Discipline
                  </h3>
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 mb-4">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      {bodParagraph ? (
                        <>
                          <div className="font-medium text-blue-900">
                            {bodParagraph.number} - {bodParagraph.title}
                          </div>
                          <div className="text-sm text-blue-800 mt-1">
                            Section: {bodParagraph.section}
                          </div>
                        </>
                      ) : (
                        <div className="font-medium text-blue-900">
                          {petition.bod_paragraph} - Referenced Paragraph
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <BodParagraphPreview 
                  selectedParagraph={bodParagraph || {
                    id: petition.bod_paragraph,
                    number: petition.bod_paragraph,
                    title: 'Referenced Paragraph',
                    current_text: petition.original_paragraph_text,
                    section: 'Unknown'
                  }}
                  modifiedText={petition.modified_paragraph_text}
                  changes={petition.amendment_data || []}
                />
              </div>
            )}
          </div>

          {/* Secretary Review Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Secretary Review
              </h3>
              
              <div className="space-y-4">

                {/* Petition Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petition Type *
                  </label>
                  <select
                    value={petitionType}
                    onChange={(e) => setPetitionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select type...</option>
                    <option value="D">Disciplinary</option>
                    <option value="C">Constitutional</option>
                    <option value="R">Resolution</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                {/* Financial Impact */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={financialImpact}
                      onChange={(e) => setFinancialImpact(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Has financial implications
                    </span>
                  </label>
                </div>

                {/* Committee Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Committee
                  </label>
                  <select
                    value={committeeId}
                    onChange={(e) => setCommitteeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">No assignment</option>
                    {committees.map(committee => (
                      <option key={committee.id} value={committee.id}>
                        {committee.name}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Save Button */}
                <button
                  onClick={saveChanges}
                  disabled={saving || !petitionType}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover disabled:bg-primary-300 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {petition.committee_name && (
                  <div className="text-sm text-green-600 font-medium">
                    Currently assigned to {petition.committee_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}