'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BodParagraphEditor from '@/components/BodParagraphEditor'
import BodParagraphPreview from '@/components/BodParagraphPreview'
import BodParagraphSearch from '@/components/BodParagraphSearch'

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

export default function SubmitPetition() {
  const [formData, setFormData] = useState({
    title: '',
    submitterName: '',
    submitterEmail: '',
    submitterOrganization: '',
    bodParagraph: '',
    petitionText: '',
    rationale: ''
  })
  const [selectedParagraph, setSelectedParagraph] = useState<BodParagraph | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [amendmentChanges, setAmendmentChanges] = useState<Change[]>([])
  const [modifiedParagraphText, setModifiedParagraphText] = useState('')

  const samplePetitions = [
    {
      title: 'Modify Clergy Housing Allowance Requirements',
      submitterName: 'Rev. Sarah Mitchell',
      submitterEmail: 'sarah.mitchell@email.com',
      submitterOrganization: 'Western North Carolina Annual Conference',
      bodParagraph: '¶415',
      petitionText: 'Amend ¶415.6 to provide greater flexibility in clergy housing allowance determinations by removing the requirement that housing allowances be set prior to the beginning of the calendar year. This change would allow annual conferences to adjust housing allowances mid-year in response to unexpected circumstances such as emergency parsonage repairs or significant changes in local housing costs.',
      rationale: 'Current rigid timing requirements create hardship when unexpected housing situations arise. Clergy families have faced financial strain when emergency repairs or market changes occur after allowances are set. This modification maintains fiscal responsibility while providing necessary flexibility.'
    },
    {
      title: 'Resolution on Climate Justice and Creation Care',
      submitterName: 'Dr. Michael Rodriguez',
      submitterEmail: 'mrodriguez@email.com',
      submitterOrganization: 'California-Pacific Annual Conference',
      bodParagraph: '¶702',
      petitionText: 'The United Methodist Church commits to achieving carbon neutrality across all church operations by 2030. We call upon all annual conferences, local churches, and church-related institutions to implement comprehensive sustainability plans, transition to renewable energy sources, and advocate for environmental justice in their communities.',
      rationale: 'Climate change disproportionately affects the world\'s most vulnerable populations. As disciples of Christ, we are called to care for creation and seek justice for those harmed by environmental degradation. Bold action is needed now.'
    },
    {
      title: 'Expand Annual Conference Legislative Authority',
      submitterName: 'Bishop Jennifer Walsh',
      submitterEmail: 'jwalsh@email.com',
      submitterOrganization: 'Upper New York Annual Conference',
      bodParagraph: '¶213',
      petitionText: 'Amend Article IV of the Constitution to grant annual conferences authority to adapt certain disciplinary provisions to their regional contexts, subject to review by the Judicial Council. This would not apply to constitutional amendments or matters of church doctrine.',
      rationale: 'The diverse contexts of United Methodism globally require greater flexibility in implementation of disciplinary provisions. Regional adaptation while maintaining doctrinal unity would strengthen our connection.'
    },
    {
      title: 'Update Committee on Lay Leadership Requirements',
      submitterName: 'Mary Johnson',
      submitterEmail: 'mary.j@email.com',
      submitterOrganization: 'Oklahoma Annual Conference',
      bodParagraph: '¶230',
      petitionText: 'Revise ¶230.4 to require that committees on lay leadership include at least one young adult (ages 18-35) and implement term limits of two consecutive three-year terms for all committee members except the chairperson.',
      rationale: 'Many committees lack diverse age representation and suffer from stagnation due to indefinite service terms. These changes will bring fresh perspectives and ensure broader participation in lay leadership development.'
    }
  ]

  const fillSampleData = () => {
    const randomPetition = samplePetitions[Math.floor(Math.random() * samplePetitions.length)]
    
    // Update only petition details fields - don't touch BoD paragraph section
    setFormData({
      ...formData,
      title: randomPetition.title,
      submitterName: randomPetition.submitterName,
      submitterEmail: randomPetition.submitterEmail,
      submitterOrganization: randomPetition.submitterOrganization,
      rationale: randomPetition.rationale
    })
  }

  // Handle BoD paragraph selection
  const handleBodSelection = (paragraph: BodParagraph) => {
    setSelectedParagraph(paragraph)
    setFormData({ ...formData, bodParagraph: paragraph.number })
    
    // Reset amendment editor state
    setAmendmentChanges([])
    setModifiedParagraphText(paragraph.current_text)
  }

  // Handle amendment editor changes
  const handleAmendmentChanges = (changes: Change[], modifiedText: string) => {
    setAmendmentChanges(changes)
    setModifiedParagraphText(modifiedText)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that user has made changes using the amendment editor
    if (!selectedParagraph) {
      alert('Please select a Book of Discipline paragraph to amend.')
      return
    }
    
    if (amendmentChanges.length === 0) {
      alert('Please make changes to the paragraph using the amendment editor above.')
      return
    }
    
    setIsSubmitting(true)

    try {
      // Prepare the submission data with amendment information
      const submissionData = {
        ...formData,
        amendmentData: amendmentChanges.length > 0 ? amendmentChanges : null,
        originalParagraphText: selectedParagraph?.current_text || null,
        modifiedParagraphText: modifiedParagraphText ? modifiedParagraphText : null
      }

      const response = await fetch('/api/petitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Failed to submit petition')
      }
    } catch (error) {
      console.error('Error submitting petition:', error)
      alert('Error submitting petition. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Petition Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your petition has been successfully submitted and will be reviewed by the petition secretary.
            </p>
            <div className="space-y-3">
              <Link href="/submit" 
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Submit Another Petition
              </Link>
              <Link href="/" 
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Legislative Petition</h1>
            <p className="text-gray-600">
              Submit your petition for consideration at the next General Conference
            </p>
          </div>


          <form onSubmit={handleSubmit}>
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Petition Details</h2>
                <button
                  type="button"
                  onClick={fillSampleData}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group"
                  title="Fill with sample data"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Title - Full Width */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Petition Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
                    placeholder="Brief descriptive title for your petition"
                  />
                </div>

                {/* Contact Info - 3 Columns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({...formData, submitterName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({...formData, submitterEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Organization/Church
                  </label>
                  <input
                    type="text"
                    value={formData.submitterOrganization}
                    onChange={(e) => setFormData({...formData, submitterOrganization: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Annual Conference, Local Church, etc."
                  />
                </div>
              </div>
            </div>

          {/* Amendment Editor */}
          <div className="bg-white rounded-lg shadow-xl border-l-4 border-blue-500 p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Amendment Editor</h2>
              <p className="text-sm text-gray-600 mb-6">
                Search and select a Book of Discipline paragraph, then make your amendments with live preview
              </p>
              <BodParagraphSearch 
                onSelect={handleBodSelection}
                selectedParagraph={selectedParagraph}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Editor */}
              <BodParagraphEditor 
                selectedParagraph={selectedParagraph}
                onChangesUpdate={handleAmendmentChanges}
              />
              
              {/* Preview */}
              <BodParagraphPreview 
                selectedParagraph={selectedParagraph}
                modifiedText={modifiedParagraphText}
                changes={amendmentChanges}
              />
            </div>
          </div>

          {/* Rationale */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Rationale</h2>
            <div className="max-w-4xl">
              <label className="block text-sm font-medium text-gray-700 mb-6">
                Explain why this change is needed
              </label>
              <textarea
                rows={6}
                value={formData.rationale}
                onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Provide the reasoning and justification for your proposed amendment..."
              />
            </div>
          </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-1">
                    🚀 Ready to Make Your Voice Heard?
                  </p>
                  <p className="text-sm text-gray-600">
                    Your petition will be reviewed by the Secretary and assigned to the appropriate committee
                  </p>
                </div>
                <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Petition'}
                </button>
                </div>
              </div>
            </div>
          </form>
      </div>
    </div>
  )
}