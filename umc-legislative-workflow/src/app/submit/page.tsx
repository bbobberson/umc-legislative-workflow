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
    },
    {
      title: 'Establish Young Adult Ministry Coordinator Position',
      submitterName: 'Rev. Dr. Amanda Thompson',
      submitterEmail: 'athompson@email.com',
      submitterOrganization: 'Florida Annual Conference',
      bodParagraph: '¶630',
      petitionText: 'Create a mandatory Young Adult Ministry Coordinator position within each annual conference to develop programming, leadership development, and advocacy for young adults aged 18-35.',
      rationale: 'Young adult participation in the UMC has declined significantly. Dedicated leadership positions are essential to reverse this trend and engage emerging generations in meaningful ministry.'
    },
    {
      title: 'Add Environmental Impact Assessment to Building Projects',
      submitterName: 'Dr. Patricia Williams',
      submitterEmail: 'pwilliams@email.com',
      submitterOrganization: 'New England Annual Conference',
      bodParagraph: '¶2544',
      petitionText: 'Require environmental impact assessments for all church construction and major renovation projects exceeding $500,000, with mandatory consideration of sustainable building practices and renewable energy systems.',
      rationale: 'Church construction should reflect our commitment to creation care. Environmental assessments ensure responsible stewardship of resources while reducing long-term operational costs.'
    },
    {
      title: 'Extend Probationary Member Service Period Options',
      submitterName: 'Rev. James Chen',
      submitterEmail: 'jchen@email.com',
      submitterOrganization: 'Desert Southwest Annual Conference',
      bodParagraph: '¶324',
      petitionText: 'Expand probationary member service options to include specialized ministries such as chaplaincy, social justice advocacy, and community organizing as valid pathways toward ordination.',
      rationale: 'The changing landscape of ministry requires recognition of diverse service expressions. Specialized ministries provide valuable preparation for ordained leadership while addressing critical community needs.'
    },
    {
      title: 'Add LGBTQ+ Inclusive Language to Wedding Liturgy',
      submitterName: 'Rev. Dr. Samuel Park',
      submitterEmail: 'spark@email.com',
      submitterOrganization: 'Pacific Northwest Annual Conference',
      bodParagraph: '¶340',
      petitionText: 'Include optional gender-neutral and inclusive language alternatives in the official wedding liturgy to ensure all couples feel welcomed and affirmed in United Methodist ceremonies.',
      rationale: 'Liturgical language should reflect the full diversity of God\'s creation. Inclusive options allow clergy and couples to celebrate marriage in ways that honor their identities and relationships.'
    },
    {
      title: 'Expand Housing Allowance Flexibility for Retired Clergy',
      submitterName: 'Rev. Betty Anderson',
      submitterEmail: 'banderson@email.com',
      submitterOrganization: 'Great Plains Annual Conference',
      bodParagraph: '¶1506',
      petitionText: 'Allow retired clergy to designate housing allowances for rental payments, mortgage interest, and home equity loan payments without requiring property ownership documentation.',
      rationale: 'Many retired clergy live in diverse housing arrangements. Current restrictions create unnecessary administrative burden and may disadvantage those who choose rental housing or alternative living situations.'
    },
    {
      title: 'Require Inclusive Language in Official Documents',
      submitterName: 'Dr. Maria Gonzalez',
      submitterEmail: 'mgonzalez@email.com',
      submitterOrganization: 'Rio Texas Annual Conference',
      bodParagraph: '¶804',
      petitionText: 'Mandate the use of inclusive language regarding gender, race, ability, and economic status in all official United Methodist publications, liturgies, and administrative documents.',
      rationale: 'Language shapes perception and belonging. Official church communications should model the inclusive love of Christ and welcome all people regardless of their background or identity.'
    },
    {
      title: 'Add Sanctuary Church Guidelines to Social Principles',
      submitterName: 'Rev. Dr. Carlos Ruiz',
      submitterEmail: 'cruiz@email.com',
      submitterOrganization: 'California-Nevada Annual Conference',
      bodParagraph: '¶162',
      petitionText: 'Establish guidelines for congregations seeking to provide sanctuary to immigrants facing deportation, including legal protections and conference-level support systems.',
      rationale: 'Biblical hospitality calls us to welcome the stranger. Clear guidelines will help congregations respond faithfully to immigration crises while protecting both congregations and vulnerable individuals.'
    },
    {
      title: 'Increase Judicial Council Geographic Diversity',
      submitterName: 'Judge Rachel Kim',
      submitterEmail: 'rkim@email.com',
      submitterOrganization: 'Korean Methodist Church',
      bodParagraph: '¶2601',
      petitionText: 'Require that Judicial Council membership include at least one representative from each central conference region to ensure global perspective in constitutional interpretation.',
      rationale: 'The UMC is a global church requiring diverse perspectives in judicial decisions. Regional representation ensures that constitutional interpretations consider varied cultural and contextual factors.'
    },
    {
      title: 'Add Technology Training to General Conference Preparation',
      submitterName: 'Rev. David Okonkwo',
      submitterEmail: 'dokonkwo@email.com',
      submitterOrganization: 'Nigeria Annual Conference',
      bodParagraph: '¶501',
      petitionText: 'Mandate technology literacy training for all General Conference delegates to ensure effective participation in hybrid and digital voting systems.',
      rationale: 'Digital participation barriers disadvantage delegates from areas with limited technology access. Comprehensive training ensures equal participation and informed decision-making for all delegates.'
    },
    {
      title: 'Extend Rural Church Support Fund Duration',
      submitterName: 'Rev. Dr. Lisa Henderson',
      submitterEmail: 'lhenderson@email.com',
      submitterOrganization: 'West Virginia Annual Conference',
      bodParagraph: '¶629',
      petitionText: 'Extend the maximum duration for rural church support funding from three to five years, with option for two-year extensions based on demonstrated progress toward sustainability.',
      rationale: 'Rural church revitalization requires longer timeframes than current policies allow. Extended support periods enable meaningful community development and sustainable ministry growth.'
    },
    {
      title: 'Simplify Ordination Interview Process for Second Career Candidates',
      submitterName: 'Dr. Robert Taylor',
      submitterEmail: 'rtaylor@email.com',
      submitterOrganization: 'Illinois Great Rivers Annual Conference',
      bodParagraph: '¶310',
      petitionText: 'Streamline the ordination interview process for candidates over 45 with significant professional experience, reducing redundant assessments while maintaining spiritual formation requirements.',
      rationale: 'Second career candidates bring valuable life experience to ministry. Simplified processes recognize their professional competency while ensuring appropriate spiritual preparation for ordained leadership.'
    },
    {
      title: 'Add Gender Identity Protection to Non-Discrimination Policies',
      submitterName: 'Rev. Taylor Brooks',
      submitterEmail: 'tbrooks@email.com',
      submitterOrganization: 'Baltimore-Washington Annual Conference',
      bodParagraph: '¶4',
      petitionText: 'Include gender identity and expression as protected categories in all United Methodist non-discrimination policies for employment, membership, and leadership positions.',
      rationale: 'All people are created in God\'s image and deserve protection from discrimination. Explicit inclusion of gender identity ensures that transgender and non-binary individuals are fully welcomed in church life.'
    },
    {
      title: 'Expand Climate Action Requirements for Conferences',
      submitterName: 'Dr. Jennifer Martinez',
      submitterEmail: 'jmartinez@email.com',
      submitterOrganization: 'Mountain Sky Annual Conference',
      bodParagraph: '¶629',
      petitionText: 'Require all annual conferences to develop and implement climate action plans with measurable goals for carbon reduction, renewable energy adoption, and environmental justice advocacy.',
      rationale: 'Climate change demands coordinated action across all levels of the church. Conference-level commitments ensure systematic progress toward environmental sustainability and creation care.'
    },
    {
      title: 'Require Mental Health First Aid Training for Clergy',
      submitterName: 'Rev. Dr. Mark Johnson',
      submitterEmail: 'mjohnson@email.com',
      submitterOrganization: 'North Georgia Annual Conference',
      bodParagraph: '¶340',
      petitionText: 'Mandate Mental Health First Aid certification for all ordained clergy and require annual conferences to provide training resources and ongoing education opportunities.',
      rationale: 'Mental health crises are increasing in our communities. Clergy need proper training to recognize warning signs, provide appropriate initial response, and connect people with professional resources.'
    },
    {
      title: 'Add Accessibility Standards to Building Requirements',
      submitterName: 'Rev. Susan Rodriguez',
      submitterEmail: 'srodriguez@email.com',
      submitterOrganization: 'New Mexico Annual Conference',
      bodParagraph: '¶2544',
      petitionText: 'Establish mandatory accessibility standards exceeding ADA requirements for all church construction and renovation projects, including sensory accessibility for neurodivergent individuals.',
      rationale: 'True accessibility goes beyond legal compliance. Enhanced standards ensure that all people, regardless of physical or cognitive differences, can fully participate in worship and fellowship.'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Success Modal Overlay */}
      {isSubmitted && (
        <div 
          className="fixed inset-0 overflow-y-auto h-full w-full z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="relative top-20 mx-auto p-8 border max-w-md shadow-xl rounded-lg bg-white">
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
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({
                      title: '',
                      submitterName: '',
                      submitterEmail: '',
                      submitterOrganization: '',
                      bodParagraph: '',
                      petitionText: '',
                      rationale: ''
                    })
                    setSelectedParagraph(null)
                    setAmendmentChanges([])
                    setModifiedParagraphText('')
                  }}
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  Submit Another Petition
                </button>
                <Link href="/" 
                  className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group cursor-pointer"
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
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