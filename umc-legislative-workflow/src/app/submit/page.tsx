'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BodParagraph {
  id: string
  number: string
  title: string
  current_text: string
  section: string
}

export default function SubmitPetition() {
  const [formData, setFormData] = useState({
    title: '',
    submitterName: '',
    submitterEmail: '',
    submitterOrganization: '',
    bodParagraph: '',
    petitionType: 'D',
    petitionText: '',
    rationale: '',
    financialImpact: false
  })
  const [bodParagraphs, setBodParagraphs] = useState<BodParagraph[]>([])
  const [selectedParagraph, setSelectedParagraph] = useState<BodParagraph | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load BoD paragraphs on mount
  useEffect(() => {
    fetch('/api/bod-paragraphs')
      .then(res => res.json())
      .then(data => setBodParagraphs(data.paragraphs || []))
      .catch(err => console.error('Error loading BoD paragraphs:', err))
  }, [])

  // Handle BoD paragraph selection
  const handleBodSelection = (paragraphNumber: string) => {
    const paragraph = bodParagraphs.find(p => p.number === paragraphNumber)
    setSelectedParagraph(paragraph || null)
    setFormData({ ...formData, bodParagraph: paragraphNumber })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/petitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Legislative Petition</h1>
            <p className="text-gray-600">
              Submit your petition for consideration at the next General Conference
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petition Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief descriptive title for your petition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({...formData, submitterName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({...formData, submitterEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization/Church
                  </label>
                  <input
                    type="text"
                    value={formData.submitterOrganization}
                    onChange={(e) => setFormData({...formData, submitterOrganization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Annual Conference, Local Church, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book of Discipline Paragraph *
                  </label>
                  <select
                    required
                    value={formData.bodParagraph}
                    onChange={(e) => handleBodSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a BoD paragraph</option>
                    {bodParagraphs.map((paragraph) => (
                      <option key={paragraph.id} value={paragraph.number}>
                        {paragraph.number} - {paragraph.title}
                      </option>
                    ))}
                  </select>
                  
                  {selectedParagraph && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Current Text ({selectedParagraph.section}):
                      </p>
                      <p className="text-sm text-blue-800">
                        {selectedParagraph.current_text}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petition Type *
                  </label>
                  <select
                    required
                    value={formData.petitionType}
                    onChange={(e) => setFormData({...formData, petitionType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="D">Disciplinary</option>
                    <option value="C">Constitutional</option>
                    <option value="R">Resolution</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="financialImpact"
                    checked={formData.financialImpact}
                    onChange={(e) => setFormData({...formData, financialImpact: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="financialImpact" className="ml-2 block text-sm text-gray-700">
                    This petition has financial implications
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petition Text *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.petitionText}
                    onChange={(e) => setFormData({...formData, petitionText: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="The specific text of your proposed change or resolution..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rationale
                  </label>
                  <textarea
                    rows={6}
                    value={formData.rationale}
                    onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this change is needed..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Petition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}