'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Committee {
  id: string
  name: string
  abbreviation: string
}

interface Petition {
  id: string
  title: string
  submitter_name: string
  bod_paragraph: string
  petition_type: 'D' | 'C' | 'R' | 'O'
  status: string
  committee_id: string
}

export default function RecorderPage() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [selectedCommittee, setSelectedCommittee] = useState<string>('')
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // Restore selected committee after committees are loaded
  useEffect(() => {
    if (committees.length > 0) {
      const savedCommittee = sessionStorage.getItem('selectedCommittee')
      if (savedCommittee && committees.find(c => c.id === savedCommittee)) {
        setSelectedCommittee(savedCommittee)
      }
    }
  }, [committees])

  const loadData = async () => {
    try {
      const [committeesRes, petitionsRes] = await Promise.all([
        fetch('/api/committees'),
        fetch('/api/petitions')
      ])
      
      const committeesResponse = await committeesRes.json()
      const petitionsResponse = await petitionsRes.json()
      
      setCommittees(committeesResponse.committees || [])
      setPetitions((petitionsResponse.petitions || []).filter((p: Petition) => 
        p.status === 'assigned' || p.status === 'in_committee' || p.status === 'voted' || p.status === 'approved'
      ))
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const selectedCommitteeData = committees.find(c => c.id === selectedCommittee)
  const committeePetitions = petitions.filter(p => p.committee_id === selectedCommittee)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 font-trade">
              Welcome back, Katie!
            </h1>
          </div>
          <p className="text-gray-600">
            Record committee votes and actions for legislative petitions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Committee Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-trade">
                Select Committee
              </h2>
              <div className="space-y-2">
                {committees.map((committee) => {
                  const isSelected = selectedCommittee === committee.id
                  const count = petitions.filter(p => p.committee_id === committee.id).length
                  
                  return (
                    <button
                      key={committee.id}
                      onClick={() => {
                        setSelectedCommittee(committee.id)
                        sessionStorage.setItem('selectedCommittee', committee.id)
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {committee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {count} petition{count !== 1 ? 's' : ''} assigned
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Petition List */}
          <div className="lg:col-span-2">
            {!selectedCommittee ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-trade">
                  Select a Committee
                </h3>
                <p className="text-gray-500">
                  Choose a committee from the left to view assigned petitions
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 font-trade">
                    {selectedCommitteeData?.name} Petitions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {committeePetitions.length} petition{committeePetitions.length !== 1 ? 's' : ''} ready for committee action
                  </p>
                </div>

                {committeePetitions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 font-trade">
                      No Petitions Assigned
                    </h3>
                    <p className="text-gray-500">
                      This committee has no petitions assigned for review
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {committeePetitions.map((petition) => (
                      <div key={petition.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900 font-trade">
                                {petition.title}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                            <p className="text-sm text-gray-600 mb-2">
                              Submitted by: {petition.submitter_name}
                            </p>
                            {petition.bod_paragraph && (
                              <p className="text-sm text-gray-500">
                                BoD Reference: {petition.bod_paragraph}
                              </p>
                            )}
                          </div>
                          {petition.status === 'voted' || petition.status === 'approved' ? (
                            <div className="ml-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                              ✓ Completed
                            </div>
                          ) : (
                            <button 
                              onClick={() => window.location.href = `/recorder/vote/${petition.id}`}
                              className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
                            >
                              Record Vote
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}